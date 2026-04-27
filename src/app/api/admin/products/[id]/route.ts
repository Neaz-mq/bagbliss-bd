import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { invalidate, CACHE_KEYS } from '@/lib/redis'

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

  const body    = await req.json()
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