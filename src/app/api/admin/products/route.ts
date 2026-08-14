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

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function uniqueSlug(name: string) {
  const base = slugify(name) || 'product'
  let slug = base
  let i = 1
  // Keep trying until we find a slug that isn't taken (handles duplicate product names)
  while (await Product.exists({ slug })) {
    slug = `${base}-${i}`
    i++
  }
  return slug
}

export async function GET(req: NextRequest) {
  if (await guard())
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const sp        = new URL(req.url).searchParams
  const page      = parseInt(sp.get('page') ?? '1')
  const limit     = parseInt(sp.get('limit') ?? '12')
  const search    = sp.get('search') ?? ''
  const category  = sp.get('category') ?? ''
  const sort      = sp.get('sort') ?? 'newest'
  const featured  = sp.get('featured') ?? ''
  const flashSale = sp.get('flashSale') ?? ''
  const status    = sp.get('status') ?? '' // 'active' | 'inactive' | ''

  // Admin view: no forced isActive filter — admin should see everything by default.
  const q: Record<string, unknown> = {}
  if (status === 'active')   q.isActive = true
  if (status === 'inactive') q.isActive = false
  if (search) q.$or = [{ name: { $regex: search, $options: 'i' } }, { tags: { $in: [new RegExp(search, 'i')] } }]
  if (category) q.category = category
  if (featured === 'true') q.isFeatured = true
  if (flashSale === 'true') q.isFlashSale = true

  const sortMap: Record<string, [string, 1 | -1][]> = {
    newest:     [['createdAt', -1]],
    price_asc:  [['price', 1]],
    price_desc: [['price', -1]],
    popular:    [['soldCount', -1]],
    rating:     [['rating', -1]],
  }
  const sortObj = sortMap[sort] ?? sortMap.newest

  const [products, total] = await Promise.all([
    Product.find(q).sort(sortObj).skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(q),
  ])

  return NextResponse.json({ products, total, pages: Math.ceil(total / limit), page })
}

export async function POST(req: NextRequest) {
  if (await guard())
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const body = await req.json()

  if (!body?.name?.trim() || body?.price === undefined || body?.price === null)
    return NextResponse.json({ error: 'Name and price are required' }, { status: 400 })

  const slug = await uniqueSlug(body.name)

  const product = await Product.create({
    ...body,
    slug,
  })

  await invalidate(
    CACHE_KEYS.products,
    CACHE_KEYS.featuredProducts,
    CACHE_KEYS.flashSale,
    CACHE_KEYS.adminStats,
  )

  return NextResponse.json({ product }, { status: 201 })
}