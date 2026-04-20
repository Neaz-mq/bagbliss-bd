import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Product from '@/models/Product'
import User from '@/models/User'

export async function GET() {
  const session = await auth()
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

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
    // No paymentStatus in your model — sum all orders' totals
    Order.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber total status createdAt')
      .lean(),
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ])

  return NextResponse.json({
    totalOrders,
    totalProducts,
    totalCustomers,
    totalRevenue: revenueResult[0]?.total ?? 0,
    recentOrders,
    ordersByStatus,
  })
}