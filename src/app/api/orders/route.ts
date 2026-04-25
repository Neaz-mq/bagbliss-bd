import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { sendOrderEmails } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const session = await auth()
    const body    = await req.json()

    const orderNumber = `BB${Date.now().toString().slice(-6)}`

    const order = await Order.create({
      userId:      session?.user?.id   ?? null,
      guestEmail:  body.shipping?.email ?? null,
      orderNumber,
      items:       body.items,
      shipping:    body.shipping,
      delivery:    body.delivery,
      deliveryFee: body.deliveryFee,
      payment:     body.payment,
      subtotal:    body.subtotal,
      total:       body.total,
      orderNote:   body.orderNote ?? '',
      status:      'processing',
      paymentStatus: body.payment === 'cod' ? 'unpaid' : 'unpaid',
    })

    // ── Send emails (non-blocking — never fails the order) ──────────────
    sendOrderEmails({
      orderNumber:   order.orderNumber,
      customerName:  body.shipping.fullName,
      customerEmail: body.shipping.email ?? session?.user?.email ?? '',
      items:         body.items,
      shipping:      body.shipping,
      subtotal:      body.subtotal,
      deliveryFee:   body.deliveryFee,
      total:         body.total,
      payment:       body.payment,
      delivery:      body.delivery,
      orderNote:     body.orderNote ?? '',
      createdAt:     order.createdAt.toISOString(),
    }).catch(err => console.error('[EMAIL] Failed to send order emails:', err))

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