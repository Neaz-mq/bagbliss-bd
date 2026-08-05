import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

// ✅ Persists "My Profile" edits to MongoDB. Previously the form only
//    called next-auth's client-side update(), which never reached the
//    database — a refresh (or new login) reverted the name back.
export async function PATCH(req: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ error: 'Please login first' }, { status: 401 })
  }

  const body = await req.json()
  const name  = typeof body.name === 'string' ? body.name.trim() : undefined
  const phone = typeof body.phone === 'string' ? body.phone.trim() : undefined

  if (name !== undefined && name.length < 2) {
    return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 })
  }

  const update: Record<string, string> = {}
  if (name) update.name = name
  if (phone !== undefined) update.phone = phone

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  await connectDB()
  const updatedUser = await User.findByIdAndUpdate(userId, update, {
    new: true,
    runValidators: true,
  })
  if (!updatedUser) {
    return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    name: updatedUser.name,
    phone: updatedUser.phone ?? '',
  })
}