import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// কাস্টমার তার নিজের অর্ডারের লাইভ আপডেট শুনতে চাইলে এখান থেকে ৫ মিনিটের
// টোকেন নেয়। সঠিক orderId + accessToken (order-success লিংকের `t`) না দিলে
// টোকেন মিলবে না — তাই অন্যের অর্ডারের রুমে ঢোকা যাবে না।
export async function GET(req: NextRequest) {
  const secret = process.env.SOCKET_JWT_SECRET
  if (!secret) {
    console.error('[order-socket-token] SOCKET_JWT_SECRET is not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const ip = getClientIp(req)
  const limit = await rateLimit(`order-socket-token:${ip}`, 30, 15 * 60)
  if (!limit.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const sp = new URL(req.url).searchParams
  const id = sp.get('id') ?? ''
  const t = sp.get('t') ?? ''

  if (!/^[0-9a-fA-F]{24}$/.test(id) || !t || t.length > 200) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  await connectDB()
  // accessToken স্ট্রিং হিসেবে যাচাই — অবজেক্ট ইনজেকশন ঠেকাতে String() ব্যবহার
  const exists = await Order.exists({ _id: id, accessToken: String(t) })
  if (!exists) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const token = jwt.sign({ scope: 'order-socket', orderId: id }, secret, {
    expiresIn: '5m',
  })
  return NextResponse.json({ token })
}