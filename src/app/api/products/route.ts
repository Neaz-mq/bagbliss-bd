import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SortOrder } from 'mongoose'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { PUBLIC_FIELDS } from '@/features/products/api/getProductBySlug'
import { cached, CACHE_KEYS } from '@/lib/redis'

/** ReDoS ঠেকাতে regex special chars escape */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function GET(req: NextRequest) {
  await connectDB()

  const sp        = new URL(req.url).searchParams
  const page      = Math.max(1, parseInt(sp.get('page') ?? '1') || 1)
  const limit     = Math.min(48, Math.max(1, parseInt(sp.get('limit') ?? '12') || 12))
  const search    = (sp.get('search') ?? '').trim().slice(0, 100)
  const category  = sp.get('category') ?? ''
  const sort      = sp.get('sort')     ?? 'newest'
  const featured  = sp.get('featured') ?? ''
  const flashSale = sp.get('flashSale') ?? ''
  const priceMin  = sp.get('priceMin') ?? ''
  const priceMax  = sp.get('priceMax') ?? ''
  const isNew     = sp.get('new')      ?? ''
  const inStock   = sp.get('inStock')  ?? ''   // ✅ NEW — আগে উপেক্ষিত ছিল

  const cacheKey = CACHE_KEYS.shopProducts(
    `p${page}-l${limit}-s${search}-c${category}-sort${sort}-f${featured}-fs${flashSale}-pmin${priceMin}-pmax${priceMax}-new${isNew}-stock${inStock}`
  )

  const ttl = search ? 0 : 300

  const result = await cached(
    cacheKey,
    async () => {
      const q: Record<string, unknown> = { isActive: true }

      // Search — name, tags, এবং color name তিন জায়গায়।
      // ✅ escapeRegex ছাড়া ইউজারের ইনপুট সরাসরি RegExp এ গেলে
      // "(a+)+$" জাতীয় pattern দিয়ে ReDoS আক্রমণ সম্ভব ছিল।
      if (search) {
        const re = new RegExp(escapeRegex(search), 'i')
        q.$or = [
          { name: { $regex: re } },
          { tags: { $in: [re] } },
          { 'colors.name': { $regex: re } },
        ]
      }

      if (category) q.category = category
      if (featured  === 'true') q.isFeatured  = true
      if (flashSale === 'true') q.isFlashSale = true

      // ✅ NEW — stock ফিল্টার এখন DB লেভেলে, client-side নয়।
      // আগে ShopClient এই param পাঠাত কিন্তু রুট উপেক্ষা করত, ফলে
      // ফিল্টার হত শুধু বর্তমান পেজের ১২টার মধ্যে — pagination ভুল হত।
      if (inStock === 'true') q.totalStock = { $gt: 0 }

      if (isNew === 'true') {
        const NEW_ARRIVAL_WINDOW_DAYS = 30
        const cutoff = new Date(Date.now() - NEW_ARRIVAL_WINDOW_DAYS * 24 * 60 * 60 * 1000)
        q.createdAt = { $gte: cutoff }
      }

      if (priceMin || priceMax) {
        const priceQuery: Record<string, number> = {}
        if (priceMin) priceQuery.$gte = Number(priceMin)
        if (priceMax) priceQuery.$lte = Number(priceMax)
        q.price = priceQuery
      }

      const sortMap: Record<string, Record<string, SortOrder>> = {
        newest:     { createdAt: -1 },
        oldest:     { createdAt: 1 },
        price_asc:  { price: 1 },
        price_desc: { price: -1 },
        popular:    { soldCount: -1 },
        rating:     { rating: -1 },
      }

      const [products, total] = await Promise.all([
        Product.find(q)
          .select(PUBLIC_FIELDS)          // ✅ শুধু পাবলিক ফিল্ড
          .sort(sortMap[sort] ?? sortMap.newest)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Product.countDocuments(q),
      ])

      return {
        products,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
        page,
      }
    },
    ttl
  )

  return NextResponse.json(result)
}