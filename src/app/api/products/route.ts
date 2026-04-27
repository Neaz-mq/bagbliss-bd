import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SortOrder } from 'mongoose'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { cached, CACHE_KEYS } from '@/lib/redis'

export async function GET(req: NextRequest) {
  await connectDB()

  const sp       = new URL(req.url).searchParams
  const page     = parseInt(sp.get('page')     ?? '1')
  const limit    = parseInt(sp.get('limit')    ?? '12')
  const search   = sp.get('search')   ?? ''
  const category = sp.get('category') ?? ''
  const sort     = sp.get('sort')     ?? 'newest'
  const featured = sp.get('featured') ?? ''
  const flashSale= sp.get('flashSale') ?? ''

  const cacheKey = CACHE_KEYS.shopProducts(
    `p${page}-l${limit}-s${search}-c${category}-sort${sort}-f${featured}-fs${flashSale}`
  )

  const ttl = search ? 0 : 300

  const result = await cached(
    cacheKey,
    async () => {
      const q: Record<string, unknown> = { isActive: true }
      if (search)   q.$or = [{ name: { $regex: search, $options: 'i' } }, { tags: { $in: [new RegExp(search, 'i')] } }]
      if (category) q.category = category
      if (featured  === 'true') q.isFeatured  = true
      if (flashSale === 'true') q.isFlashSale = true

      const sortMap: Record<string, Record<string, SortOrder>> = {
        newest:     { createdAt: -1 },
        price_asc:  { price: 1 },
        price_desc: { price: -1 },
        popular:    { soldCount: -1 },
        rating:     { rating: -1 },
      }

      const [products, total] = await Promise.all([
        Product.find(q).sort(sortMap[sort] ?? sortMap.newest).skip((page - 1) * limit).limit(limit).lean(),
        Product.countDocuments(q),
      ])

      return { products, total, pages: Math.ceil(total / limit), page }
    },
    ttl
  )

  return NextResponse.json(result)
}