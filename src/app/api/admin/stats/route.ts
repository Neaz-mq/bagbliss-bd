import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Product from '@/models/Product'
import User from '@/models/User'
import { cached, CACHE_KEYS } from '@/lib/redis'

export async function GET() {
  const session = await auth()
  if (!session || session.user?.role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  // Cache admin stats for 2 minutes
  const stats = await cached(
    CACHE_KEYS.adminStats,
    async () => {
      const [
        totalOrders,
        totalProducts,
        totalCustomers,
        revenueResult,
        recentOrders,
        ordersByStatus,
      ] = await Promise.all([
        Order.countDocuments(),
        Product.countDocuments({ isActive: true }),
        User.countDocuments({ role: 'user' }),
        Order.aggregate([
          { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
        Order.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select('orderNumber total status createdAt shipping')
          .lean(),
        Order.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
      ])

      return {
        totalOrders,
        totalProducts,
        totalCustomers,
        totalRevenue: revenueResult[0]?.total ?? 0,
        recentOrders,
        ordersByStatus,
      }
    },
    120 // 2 min cache
  )

  return NextResponse.json(stats)
}