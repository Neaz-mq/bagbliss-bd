import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { rateLimit } from '@/app/api/admin/rate-limit'

export async function POST(req: NextRequest) {
  // Rate limit: 5 registrations per IP per hour
  const ip     = req.headers.get('x-forwarded-for') ?? 'anonymous'
  const limit  = await rateLimit(`register:${ip}`, 5, 3600)

  if (!limit.success) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429 }
    )
  }

  try {
    await connectDB()

    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    const user = await User.create({ name, email, password, role: 'user' })

    return NextResponse.json({
      success: true,
      user: {
        id:    user._id.toString(),
        name:  user.name,
        email: user.email,
      },
    })
  } catch (err) {
    console.error('[REGISTER]', err)
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}