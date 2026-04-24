import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { nanoid } from 'nanoid'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { initiateSSLPayment } from '@/lib/sslcommerz'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const session = await auth()
    const body    = await req.json()

    const {
      items, shipping, delivery, deliveryFee,
      subtotal, total, discount = 0, orderNote = '',
    } = body

    if (!items?.length || !shipping || !total) {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 })
    }

    // Generate unique transaction ID
    const tranId = `BB-${nanoid(10).toUpperCase()}`

    // Create order with pending payment status
    const order = await Order.create({
      userId:        session?.user?.id ?? null,
      guestEmail:    shipping.email    ?? null,
      items,
      shipping,
      delivery,
      deliveryFee,
      payment:       'sslcommerz',
      subtotal,
      discount,
      total,
      status:        'pending',
      paymentStatus: 'unpaid',
      orderNote,
      tranId,
    })

    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

    // Build SSL payload
    const sslPayload = {
      tran_id:          tranId,
      total_amount:     total,
      currency:         'BDT',
      success_url:      `${baseUrl}/api/payment/success`,
      fail_url:         `${baseUrl}/api/payment/fail`,
      cancel_url:       `${baseUrl}/api/payment/cancel`,
      ipn_url:          `${baseUrl}/api/payment/ipn`,
      product_name:     items.map((i: { name: string }) => i.name).join(', ').slice(0, 200),
      product_category: 'Bags',
      product_profile:  'general',
      cus_name:         shipping.fullName,
      cus_email:        shipping.email || 'customer@bagbliss.com.bd',
      cus_phone:        shipping.phone,
      cus_add1:         shipping.address,
      cus_city:         shipping.district,
      cus_country:      'Bangladesh',
      ship_name:        shipping.fullName,
      ship_add1:        shipping.address,
      ship_city:        shipping.district,
      ship_country:     'Bangladesh',
      shipping_method:  'Courier',
      num_of_item:      items.reduce((a: number, i: { quantity: number }) => a + i.quantity, 0),
      value_a:          String(order._id),   // pass orderId through payment
    }

    const sslResponse = await initiateSSLPayment(sslPayload)

    if (sslResponse.status !== 'SUCCESS' || !sslResponse.GatewayPageURL) {
      // Delete the pending order if SSL init fails
      await Order.findByIdAndDelete(order._id)
      return NextResponse.json(
        { error: sslResponse.failedreason ?? 'Payment gateway error' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success:        true,
      orderId:        order._id,
      orderNumber:    order.orderNumber,
      gatewayUrl:     sslResponse.GatewayPageURL,
    })
  } catch (err) {
    console.error('[PAYMENT INITIATE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}