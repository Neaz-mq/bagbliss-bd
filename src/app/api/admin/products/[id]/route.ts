import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { invalidate, CACHE_KEYS } from '@/lib/redis'
import { uniqueSlug } from '@/lib/slug'

async function guard() {
  const session = await auth()
  return !session || session.user?.role !== 'admin'
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (await guard())
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const body = await req.json()

  // Slug is always derived from the name on the server — never trust a client-sent slug.
  delete body.slug

  const existing = await Product.findById(id).select('name slug').lean()
  if (!existing)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const oldSlug = existing.slug as string
  let newSlug = oldSlug

  // Only regenerate when the name actually changed (toggles like isActive send no name).
  if (typeof body.name === 'string' && body.name.trim() && body.name.trim() !== existing.name) {
    newSlug   = await uniqueSlug(body.name, id)
    body.slug = newSlug
  }

  const product = await Product.findByIdAndUpdate(
    id,
    { $set: body },
    { new: true }
  ).lean()

  if (!product)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await invalidate(
    CACHE_KEYS.products,
    CACHE_KEYS.featuredProducts,
    CACHE_KEYS.flashSale,
    CACHE_KEYS.adminStats,
    CACHE_KEYS.product(oldSlug),
    ...(newSlug !== oldSlug ? [CACHE_KEYS.product(newSlug)] : []),
  )

  return NextResponse.json({ product })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (await guard())
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const product = await Product.findByIdAndDelete(id)
  if (!product)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await invalidate(
    CACHE_KEYS.products,
    CACHE_KEYS.featuredProducts,
    CACHE_KEYS.flashSale,
    CACHE_KEYS.adminStats,
    CACHE_KEYS.product(product.slug),
  )

  return NextResponse.json({ success: true })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (await guard())
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const product = await Product.findById(id).lean()
  if (!product)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ product })
}