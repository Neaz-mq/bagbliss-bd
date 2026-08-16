import { z } from 'zod'
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Facebook from 'next-auth/providers/facebook'
import Credentials from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import clientPromise from '@/lib/mongoClient'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { authConfig } from '@/auth.config'
import { rateLimit, resetRateLimit, getClientIp } from '@/lib/rate-limit'

// ── Login input contract ────────────────────────────────────────────────
// `authorize()` receives `Partial<Record<string, unknown>>` — the shape is
// NOT guaranteed at compile time or runtime. Without this, `credentials.email`
// could be any JSON value (e.g. an object like `{ "$ne": null }`) sent by a
// crafted request to the credentials callback, which would flow straight
// into a Mongoose query. Validating as a plain string closes that off.
const LoginCredentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(200),
})

// Generic on purpose — never reveal *why* a login failed (wrong email vs.
// wrong password vs. rate-limited) beyond what's necessary, to avoid
// account enumeration.
const INVALID_CREDENTIALS_MSG = 'Invalid email or password'
const RATE_LIMITED_MSG = 'Too many login attempts. Please try again later.'

// ── helper: verify Google ID token with Google's public endpoint ──────────
async function verifyGoogleToken(idToken: string) {
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
  )
  if (!res.ok) return null
  const payload = await res.json()
  if (payload.aud !== process.env.GOOGLE_CLIENT_ID) return null
  return {
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    image: payload.picture,
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: 'bagbliss',
  }),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: 'user',
        }
      },
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.picture?.data?.url,
          role: 'user',
        }
      },
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        const ip = getClientIp(request)

        // ── 1. Coarse per-IP guard ──────────────────────────────────────
        // Catches malformed/scripted flooding (and credential-stuffing
        // spread across many different emails) before we even touch Zod
        // or the database. 20 attempts / 15 min per IP.
        const ipGuard = await rateLimit(`login-ip:${ip}`, 20, 15 * 60)
        if (!ipGuard.success) {
          throw new Error(RATE_LIMITED_MSG)
        }

        // ── 2. Validate & coerce input shape ────────────────────────────
        // `credentials` is untyped input from the request — reject anything
        // that isn't a plain, reasonably-sized email/password string pair
        // (also rejects non-string payloads, closing off NoSQL-injection
        // style queries such as `{ email: { "$ne": null } }`).
        const parsed = LoginCredentialsSchema.safeParse(credentials)
        if (!parsed.success) {
          throw new Error(INVALID_CREDENTIALS_MSG)
        }
        const { email, password } = parsed.data

        // ── 3. Tight per-account guard ──────────────────────────────────
        // 5 attempts / 15 min per (ip, email) pair — brute force / credential
        // stuffing against one specific account.
        const accountKey = `login:${ip}:${email}`
        const accountGuard = await rateLimit(accountKey, 5, 15 * 60)
        if (!accountGuard.success) {
          throw new Error(RATE_LIMITED_MSG)
        }

        await connectDB()

        const user = await User.findOne({ email }).select('+password')

        if (!user || !user.password) {
          throw new Error(INVALID_CREDENTIALS_MSG)
        }

        const isPasswordValid = await user.comparePassword(password)

        if (!isPasswordValid) {
          throw new Error(INVALID_CREDENTIALS_MSG)
        }

        // ── 4. Success — clear this account's counter ───────────────────
        // So a legitimate user isn't left rate-limited by their own earlier
        // typos, or by other people behind the same NAT/IP.
        await resetRateLimit(accountKey)

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.avatar,
          role: user.role,
        }
      },
    }),

    // ── Google One Tap ────────────────────────────────────────────────────
    Credentials({
      id: 'google-one-tap',
      name: 'Google One Tap',
      credentials: { credential: { type: 'text' } },
      async authorize(creds) {
        const parsed = z
          .object({ credential: z.string().min(1).max(4096) })
          .safeParse(creds)
        if (!parsed.success) return null

        // Verify the Google ID token
        const googleUser = await verifyGoogleToken(parsed.data.credential)
        if (!googleUser) {
          console.error('[google-one-tap] Token verification failed')
          return null
        }

        const db = await clientPromise
        const users = db.db('bagbliss').collection('users')

        // Upsert: create if not exists, always update name/image/provider
        await users.updateOne(
          { email: googleUser.email },
          {
            $setOnInsert: {
              createdAt: new Date(),
              role: 'user',
              emailVerified: new Date(),
            },
            $set: {
              name: googleUser.name,
              image: googleUser.image,
              provider: 'google',
              googleId: googleUser.id,
            },
          },
          { upsert: true }
        )

        const dbUser = await users.findOne({ email: googleUser.email })
        if (!dbUser) return null

        return {
          id: dbUser._id.toString(),
          name: googleUser.name,
          email: googleUser.email,
          image: googleUser.image,
          role: dbUser.role ?? 'user',
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // On initial sign-in, attach user fields to the token
      if (user) {
        token.id   = user.id
        token.role = (user as { role?: string }).role ?? 'user'
        token.picture = user.image
      }

      // For OAuth providers (Google / Facebook), fetch user avatar from DB
      // (our custom User.avatar field — set when user uploads a new profile pic)
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        await connectDB()
        const dbUser = await User.findOne({ email: token.email })
        if (dbUser) {
          token.id   = dbUser._id.toString()
          token.role = dbUser.role
          // ✅ FIX 1: Use our custom avatar if it exists (uploaded by user)
          //    Otherwise fall back to the OAuth provider's picture
          token.picture = dbUser.avatar || user?.image
        }
      }

      // ✅ FIX 2: Handle client-side `update()` calls (e.g. from the profile
      //    page after uploading a new avatar) — this merges the update session
      //    into the token
      if (trigger === 'update' && session) {
        if (typeof session.name === 'string')  token.name    = session.name
        if (typeof session.image === 'string') token.picture = session.image
      }

      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id   = token.id as string
        session.user.role = token.role as string
        // ✅ FIX 3: CRITICAL — sync token.picture → session.user.image
        //    Without this, all session updates are lost and you get the
        //    old picture on every refresh/logout-login
        session.user.image = token.picture as string
      }
      return session
    },
  },
})