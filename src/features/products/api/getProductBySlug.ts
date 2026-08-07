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
  return (JSON.parse(JSON.stringify(docs)) ?? []) as Record<string, unknown>[]
}