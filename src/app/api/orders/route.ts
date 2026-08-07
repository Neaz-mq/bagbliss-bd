import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import {
  OrderInputSchema,
  priceOrder,
  reserveStock,
  releaseStock,
  OrderError,
  type Reserved,
} from '@/features/orders/buildOrder'
import { sendOrderEmails } from '@/lib/email'
import { serverEmit } from '@/lib/socket'

export async function POST(req: NextRequest) {
  let reserved: Reserved[] = []

  try {
    await connectDB()
    const session = await auth()

    // ── ১. ইনপুট যাচাই ────────────────────────────────────────────────
    const parsed = OrderInputSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid order data',
          details: parsed.error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 }
      )
    }
    const input = parsed.data

    // ── ২. সার্ভারে দাম হিসাব ─────────────────────────────────────────
    const priced = await priceOrder(input)

    // ── ৩. স্টক রিজার্ভ ───────────────────────────────────────────────
    reserved = await reserveStock(priced.items)

    // ── ৪. অর্ডার তৈরি ────────────────────────────────────────────────
    const order = await Order.create({
      userId: session?.user?.id ?? null,
      guestEmail: input.shipping.email || null,
      orderNumber: `BB${nanoid(8).toUpperCase()}`,
      items: priced.items,
      shipping: input.shipping,
      delivery: input.delivery,
      deliveryFee: priced.deliveryFee,
      payment: input.payment,
      subtotal: priced.subtotal,
      total: priced.total,
      orderNote: input.orderNote,
      status: 'processing',
      paymentStatus: 'unpaid',
    })

    reserved = [] // সফল — রোলব্যাক দরকার নেই

    // ── ৫. Socket + ইমেইল (blocking নয়) ──────────────────────────────
    serverEmit(
      'order:new',
      {
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        customerName: input.shipping.fullName,
        total: priced.total,
        payment: input.payment,
        items: priced.items.reduce((a, i) => a + i.quantity, 0),
        createdAt: order.createdAt.toISOString(),
      },
      'admin'
    ).catch((err) => console.error('[SOCKET]', err))

    sendOrderEmails({
      orderNumber: order.orderNumber,
      customerName: input.shipping.fullName,
      customerEmail: input.shipping.email || session?.user?.email || '',
      items: priced.items,
      shipping: input.shipping,
      subtotal: priced.subtotal,
      deliveryFee: priced.deliveryFee,
      total: priced.total,
      payment: input.payment,
      delivery: input.delivery,
      orderNote: input.orderNote,
      createdAt: order.createdAt.toISOString(),
    }).catch((err) => console.error('[EMAIL] order email failed:', err))

    return NextResponse.json(
      {
        success: true,
        order: {
          _id: order._id.toString(),
          orderNumber: order.orderNumber,
          subtotal: priced.subtotal,
          deliveryFee: priced.deliveryFee,
          total: priced.total,
          status: order.status,
          paymentStatus: order.paymentStatus,
        },
      },
      { status: 201 }
    )
  } catch (err) {
    await releaseStock(reserved)

    if (err instanceof OrderError) {
      return NextResponse.json(
        { success: false, error: err.message },
        { status: err.status }
      )
    }

    console.error('[POST /api/orders]', err)
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const sp = new URL(req.url).searchParams
    const limit = Math.min(50, Math.max(1, parseInt(sp.get('limit') ?? '20') || 20))
    const page = Math.max(1, parseInt(sp.get('page') ?? '1') || 1)

    const [orders, total] = await Promise.all([
      Order.find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments({ userId: session.user.id }),
    ])

    return NextResponse.json({ success: true, orders, total, page })
  } catch (err) {
    console.error('[GET /api/orders]', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}