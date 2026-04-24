import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { validateSSLPayment } from '@/lib/sslcommerz'

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    // SSLCommerz sends POST with form data
    const form      = await req.formData()
    const val_id    = form.get('val_id')     as string
    const tran_id   = form.get('tran_id')    as string
    const value_a   = form.get('value_a')    as string   // our orderId
    const card_type = form.get('card_type')  as string
    const bank_tran_id = form.get('bank_tran_id') as string
    const status    = form.get('status')     as string

    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

    if (status !== 'VALID' && status !== 'VALIDATED') {
      return NextResponse.redirect(`${baseUrl}/payment/fail?reason=invalid_status`)
    }

    // Validate with SSLCommerz server
    const validation = await validateSSLPayment(val_id)

    if (
      validation.status !== 'VALID' &&
      validation.status !== 'VALIDATED'
    ) {
      return NextResponse.redirect(`${baseUrl}/payment/fail?reason=validation_failed`)
    }

    // Find and update order
    const order = await Order.findOne({ tranId: tran_id })
    if (!order) {
      return NextResponse.redirect(`${baseUrl}/payment/fail?reason=order_not_found`)
    }

    // Verify amount
    const paidAmount = parseFloat(validation.amount ?? '0')
    if (Math.abs(paidAmount - order.total) > 1) {
      await Order.findByIdAndUpdate(order._id, {
        paymentStatus: 'failed',
        status:        'cancelled',
      })
      return NextResponse.redirect(`${baseUrl}/payment/fail?reason=amount_mismatch`)
    }

    // All good — update order
    await Order.findByIdAndUpdate(order._id, {
      paymentStatus: 'paid',
      status:        'processing',
      sslTranId:     validation.bank_tran_id ?? bank_tran_id,
      valId:         val_id,
      cardType:      card_type,
      bankTranId:    bank_tran_id,
    })

    return NextResponse.redirect(
      `${baseUrl}/order-success/${order._id}?payment=success&order=${order.orderNumber}`
    )
  } catch (err) {
    console.error('[PAYMENT SUCCESS]', err)
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
    return NextResponse.redirect(`${baseUrl}/payment/fail?reason=server_error`)
  }
}

// SSLCommerz may also send GET in some configs
export { POST as GET }