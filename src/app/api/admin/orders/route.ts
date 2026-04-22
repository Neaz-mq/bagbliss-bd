import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  const { searchParams } = new URL(req.url)
  const page     = Math.max(1, parseInt(searchParams.get('page')   ?? '1'))
  const limit    = Math.min(50, parseInt(searchParams.get('limit')  ?? '20'))
  const status   = searchParams.get('status')   ?? ''
  const search   = searchParams.get('search')   ?? ''
  const payment  = searchParams.get('payment')  ?? ''
  const sort     = searchParams.get('sort')     ?? '-createdAt'

  // Build filter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {}
  if (status)  filter.status  = status
  if (payment) filter.payment = payment
  if (search) {
    filter.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'shipping.fullName': { $regex: search, $options: 'i' } },
      { 'shipping.phone': { $regex: search, $options: 'i' } },
      { guestEmail: { $regex: search, $options: 'i' } },
    ]
  }

  const skip = (page - 1) * limit

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ])

  return NextResponse.json({
    orders,
    total,
    page,
    pages: Math.ceil(total / limit),
    limit,
  })
}