import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Order from '@/models/Order'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session || session.user?.role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const user = await User.findById(params.id)
    .select('name email image createdAt')
    .lean()

  if (!user)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const orders = await Order.find({ userId: String(params.id) })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('orderNumber total status createdAt items')
    .lean()

  return NextResponse.json({ user, orders })
}