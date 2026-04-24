import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { validateSSLPayment } from '@/lib/sslcommerz'

// IPN = Instant Payment Notification — server-to-server, background validation
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const form   = await req.formData()
    const val_id = form.get('val_id')  as string
    const status = form.get('status')  as string
    const tran_id= form.get('tran_id') as string

    if (!val_id || !tran_id) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    if (status !== 'VALID' && status !== 'VALIDATED') {
      await Order.findOneAndUpdate(
        { tranId: tran_id },
        { paymentStatus: 'failed', status: 'cancelled' }
      )
      return NextResponse.json({ received: true })
    }

    const validation = await validateSSLPayment(val_id)

    if (validation.status === 'VALID' || validation.status === 'VALIDATED') {
      await Order.findOneAndUpdate(
        { tranId: tran_id },
        {
          paymentStatus: 'paid',
          status:        'processing',
          valId:         val_id,
          sslTranId:     validation.bank_tran_id,
        }
      )
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[IPN]', err)
    return NextResponse.json({ error: 'IPN error' }, { status: 500 })
  }
}