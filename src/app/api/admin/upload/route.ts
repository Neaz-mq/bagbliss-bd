import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import crypto from 'crypto'

function cloudinaryEnv() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey    = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  return { cloudName, apiKey, apiSecret }
}

function isValidHttpUrl(value: string) {
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user?.role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { cloudName, apiKey, apiSecret } = cloudinaryEnv()
  if (!cloudName || !apiKey || !apiSecret)
    return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 })

  const contentType = req.headers.get('content-type') ?? ''
  const folder       = 'bagbliss/products'
  const timestamp    = Math.round(Date.now() / 1000)

  // ---- Path 1: direct file upload (existing behavior) ----
  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

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

  // ---- Path 2: remote image URL — re-upload to Cloudinary instead of ----
  // ---- trusting an arbitrary external domain directly in <Image>.    ----
  if (contentType.includes('application/json')) {
    const body = await req.json().catch(() => null)
    const imageUrl = body?.url

    if (typeof imageUrl !== 'string' || !isValidHttpUrl(imageUrl))
      return NextResponse.json({ error: 'A valid http(s) image URL is required' }, { status: 400 })

    // Cloudinary fetches the remote URL itself (server-to-server) and
    // returns a hosted, trusted res.cloudinary.com URL we can safely
    // pass to next/image without touching remotePatterns per-domain.
    const toSign    = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
    const signature = crypto.createHash('sha1').update(toSign).digest('hex')

    const fd = new FormData()
    fd.append('file',      imageUrl)
    fd.append('api_key',   apiKey)
    fd.append('timestamp', String(timestamp))
    fd.append('signature', signature)
    fd.append('folder',    folder)

    const res  = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data.error?.message ?? 'Could not fetch that image URL' }, { status: 500 })

    return NextResponse.json({ url: data.secure_url, publicId: data.public_id })
  }

  return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 })
}