import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { confirmSSLPayment, cancelUnpaidOrder } from '@/lib/paymentFlow'

// IPN = Instant Payment Notification — server-to-server।
// এই রুট login ছাড়া খোলা, তাই এখানে পাঠানো কোনো মানই বিশ্বাস করা হয় না;
// সব যাচাই confirmSSLPayment() ভেতরে SSLCommerz সার্ভার থেকে হয়।
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const form    = await req.formData()
    const val_id  = String(form.get('val_id')  ?? '')
    const status  = String(form.get('status')  ?? '')
    const tran_id = String(form.get('tran_id') ?? '')

    if (!tran_id) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    if (status !== 'VALID' && status !== 'VALIDATED') {
      // paid অর্ডার ছোঁয়া হবে না; শুধু unpaid বাতিল + stock ফেরত
      await cancelUnpaidOrder(tran_id, 'failed')
      return NextResponse.json({ received: true })
    }

    if (!val_id) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    const result = await confirmSSLPayment({
      tran_id,
      val_id,
      card_type: String(form.get('card_type') ?? '') || undefined,
      bank_tran_id: String(form.get('bank_tran_id') ?? '') || undefined,
    })

    if (!result.ok) {
      console.warn(`[IPN] rejected ${tran_id}: ${result.reason}`)
    }
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[IPN]', err)
    return NextResponse.json({ error: 'IPN error' }, { status: 500 })
  }
}
