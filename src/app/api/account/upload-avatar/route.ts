import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import crypto from 'crypto'

// ✅ Any logged-in user (not just admin) can upload their own avatar.
//    Product-image uploads still go through /api/admin/upload (admin-only).
export async function POST(req: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ error: 'Please login first' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  // Basic guardrails: only images, max 5MB
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Image must be under 5MB' }, { status: 400 })
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey    = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 })
  }

  const timestamp = Math.round(Date.now() / 1000)
  const folder    = 'bagbliss/avatars'
  // Overwrite the same public_id per user so old avatars don't pile up in Cloudinary
  const publicId  = `user_${userId}`
  const toSign    = `folder=${folder}&overwrite=true&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
  const signature = crypto.createHash('sha1').update(toSign).digest('hex')

  const fd = new FormData()
  fd.append('file',       file)
  fd.append('api_key',    apiKey)
  fd.append('timestamp',  String(timestamp))
  fd.append('signature',  signature)
  fd.append('folder',     folder)
  fd.append('public_id',  publicId)
  fd.append('overwrite',  'true')

  const res  = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: fd,
  })
  const data = await res.json()
  if (!res.ok) {
    return NextResponse.json({ error: data.error?.message ?? 'Upload failed' }, { status: 500 })
  }

  await connectDB()
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { avatar: data.secure_url },
    { new: true }
  )
  if (!updatedUser) {
    return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
  }

  return NextResponse.json({ success: true, url: data.secure_url })
}