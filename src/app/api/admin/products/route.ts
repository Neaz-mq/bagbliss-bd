import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user?.role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const sp       = new URL(req.url).searchParams
  const page     = parseInt(sp.get('page')     ?? '1')
  const limit    = parseInt(sp.get('limit')    ?? '20')
  const search   = sp.get('search')   ?? ''
  const category = sp.get('category') ?? ''
  const status   = sp.get('status')   ?? ''

  const q: Record<string, unknown> = {}
  if (search)   q.$or = [{ name: { $regex: search, $options: 'i' } }, { tags: { $in: [new RegExp(search, 'i')] } }]
  if (category) q.category = category
  if (status === 'active')   q.isActive = true
  if (status === 'inactive') q.isActive = false

  const [products, total] = await Promise.all([
    Product.find(q).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(q),
  ])

  return NextResponse.json({ products, total, pages: Math.ceil(total / limit), page })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user?.role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const body = await req.json()

  // Generate unique slug
  const base = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  let slug = base, counter = 1
  while (await Product.findOne({ slug })) slug = `${base}-${counter++}`

  const product = await Product.create({ ...body, slug })
  return NextResponse.json({ product }, { status: 201 })
}