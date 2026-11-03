import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { confirmSSLPayment } from '@/lib/paymentFlow'

export async function POST(req: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const fail = (reason: string) =>
    NextResponse.redirect(`${baseUrl}/payment/fail?reason=${reason}`, 303)

  try {
    await connectDB()

    const form    = await req.formData()
    const val_id  = String(form.get('val_id')  ?? '')
    const tran_id = String(form.get('tran_id') ?? '')
    const status  = String(form.get('status')  ?? '')

    if (status !== 'VALID' && status !== 'VALIDATED') return fail('invalid_status')
    if (!val_id || !tran_id) return fail('missing_params')

    const result = await confirmSSLPayment({
      tran_id,
      val_id,
      card_type: String(form.get('card_type') ?? '') || undefined,
      bank_tran_id: String(form.get('bank_tran_id') ?? '') || undefined,
    })

    if (!result.ok) return fail(result.reason)

    return NextResponse.redirect(
      `${baseUrl}/order-success/${result.orderId}?t=${result.accessToken ?? ''}`,
      303
    )
  } catch (err) {
    console.error('[PAYMENT SUCCESS]', err)
    return fail('server_error')
  }
}

// ব্রাউজারে সরাসরি GET করলে formData() ফেটে যেত — এখন শুধু রিডাইরেক্ট
export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  return NextResponse.redirect(`${baseUrl}/cart`, 303)
}
