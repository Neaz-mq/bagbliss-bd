import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { cached } from '@/lib/redis'

type Row = { _id: string; count: number; image?: unknown }

// 'shop:' prefix — অ্যাডমিন প্রোডাক্ট বদলালে invalidatePattern('shop:*') এটাও মুছে দেয়।
export async function GET() {
  const categories = await cached('shop:categories', async () => {
    await connectDB()
    const rows = await Product.aggregate<Row>([
      { $match: { isActive: true, category: { $nin: [null, ''] } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          latest: { $max: '$createdAt' },
          image: { $first: { $arrayElemAt: ['$images', 0] } },
        },
      },
      { $sort: { latest: -1 } },
    ])

    return rows.map((r) => {
      const img = r.image
      const url =
        typeof img === 'string'
          ? img
          : img && typeof img === 'object'
            ? String(
                (img as Record<string, unknown>).url ??
                  (img as Record<string, unknown>).secure_url ??
                  ''
              )
            : ''
      return { category: r._id, count: r.count, image: url }
    })
  }, 300)

  return NextResponse.json(
    { categories },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
  )
}