import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { nanoid } from 'nanoid'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { initiateSSLPayment } from '@/lib/sslcommerz'
import { auth } from '@/lib/auth'
import {
  OrderInputSchema,
  priceOrder,
  reserveStock,
  releaseStock,
  newAccessToken,
  OrderError,
  type Reserved,
} from '@/features/orders/buildOrder'

export async function POST(req: NextRequest) {
  let reserved: Reserved[] = []
  let createdOrderId: string | null = null

  try {
    await connectDB()
    const session = await auth()

    // ── ১. ইনপুট যাচাই ────────────────────────────────────────────────
    const parsed = OrderInputSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        {
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
    // ⚠️ এটাই মূল নিরাপত্তা। আগে total ক্লায়েন্ট থেকে আসত, ফলে
    // যেকোনো ব্যাগ ৳১ টাকায় কেনা যেত।
    const priced = await priceOrder(input)

    // ── ৩. স্টক রিজার্ভ ───────────────────────────────────────────────
    reserved = await reserveStock(priced.items)

    // ── ৪. Pending অর্ডার ─────────────────────────────────────────────
    const tranId = `BB-${nanoid(10).toUpperCase()}`

    const order = await Order.create({
      userId: session?.user?.id ?? null,
      guestEmail: input.shipping.email || null,
      orderNumber: `BB${nanoid(8).toUpperCase()}`,
      accessToken: newAccessToken(),
      items: priced.items,
      shipping: input.shipping,
      delivery: input.delivery,
      deliveryFee: priced.deliveryFee,
      payment: 'sslcommerz',
      subtotal: priced.subtotal,
      discount: 0,
      total: priced.total,
      status: 'pending',
      paymentStatus: 'unpaid',
      orderNote: input.orderNote,
      tranId,
    })

    const orderId = order._id.toString()
    createdOrderId = orderId

    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

    const sslPayload = {
      tran_id: tranId,
      total_amount: priced.total,          // ✅ সার্ভারের হিসাব
      currency: 'BDT',
      success_url: `${baseUrl}/api/payment/success`,
      fail_url: `${baseUrl}/api/payment/fail`,
      cancel_url: `${baseUrl}/api/payment/cancel`,
      ipn_url: `${baseUrl}/api/payment/ipn`,
      product_name: priced.items.map((i) => i.name).join(', ').slice(0, 200),
      product_category: 'Bags',
      product_profile: 'general',
      cus_name: input.shipping.fullName,
      cus_email: input.shipping.email || 'customer@bagbliss.com.bd',
      cus_phone: input.shipping.phone,
      cus_add1: input.shipping.address,
      cus_city: input.shipping.district,
      cus_country: 'Bangladesh',
      ship_name: input.shipping.fullName,
      ship_add1: input.shipping.address,
      ship_city: input.shipping.district,
      ship_country: 'Bangladesh',
      shipping_method: 'Courier',
      num_of_item: priced.items.reduce((a, i) => a + i.quantity, 0),
      // ✅ orderId ব্যবহার — createdOrderId এর টাইপ `string | null`,
      // কিন্তু SSLInitPayload চায় `string | undefined`
      value_a: orderId,
    }

    const sslResponse = await initiateSSLPayment(sslPayload)

    if (sslResponse.status !== 'SUCCESS' || !sslResponse.GatewayPageURL) {
      await Order.findByIdAndDelete(order._id)
      await releaseStock(reserved)
      return NextResponse.json(
        { error: sslResponse.failedreason ?? 'Payment gateway error' },
        { status: 502 }
      )
    }

    reserved = [] // অর্ডার তৈরি হয়ে গেছে — স্টক ওই অর্ডারের সাথে যুক্ত
    createdOrderId = null // catch ব্লক যেন সফল অর্ডার মুছে না ফেলে

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber: order.orderNumber,
      total: priced.total,
      gatewayUrl: sslResponse.GatewayPageURL,
    })
  } catch (err) {
    await releaseStock(reserved)
    if (createdOrderId) {
      await Order.findByIdAndDelete(createdOrderId).catch(() => {})
    }

    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }

    console.error('[PAYMENT INITIATE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}