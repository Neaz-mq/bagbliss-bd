import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

const DEFAULT_CATEGORIES = [
  { value: 'mini-crossbody', label: 'Mini Crossbody', emoji: '👛', description: 'Compact crossbody bags for everyday use' },
  { value: 'chain-strap',    label: 'Chain Strap',    emoji: '✨', description: 'Bags with elegant chain straps' },
  { value: 'leather',        label: 'Leather',        emoji: '💼', description: 'Premium genuine and vegan leather bags' },
  { value: 'canvas',         label: 'Canvas',         emoji: '🎒', description: 'Durable and casual canvas bags' },
  { value: 'party',          label: 'Party & Evening', emoji: '💖', description: 'Glamorous bags for special occasions' },
]

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user?.role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const sp     = new URL(req.url).searchParams
  const withStats = sp.get('stats') !== 'false'

  if (!withStats) {
    return NextResponse.json({ categories: DEFAULT_CATEGORIES })
  }

  // Aggregate product counts per category
  const stats = await Product.aggregate([
    {
      $group: {
        _id:          '$category',
        total:        { $sum: 1 },
        active:       { $sum: { $cond: ['$isActive', 1, 0] } },
        featured:     { $sum: { $cond: ['$isFeatured', 1, 0] } },
        flashSale:    { $sum: { $cond: ['$isFlashSale', 1, 0] } },
        totalStock:   { $sum: '$totalStock' },
        totalSold:    { $sum: '$soldCount' },
        avgPrice:     { $avg: '$price' },
        minPrice:     { $min: '$price' },
        maxPrice:     { $max: '$price' },
      },
    },
  ])

  const statsMap = Object.fromEntries(stats.map(s => [s._id, s]))

  const categories = DEFAULT_CATEGORIES.map(cat => ({
    ...cat,
    stats: statsMap[cat.value] ?? {
      total: 0, active: 0, featured: 0, flashSale: 0,
      totalStock: 0, totalSold: 0, avgPrice: 0, minPrice: 0, maxPrice: 0,
    },
  }))

  return NextResponse.json({ categories })
}