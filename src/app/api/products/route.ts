import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { PipelineStage } from 'mongoose'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { PUBLIC_FIELDS } from '@/features/products/api/getProductBySlug'
import { cached, CACHE_KEYS } from '@/lib/redis'

/** ReDoS ঠেকাতে regex special chars escape */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * ✅ NEW — কার্ডে ইউজার যে দাম দেখে (flash sale চললে flashSalePrice,
 * নইলে price) — price ফিল্টার ও sort ঠিক সেই দামের ওপরেই চলবে।
 * ShopClient.normalizeProduct() এর লজিকের সাথে হুবহু মেলানো:
 *   isFlashSale && flashSalePrice (truthy) ? flashSalePrice : price
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
  newest:     { createdAt: -1 },
  oldest:     { createdAt: 1 },
  price_asc:  { effectivePrice: 1 },   // ✅ আগে ছিল { price: 1 }
  price_desc: { effectivePrice: -1 },  // ✅ আগে ছিল { price: -1 }
  popular:    { soldCount: -1 },
  rating:     { rating: -1 },
}

/** query param থেকে বৈধ সংখ্যা বের করে; খালি/ভুল হলে null */
function parsePrice(v: string): number | null {
  if (v === '') return null
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? n : null
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

      // ✅ FIX — price ফিল্টার আগে শুধু রেগুলার `price` ফিল্ডে চলত, ফলে
      // flash sale চলা প্রোডাক্ট (যেমন ৳850 দেখাচ্ছে) ৳999–৳1,499 ফিল্টারেও
      // দেখাত। এখন computed `effectivePrice` এর ওপর ফিল্টার হয়।
      const min = parsePrice(priceMin)
      const max = parsePrice(priceMax)

      const base: PipelineStage[] = [
        { $match: q },
        { $addFields: { effectivePrice: EFFECTIVE_PRICE } },
      ]

      if (min !== null || max !== null) {
        const range: Record<string, number> = {}
        if (min !== null) range.$gte = min
        if (max !== null) range.$lte = max
        base.push({ $match: { effectivePrice: range } })
      }

      // _id tie-breaker: একই দামের প্রোডাক্ট থাকলে pagination এ
      // একই আইটেম দুই পেজে আসা বা বাদ পড়া ঠেকায়।
      const sortStage = { ...(SORT_MAP[sort] ?? SORT_MAP.newest), _id: 1 as const }

      const [products, countRows] = await Promise.all([
        Product.aggregate([
          ...base,
          { $sort: sortStage },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          { $project: PROJECTION },    // ✅ শুধু পাবলিক ফিল্ড (effectivePrice বাদ)
        ]),
        Product.aggregate([...base, { $count: 'total' }]),
      ])

      const total: number = countRows[0]?.total ?? 0

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