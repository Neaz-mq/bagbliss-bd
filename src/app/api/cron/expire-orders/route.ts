import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { cancelUnpaidOrder } from '@/lib/paymentFlow'

export const dynamic = 'force-dynamic'

const EXPIRE_AFTER_MIN = 30

// কাস্টমার পেমেন্ট পেজ ছেড়ে চলে গেলে অর্ডার unpaid থেকে যায় আর স্টক আটকে থাকে।
// এই রুট ৩০ মিনিটের পুরনো unpaid অনলাইন-পেমেন্ট অর্ডার বাতিল করে স্টক ফেরত দেয়।
// Vercel Cron নিজে `Authorization: Bearer $CRON_SECRET` পাঠায়।
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  const cutoff = new Date(Date.now() - EXPIRE_AFTER_MIN * 60 * 1000)
  const stale = await Order.find({
    payment: 'sslcommerz',
    paymentStatus: 'unpaid',
    status: 'pending',
    createdAt: { $lt: cutoff },
    tranId: { $ne: null },
  })
    .select('tranId')
    .limit(200)
    .lean<{ tranId: string }[]>()

  let cancelled = 0
  for (const o of stale) {
    if (await cancelUnpaidOrder(o.tranId, 'cancelled')) cancelled++
  }

  return NextResponse.json({ checked: stale.length, cancelled })
}
