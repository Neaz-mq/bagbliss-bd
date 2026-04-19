import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'          // ← was '@/auth', now '@/lib/auth'
import connectDB from '@/lib/mongodb'       // ← use your existing connectDB
import Order from '@/models/Order'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const session = await auth()
    const body = await req.json()

    const orderNumber = `BB${Date.now().toString().slice(-6)}`

    const order = await Order.create({
      userId:      session?.user?.id ?? null,
      guestEmail:  body.shipping?.email ?? null,
      orderNumber,
      items:       body.items,
      shipping:    body.shipping,
      delivery:    body.delivery,
      deliveryFee: body.deliveryFee,
      payment:     body.payment,
      subtotal:    body.subtotal,
      total:       body.total,
      orderNote:   body.orderNote,
      status:      'processing',
    })

    return NextResponse.json({ success: true, order }, { status: 201 })
  } catch (err) {
    console.error('Order creation error:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    await connectDB()
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const orders = await Order.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ success: true, orders })
  } catch (err) {
    console.error('Fetch orders error:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}