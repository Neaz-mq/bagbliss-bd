import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import mongoose from 'mongoose'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { invalidate, invalidatePattern, CACHE_KEYS } from '@/lib/redis'
import { sumColorStock } from '@/lib/stock'

type Ctx = { params: Promise<{ id: string }> }

async function isNotAdmin() {
  const session = await auth()
  return !session || session.user?.role !== 'admin'
}

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status })
}

async function bust(slug?: string) {
  const keys = [
    CACHE_KEYS.products,
    CACHE_KEYS.featuredProducts,
    CACHE_KEYS.flashSale,
    CACHE_KEYS.adminStats,
  ]
  if (slug) keys.push(CACHE_KEYS.product(slug))
  await invalidate(...keys).catch((e) => console.error('[CACHE]', e))
  await invalidatePattern('shop:*')
}

// Only these fields can be changed from the admin form.
// slug is intentionally NOT editable — changing it would break existing
// product links; soldCount/rating/reviewCount are managed by the system.
const EDITABLE = [
  'name',
  'description',
  'shortDescription',
  'price',
  'originalPrice',
  'category',
  'images',
  'colors',
  'totalStock',
  'isActive',
  'isFeatured',
  'isFlashSale',
  'flashSalePrice',
  'tags',
] as const

// ── GET /api/admin/products/:id ─────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Ctx) {
  if (await isNotAdmin()) return bad('Unauthorized', 401)

  const { id } = await params
  if (!mongoose.isValidObjectId(id)) return bad('Invalid product id')

  await connectDB()
  const product = await Product.findById(id).lean()
  if (!product) return bad('Product not found', 404)

  return NextResponse.json({ product })
}

// ── PATCH /api/admin/products/:id ───────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (await isNotAdmin()) return bad('Unauthorized', 401)

  const { id } = await params
  if (!mongoose.isValidObjectId(id)) return bad('Invalid product id')

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return bad('Invalid JSON body')
  }

  const update: Record<string, unknown> = {}
  for (const key of EDITABLE) {
    if (body[key] !== undefined) update[key] = body[key]
  }

  if (Object.keys(update).length === 0) return bad('Nothing to update')

  if (typeof update.name === 'string') {
    update.name = update.name.trim()
    if (!update.name) return bad('Name cannot be empty')
  }

  if (update.price !== undefined) {
    const price = Number(update.price)
    if (!Number.isFinite(price) || price < 0) return bad('Invalid price')
    update.price = price
  }

  // When color variants exist, total stock is always their sum.
  if (Array.isArray(update.colors) && update.colors.length > 0) {
    update.totalStock = sumColorStock(update.colors)
  } else if (update.totalStock !== undefined) {
    update.totalStock = Math.max(0, Math.floor(Number(update.totalStock) || 0))
  }

  // Flash sale off → clear its price (same rule as the flash-sale page).
  if (update.isFlashSale === false) update.flashSalePrice = 0

  await connectDB()

  const product = await Product.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true, runValidators: true }
  ).lean()

  if (!product) return bad('Product not found', 404)

  await bust((product as { slug?: string }).slug)

  return NextResponse.json({ product })
}

// ── DELETE /api/admin/products/:id ──────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (await isNotAdmin()) return bad('Unauthorized', 401)

  const { id } = await params
  if (!mongoose.isValidObjectId(id)) return bad('Invalid product id')

  await connectDB()

  const product = await Product.findByIdAndDelete(id).lean()
  if (!product) return bad('Product not found', 404)

  await bust((product as { slug?: string }).slug)

  return NextResponse.json({ success: true })
}