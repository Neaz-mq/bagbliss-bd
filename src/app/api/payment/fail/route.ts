import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { cancelUnpaidOrder } from '@/lib/paymentFlow'

export async function POST(req: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  try {
    await connectDB()
    const form    = await req.formData()
    const tran_id = String(form.get('tran_id') ?? '')

    // শুধু unpaid অর্ডার বাতিল হয় + স্টক ফেরত যায়; paid অর্ডার অক্ষত থাকে
    if (tran_id) await cancelUnpaidOrder(tran_id, 'failed')

    return NextResponse.redirect(`${baseUrl}/payment/fail?reason=payment_failed`, 303)
  } catch (err) {
    console.error('[PAYMENT FAIL]', err)
    return NextResponse.redirect(`${baseUrl}/payment/fail`, 303)
  }
}

// GET-এ formData() থাকে না — শুধু রিডাইরেক্ট
export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  return NextResponse.redirect(`${baseUrl}/payment/fail`, 303)
}
