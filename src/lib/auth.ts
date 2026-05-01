import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Facebook from 'next-auth/providers/facebook'
import Credentials from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import clientPromise from '@/lib/mongoClient'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { authConfig } from '@/auth.config'

// ── helper: verify Google ID token with Google's public endpoint ──────────
async function verifyGoogleToken(idToken: string) {
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
  )
  if (!res.ok) return null
  const payload = await res.json()
  // ✅ Fixed: was AUTH_GOOGLE_ID which doesn't exist in .env.local
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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        await connectDB()

        const user = await User.findOne({
          email: credentials.email,
        }).select('+password')

        if (!user || !user.password) {
          throw new Error('Invalid email or password')
        }

        const isPasswordValid = await user.comparePassword(
          credentials.password as string
        )

        if (!isPasswordValid) {
          throw new Error('Invalid email or password')
        }

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
        if (!creds?.credential) return null

        const user = await verifyGoogleToken(creds.credential as string)
        if (!user) return null

        // Upsert the user in MongoDB
        const db = await clientPromise
        const users = db.db('bagbliss').collection('users')

        await users.updateOne(
          { email: user.email },
          {
            $setOnInsert: { createdAt: new Date(), role: 'user' },
            $set: {
              name: user.name,
              image: user.image,
              provider: 'google',
            },
          },
          { upsert: true }
        )

        const dbUser = await users.findOne({ email: user.email })

        return { ...user, role: dbUser?.role ?? 'user' }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role ?? 'user'
      }
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        await connectDB()
        const dbUser = await User.findOne({ email: token.email })
        if (dbUser) {
          token.id = dbUser._id.toString()
          token.role = dbUser.role
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
})