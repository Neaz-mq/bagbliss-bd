import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Facebook from 'next-auth/providers/facebook'
import Credentials from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import clientPromise from '@/lib/mongoClient'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { authConfig } from '@/auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: 'bagbliss',
  }),
  providers: [
    // ── Google ────────────────────────────────────────────────────────
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id:    profile.sub,
          name:  profile.name,
          email: profile.email,
          image: profile.picture,
          role:  'user',
        }
      },
    }),

    // ── Facebook ──────────────────────────────────────────────────────
    Facebook({
      clientId:     process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      profile(profile) {
        return {
          id:    profile.id,
          name:  profile.name,
          email: profile.email,
          image: profile.picture?.data?.url ?? null,
          role:  'user',
        }
      },
    }),

    // ── Email / Password ──────────────────────────────────────────────
    Credentials({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        await connectDB()

        const user = await User.findOne({ email: credentials.email })
          .select('+password')

        if (!user || !user.password) {
          throw new Error('Invalid email or password')
        }

        const isValid = await user.comparePassword(credentials.password as string)
        if (!isValid) {
          throw new Error('Invalid email or password')
        }

        return {
          id:    user._id.toString(),
          name:  user.name,
          email: user.email,
          image: user.avatar ?? user.image ?? null,
          role:  user.role,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // On first sign-in
      if (user) {
        token.id   = user.id
        token.role = (user as { role?: string }).role ?? 'user'
      }

      // For OAuth providers — sync role from DB
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        await connectDB()
        const dbUser = await User.findOne({ email: token.email })
        if (dbUser) {
          token.id   = dbUser._id.toString()
          token.role = dbUser.role
        }
      }

      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id   = token.id   as string
        session.user.role = token.role as string
      }
      return session
    },
  },
})