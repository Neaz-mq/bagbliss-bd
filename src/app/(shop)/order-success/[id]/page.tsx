import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle2, ShoppingBag, Truck, MapPin } from 'lucide-react'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { CURRENCY_SYMBOL } from '@/constants'

export const metadata: Metadata = {
  title: 'Order Confirmed',
  // ব্যক্তিগত পেজ — Google যেন কখনো index না করে
  robots: { index: false, follow: false },
}

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ t?: string }>
}

const PAYMENT_LABELS: Record<string, string> = {
  cod: 'Cash on Delivery',
  bkash: 'bKash',
  nagad: 'Nagad',
  card: 'Card Payment',
  sslcommerz: 'Online Payment',
}

type OrderView = {
  orderNumber: string
  items: { name: string; price: number; quantity: number; color: string }[]
  shipping: {
    fullName: string
    phone: string
    address: string
    thana: string
    district: string
    division: string
    postalCode: string
  }
  delivery: string
  deliveryFee: number
  payment: string
  subtotal: number
  total: number
  paymentStatus: string
}

export default async function OrderSuccessPage({ params, searchParams }: Props) {
  const { id } = await params
  const { t } = await searchParams

  // ObjectId ফরম্যাট না হলে DB তে যাওয়ার দরকার নেই
  if (!t || !/^[0-9a-fA-F]{24}$/.test(id)) notFound()

  await connectDB()

  // ✅ accessToken ছাড়া অর্ডার খোলা যাবে না। guest checkout এ
  // সেশন নেই, তাই ObjectId অনুমান করে অন্যের ঠিকানা/ফোন
  // দেখে ফেলা ঠেকাতে টোকেনই একমাত্র সুরক্ষা।
  const doc = await Order.findOne({ _id: id, accessToken: t })
    .select(
      'orderNumber items shipping delivery deliveryFee payment subtotal total paymentStatus'
    )
    .lean()

  if (!doc) notFound()

  const o = doc as unknown as OrderView
  const isPaid = o.paymentStatus === 'paid'

  const cardStyle = {
    textAlign: 'left' as const,
    marginTop: '1rem',
    padding: '1.25rem',
    background: '#fff',
    border: '1px solid rgba(26,26,46,0.08)',
    borderRadius: '1rem',
  }

  const headingStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1rem',
    fontWeight: 700,
    margin: '0 0 0.9rem',
  }

  return (
    <div className="co-success-page">
      <div className="co-success-inner" style={{ maxWidth: 640 }}>
        <div
          className="co-success-icon"
          style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}
        >
          <CheckCircle2 size={48} />
        </div>

        <h1 className="co-success-title">
          {isPaid ? 'Payment Successful! 🎉' : 'Order Confirmed! 🎉'}
        </h1>

        <p className="co-success-desc">
          Thank you, {o.shipping.fullName.split(' ')[0]}! Your order has been
          placed. Expected delivery in{' '}
          {o.delivery === 'express' ? '1–2' : '3–5'} business days.
        </p>

        {/* ── Order meta ─────────────────────────────────────── */}
        <div className="co-success-meta">
          <div className="co-success-meta-item">
            <span>Order ID</span>
            <strong>#{o.orderNumber}</strong>
          </div>
          <div className="co-success-meta-item">
            <span>Payment</span>
            <strong>{PAYMENT_LABELS[o.payment] ?? o.payment}</strong>
          </div>
          <div className="co-success-meta-item">
            <span>Status</span>
            <strong style={{ color: isPaid ? '#16a34a' : '#b45309' }}>
              {isPaid ? 'Paid' : 'Pending'}
            </strong>
          </div>
          <div className="co-success-meta-item">
            <span>Total</span>
            <strong>
              {CURRENCY_SYMBOL}
              {o.total.toLocaleString('en-BD')}
            </strong>
          </div>
        </div>

        {/* ── Items ──────────────────────────────────────────── */}
        <div style={cardStyle}>
          <h2 style={headingStyle}>
            <ShoppingBag size={18} /> Order Items ({o.items.length})
          </h2>

          {o.items.map((item, i) => (
            <div
              key={`${item.name}-${item.color}-${i}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '1rem',
                padding: '0.6rem 0',
                borderBottom:
                  i < o.items.length - 1
                    ? '1px solid rgba(26,26,46,0.06)'
                    : 'none',
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>
                  {item.name}
                </p>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#6b7280' }}>
                  {item.color ? `${item.color} · ` : ''}Qty {item.quantity}
                </p>
              </div>
              <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                {CURRENCY_SYMBOL}
                {(item.price * item.quantity).toLocaleString('en-BD')}
              </span>
            </div>
          ))}

          <div
            style={{
              marginTop: '1rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid rgba(26,26,46,0.1)',
              fontSize: '0.88rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Subtotal</span>
              <span>
                {CURRENCY_SYMBOL}
                {o.subtotal.toLocaleString('en-BD')}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '0.35rem',
              }}
            >
              <span style={{ color: '#6b7280' }}>Delivery</span>
              <span>
                {o.deliveryFee === 0
                  ? 'FREE'
                  : `${CURRENCY_SYMBOL}${o.deliveryFee}`}
              </span>
            </div>
          </div>
        </div>

        {/* ── Shipping ───────────────────────────────────────── */}
        <div style={cardStyle}>
          <h2 style={headingStyle}>
            <MapPin size={18} /> Delivering To
          </h2>
          <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.7 }}>
            <strong>{o.shipping.fullName}</strong>
            <br />
            {o.shipping.phone}
            <br />
            {o.shipping.address}
            <br />
            {[o.shipping.thana, o.shipping.district, o.shipping.division]
              .filter(Boolean)
              .join(', ')}
            {o.shipping.postalCode ? ` – ${o.shipping.postalCode}` : ''}
          </p>
          <p
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              margin: '0.9rem 0 0',
              fontSize: '0.82rem',
              color: '#6b7280',
            }}
          >
            <Truck size={14} />
            {o.delivery === 'express'
              ? 'Express Delivery — 1–2 business days'
              : 'Standard Delivery — 3–5 business days'}
          </p>
        </div>

        <div className="co-success-actions" style={{ marginTop: '1.5rem' }}>
          <Link href="/shop" className="btn-primary">
            <ShoppingBag size={18} /> Continue Shopping
          </Link>
          <Link href="/account/orders" className="btn-secondary">
            My Orders
          </Link>
        </div>

        <p style={{ marginTop: '1.25rem', fontSize: '0.78rem', color: '#9ca3af' }}>
          Bookmark this page to check your order status anytime.
        </p>
      </div>
    </div>
  )
}