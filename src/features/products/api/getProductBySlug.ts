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
  limit?: number
}

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  popular: { soldCount: -1 },
  rating: { rating: -1 },
}

export async function getProducts(q: ProductQuery = {}) {
  await connectDB()

  const filter: Record<string, unknown> = { isActive: true }

  if (q.category) filter.category = q.category
  if (q.filter === 'flash-sale') filter.isFlashSale = true
  if (q.filter === 'featured') filter.isFeatured = true
  if (q.search) filter.$text = { $search: q.search }

  if (q.minPrice != null || q.maxPrice != null) {
    filter.price = {
      ...(q.minPrice != null && { $gte: q.minPrice }),
      ...(q.maxPrice != null && { $lte: q.maxPrice }),
    }
  }

  // 'new' ফিল্টার — গত ৩০ দিনে যোগ হওয়া
  if (q.filter === 'new') {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    filter.createdAt = { $gte: cutoff }
  }

  let query = Product.find(filter)
    .select(PUBLIC_FIELDS)
    .sort(SORT_MAP[q.sort ?? 'newest'] ?? SORT_MAP.newest)

  if (q.limit) query = query.limit(q.limit)

  const docs = await query.lean()
  return serializeMany(docs)
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