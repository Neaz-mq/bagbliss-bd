import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user?.role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey    = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret)
    return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 })

  const timestamp = Math.round(Date.now() / 1000)
  const folder    = 'bagbliss/products'
  const toSign    = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
  const signature = crypto.createHash('sha1').update(toSign).digest('hex')

  const fd = new FormData()
  fd.append('file',      file)
  fd.append('api_key',   apiKey)
  fd.append('timestamp', String(timestamp))
  fd.append('signature', signature)
  fd.append('folder',    folder)

  const res  = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd })
  const data = await res.json()
  if (!res.ok) return NextResponse.json({ error: data.error?.message ?? 'Upload failed' }, { status: 500 })

  return NextResponse.json({ url: data.secure_url, publicId: data.public_id })
}