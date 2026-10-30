import type { PipelineStage } from 'mongoose'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

export const PUBLIC_FIELDS = [
  'name',
  'slug',
  'description',
  'shortDescription',
  'price',
  'originalPrice',
  'category',
  'images',
  'colors',
  'totalStock',
  'isFeatured',
  'isFlashSale',
  'flashSalePrice',
  'rating',
  'reviewCount',
  'soldCount',
  'tags',
  'createdAt',
  'updatedAt',
].join(' ')

/** Mongoose ডকুমেন্টকে plain JSON এ রূপান্তর — client component এ পাঠানোর জন্য */
export function serialize(doc: unknown): Record<string, unknown> | null {
  if (!doc) return null
  return JSON.parse(JSON.stringify(doc))
}

function serializeMany(docs: unknown): Record<string, unknown>[] {
  if (!docs) return []
  return JSON.parse(JSON.stringify(docs)) as Record<string, unknown>[]
}

export async function getProductBySlug(slug: string) {
  await connectDB()
  const doc = await Product.findOne({ slug, isActive: true })
    .select(PUBLIC_FIELDS)
    .lean()
  return serialize(doc)
}

export async function getRelatedProducts(category: string, excludeSlug: string) {
  await connectDB()
  const docs = await Product.find({
    category,
    isActive: true,
    slug: { $ne: excludeSlug },
  })
    .select(PUBLIC_FIELDS)
    .limit(4)
    .lean()
  return serializeMany(docs)
}

// ── Shop / listing query ──────────────────────────────────────────────

export type ProductQuery = {
  category?: string
  filter?: string // 'new' | 'flash-sale' | 'featured'
  sort?: string // 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular' | 'rating'
  search?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  limit?: number
}

/**
 * ✅ FIX — কার্ডে ইউজার যে দাম দেখে (flash sale চললে flashSalePrice, নইলে
 * price) price ফিল্টার ও sort সেই দামের ওপরেই চলবে। আগে শুধু রেগুলার `price`
 * ধরা হত, ফলে ৳850 flash দামের প্রোডাক্ট ৳999–৳1,499 রেঞ্জেও দেখাত।
 * ShopClient.normalizeProduct() ও /api/products এর লজিকের সাথে মেলানো।
 */
const EFFECTIVE_PRICE = {
  $cond: [
    {
      $and: [
        { $eq: ['$isFlashSale', true] },
        { $gt: ['$flashSalePrice', 0] },
      ],
    },
    '$flashSalePrice',
    '$price',
  ],
}

/** PUBLIC_FIELDS ("name slug ...") কে $project এর object এ রূপান্তর */
const PROJECTION: Record<string, 1> = Object.fromEntries(
  PUBLIC_FIELDS.split(' ').filter(Boolean).map((f) => [f, 1 as const])
)

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_asc: { effectivePrice: 1 },
  price_desc: { effectivePrice: -1 },
  popular: { soldCount: -1 },
  rating: { rating: -1 },
}

function buildFilter(q: ProductQuery): Record<string, unknown> {
  const filter: Record<string, unknown> = { isActive: true }

  if (q.category) filter.category = q.category
  if (q.filter === 'flash-sale') filter.isFlashSale = true
  if (q.filter === 'featured') filter.isFeatured = true
  if (q.search) filter.$text = { $search: q.search }

  // price রেঞ্জ এখানে নেই — getProducts() এ effectivePrice এর ওপর প্রয়োগ হয়।

  // 'new' ফিল্টার — গত ৩০ দিনে যোগ হওয়া
  if (q.filter === 'new') {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    filter.createdAt = { $gte: cutoff }
  }

  return filter
}

/** পেজিনেশন সহ প্রোডাক্ট লিস্ট — products + মোট সংখ্যা */
export async function getProducts(q: ProductQuery = {}) {
  await connectDB()

  const filter = buildFilter(q)
  const limit = q.limit ?? 12
  const page = Math.max(1, q.page ?? 1)
  const skip = (page - 1) * limit

  const base: PipelineStage[] = [
    { $match: filter }, // $text থাকলে সেটা অবশ্যই প্রথম stage হতে হবে
    { $addFields: { effectivePrice: EFFECTIVE_PRICE } },
  ]

  if (q.minPrice != null || q.maxPrice != null) {
    const range: Record<string, number> = {}
    if (q.minPrice != null) range.$gte = q.minPrice
    if (q.maxPrice != null) range.$lte = q.maxPrice
    base.push({ $match: { effectivePrice: range } })
  }

  // _id tie-breaker: একই দামের প্রোডাক্টে pagination স্থির রাখে
  const sortStage = {
    ...(SORT_MAP[q.sort ?? 'newest'] ?? SORT_MAP.newest),
    _id: 1 as const,
  }

  // দুটো query একসাথে — একটা রাউন্ড ট্রিপে
  const [docs, countRows] = await Promise.all([
    Product.aggregate([
      ...base,
      { $sort: sortStage },
      { $skip: skip },
      { $limit: limit },
      { $project: PROJECTION }, // শুধু পাবলিক ফিল্ড (effectivePrice বাদ)
    ]),
    Product.aggregate([...base, { $count: 'total' }]),
  ])

  const total: number = countRows[0]?.total ?? 0

  return {
    products: serializeMany(docs),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  }
}

/** ফিল্টার UI এর জন্য — প্রতি category তে কয়টা প্রোডাক্ট */
export async function getCategoryCounts() {
  await connectDB()
  const rows = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ])

  const counts: Record<string, number> = {}
  let total = 0
  for (const r of rows as { _id: string; count: number }[]) {
    counts[r._id] = r.count
    total += r.count
  }
  return { counts, total }
}