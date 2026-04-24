import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const form    = await req.formData()
    const tran_id = form.get('tran_id') as string

    if (tran_id) {
      await Order.findOneAndUpdate(
        { tranId: tran_id },
        { paymentStatus: 'failed', status: 'cancelled' }
      )
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
    return NextResponse.redirect(`${baseUrl}/payment/fail?reason=payment_failed`)
  } catch (err) {
    console.error('[PAYMENT FAIL]', err)
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
    return NextResponse.redirect(`${baseUrl}/payment/fail`)
  }
}

export { POST as GET }