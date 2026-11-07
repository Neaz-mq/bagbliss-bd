import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import mongoose from 'mongoose'
import { releaseStock, adjustSold } from '@/features/orders/buildOrder'
import { serverEmit } from '@/lib/socket'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const session = await auth()
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid order id' }, { status: 400 })
  }

  const body = await req.json().catch(() => null)
  const status = body?.status

  // 'review' থেকে অ্যাডমিন ম্যানুয়ালি processing/cancelled করতে পারে
  const allowed = ['processing', 'shipped', 'delivered', 'cancelled']
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const current = await Order.findById(id).lean<{
    status: string; payment: string; paymentStatus: string
  }>()
  if (!current) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // বাতিল অর্ডার আর ফেরানো যায় না (স্টক ইতিমধ্যে ফেরত গেছে)
  if (current.status === 'cancelled') {
    return NextResponse.json(
      { error: 'Cancelled orders cannot be changed' },
      { status: 400 }
    )
  }

  const isPaidOrCod = current.payment === 'cod' || current.paymentStatus === 'paid'

  // টাকা না পাওয়া অনলাইন অর্ডার শিপ/ডেলিভার করা যাবে না
  if ((status === 'shipped' || status === 'delivered') && !isPaidOrCod) {
    return NextResponse.json(
      { error: 'Payment not confirmed for this order' },
      { status: 400 }
    )
  }

  let order

  if (status === 'cancelled') {
    // ⚛️ Atomic: যে request আসলে status বদলাতে পারল শুধু সেই স্টক ফেরত দেবে
    const prev = await Order.findOneAndUpdate(
      { _id: id, status: { $ne: 'cancelled' } },
      { status: 'cancelled' },
      { new: false }
    )
    if (prev) {
      const items = prev.items as { productId: string; quantity: number; color?: string }[]
      await releaseStock(
        items.map((i) => ({ id: i.productId, qty: i.quantity, color: i.color || '' }))
      )
      // বিক্রি গণ্য হয়ে থাকলে (COD বা paid) soldCount ফেরত কমানো
      if (isPaidOrCod) await adjustSold(items, -1)
    }
    order = await Order.findById(id).lean()
  } else {
    order = await Order.findByIdAndUpdate(id, { status }, { new: true }).lean()
  }

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // কাস্টমারের লাইভ ট্র্যাকিং পেজ আপডেট (ব্যর্থ হলেও মূল কাজ আটকাবে না)
  serverEmit('order:updated', { orderId: id, status }, `order:${id}`).catch(() => {})

  return NextResponse.json({ order })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const session = await auth()
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  const order = await Order.findById(id).lean()
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json({ order })
}