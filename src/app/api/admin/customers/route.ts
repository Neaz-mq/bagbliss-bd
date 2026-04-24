import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Order from '@/models/Order'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user?.role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const sp     = new URL(req.url).searchParams
  const page   = parseInt(sp.get('page')  ?? '1')
  const limit  = parseInt(sp.get('limit') ?? '20')
  const search = sp.get('search') ?? ''
  const sort   = sp.get('sort')   ?? '-createdAt'

  const q: Record<string, unknown> = { role: { $ne: 'admin' } }
  if (search) {
    q.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ]
  }

  const [users, total] = await Promise.all([
    User.find(q)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('name email image createdAt role')
      .lean(),
    User.countDocuments(q),
  ])

  // Attach order stats per user
  const userIds = users.map(u => u._id)
  const orderStats = await Order.aggregate([
    { $match: { userId: { $in: userIds.map(String) } } },
    {
      $group: {
        _id:        '$userId',
        orderCount: { $sum: 1 },
        totalSpent: { $sum: '$total' },
        lastOrder:  { $max: '$createdAt' },
      },
    },
  ])

  const statsMap = Object.fromEntries(
    orderStats.map(s => [s._id, s])
  )

  const enriched = users.map(u => ({
    ...u,
    orderCount: statsMap[String(u._id)]?.orderCount ?? 0,
    totalSpent: statsMap[String(u._id)]?.totalSpent ?? 0,
    lastOrder:  statsMap[String(u._id)]?.lastOrder  ?? null,
  }))

  return NextResponse.json({
    customers: enriched,
    total,
    pages: Math.ceil(total / limit),
    page,
  })
}