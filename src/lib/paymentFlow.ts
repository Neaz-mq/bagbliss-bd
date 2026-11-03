import Order from '@/models/Order'
import { validateSSLPayment } from '@/lib/sslcommerz'
import { sendOrderEmails } from '@/lib/email'
import { releaseStock, reserveStock, type PricedItem } from '@/features/orders/buildOrder'

/**
 * পেমেন্ট নিশ্চিত/ব্যর্থ করার একমাত্র জায়গা।
 * IPN আর success রুট দুটোই এখান দিয়ে যায় — যাতে নিরাপত্তা চেক
 * (tran_id, amount, currency) এক জায়গায় থাকে আর দুই রুট আলাদা হয়ে না যায়।
 */

export type ConfirmResult =
  | { ok: true; orderId: string; accessToken: string | null; alreadyPaid: boolean }
  | { ok: false; reason: string }

interface ConfirmInput {
  tran_id: string
  val_id: string
  card_type?: string
  bank_tran_id?: string
}

export async function confirmSSLPayment(input: ConfirmInput): Promise<ConfirmResult> {
  const { tran_id, val_id } = input

  const order = await Order.findOne({ tranId: tran_id })
  if (!order) return { ok: false, reason: 'order_not_found' }

  // ইতিমধ্যে paid — দ্বিতীয় callback (IPN + success) নিরীহভাবে সফল ধরা হয়
  if (order.paymentStatus === 'paid') {
    return { ok: true, orderId: String(order._id), accessToken: order.accessToken ?? null, alreadyPaid: true }
  }

  // SSLCommerz সার্ভারে যাচাই — ক্লায়েন্ট/IPN-এর পাঠানো কোনো মান বিশ্বাস করা হয় না
  const v = await validateSSLPayment(val_id)
  if (v.status !== 'VALID' && v.status !== 'VALIDATED') {
    return { ok: false, reason: 'validation_failed' }
  }

  // 🔒 এই val_id কি সত্যিই এই অর্ডারের? (অন্য সস্তা পেমেন্টের val_id রিপ্লে ঠেকায়)
  if (v.tran_id !== tran_id) return { ok: false, reason: 'tran_id_mismatch' }

  // 🔒 টাকার পরিমাণ অবশ্যই মিলতে হবে (`amount` = BDT-তে রূপান্তরিত পরিমাণ)
  const paid = parseFloat(v.amount ?? '0')
  if (!Number.isFinite(paid) || Math.abs(paid - order.total) > 1) {
    console.warn(`[PAYMENT] amount mismatch ${tran_id}: paid=${paid} expected=${order.total}`)
    return { ok: false, reason: 'amount_mismatch' }
  }

  const isRisky = v.risk_level === '1'
  const wasCancelled = order.status === 'cancelled' // দেরিতে এসে পৌঁছানো পেমেন্ট

  // ⚛️ Atomic: যে request আগে update করতে পারবে শুধু সেই ইমেইল পাঠাবে
  const updated = await Order.findOneAndUpdate(
    { _id: order._id, paymentStatus: { $ne: 'paid' } },
    {
      paymentStatus: 'paid',
      // cancelled অর্ডারে টাকা এলে অটো shipment নয় — admin দেখবে
      status: wasCancelled || isRisky ? 'review' : 'processing',
      sslTranId: v.bank_tran_id ?? input.bank_tran_id ?? null,
      valId: val_id,
      cardType: input.card_type ?? null,
      bankTranId: input.bank_tran_id ?? null,
      riskLevel: v.risk_level ?? null,
      riskTitle: v.risk_title ?? null,
    },
    { new: true }
  )

  if (!updated) {
    // অন্য request এইমাত্র paid করে দিয়েছে
    return { ok: true, orderId: String(order._id), accessToken: order.accessToken ?? null, alreadyPaid: true }
  }

  if (wasCancelled) {
    // cancel-এর সময় stock ফেরত গিয়েছিল — আবার রিজার্ভ করার চেষ্টা (না পারলে admin দেখবে)
    try {
      await reserveStock(order.items as PricedItem[])
    } catch {
      console.error(`[PAYMENT] late payment on cancelled order ${order.orderNumber} — stock unavailable, needs manual review/refund`)
    }
  }
  if (isRisky) console.warn(`[PAYMENT RISK] ${order.orderNumber}:`, v.risk_title)

  sendOrderEmails({
    orderNumber: updated.orderNumber,
    customerName: updated.shipping.fullName,
    customerEmail: updated.shipping.email || updated.guestEmail || '',
    items: updated.items,
    shipping: updated.shipping,
    subtotal: updated.subtotal,
    deliveryFee: updated.deliveryFee,
    total: updated.total,
    payment: updated.payment,
    delivery: updated.delivery,
    orderNote: updated.orderNote ?? '',
    createdAt: updated.createdAt.toISOString(),
  }).catch((err) => console.error('[EMAIL] payment email failed:', err))

  return { ok: true, orderId: String(updated._id), accessToken: updated.accessToken ?? null, alreadyPaid: false }
}

/**
 * Fail/cancel: শুধু এখনো `unpaid` অর্ডার বাতিল হবে (paid অর্ডার কখনো নয়),
 * আর স্টক ঠিক একবার ফেরত যাবে।
 */
export async function cancelUnpaidOrder(
  tran_id: string,
  paymentStatus: 'failed' | 'cancelled'
): Promise<boolean> {
  const prev = await Order.findOneAndUpdate(
    { tranId: tran_id, paymentStatus: 'unpaid', status: { $ne: 'cancelled' } },
    { paymentStatus, status: 'cancelled' },
    { new: false } // পুরনো ডকুমেন্ট — আইটেম পাওয়ার জন্য
  )
  if (!prev) return false

  await releaseStock(
    (prev.items as { productId: string; quantity: number }[]).map((i) => ({
      id: i.productId,
      qty: i.quantity,
    }))
  )
  return true
}
