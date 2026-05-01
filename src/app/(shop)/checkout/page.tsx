'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ChevronRight, ShoppingBag, Truck, Shield, CreditCard,
  Smartphone, Banknote, MapPin, User, Phone, Mail, Home,
  AlertCircle, CheckCircle2, Lock, Zap, ChevronLeft, Tag,
  ExternalLink,
} from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'

// ── Validation Schema ──────────────────────────────────────────────────────
const checkoutSchema = z.object({
  fullName:   z.string().min(3, 'Full name must be at least 3 characters'),
  phone:      z.string().regex(/^(\+88)?01[3-9]\d{8}$/, 'Enter a valid BD phone number'),
  email:      z.string().email('Enter a valid email').optional().or(z.literal('')),
  division:   z.string().min(1, 'Please select a division'),
  district:   z.string().min(1, 'Please enter your district'),
  thana:      z.string().min(1, 'Please enter your thana/upazila'),
  address:    z.string().min(10, 'Address must be at least 10 characters'),
  postalCode: z.string().regex(/^\d{4}$/, 'Enter a valid 4-digit postal code').optional().or(z.literal('')),
  orderNote:  z.string().optional(),
})
type CheckoutForm = z.infer<typeof checkoutSchema>

// ── Constants ──────────────────────────────────────────────────────────────
const DIVISIONS = [
  'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi',
  'Khulna', 'Barisal', 'Rangpur', 'Mymensingh',
]

const DELIVERY_OPTIONS = [
  { id: 'standard', label: 'Standard Delivery', time: '3–5 business days', fee: 60,  icon: Truck },
  { id: 'express',  label: 'Express Delivery',  time: '1–2 business days', fee: 120, icon: Zap   },
]

const PAYMENT_METHODS = [
  {
    id: 'cod', label: 'Cash on Delivery', icon: Banknote,
    desc: 'Pay when you receive', color: '#1a1a2e',
    badge: 'Safe', badgeBg: 'rgba(26,26,46,0.08)', badgeColor: '#1a1a2e', gateway: false,
  },
  {
    id: 'bkash', label: 'bKash', icon: Smartphone,
    desc: 'Pay via bKash gateway', color: '#e2136e',
    badge: 'Instant', badgeBg: 'rgba(226,19,110,0.08)', badgeColor: '#e2136e', gateway: true,
  },
  {
    id: 'nagad', label: 'Nagad', icon: Smartphone,
    desc: 'Pay via Nagad gateway', color: '#f6a623',
    badge: 'Instant', badgeBg: 'rgba(246,166,35,0.08)', badgeColor: '#b45309', gateway: true,
  },
  {
    id: 'card', label: 'Card Payment', icon: CreditCard,
    desc: 'Visa / Mastercard / Amex', color: '#1a1f71',
    badge: 'Secure', badgeBg: 'rgba(26,31,113,0.08)', badgeColor: '#1a1f71', gateway: true,
  },
]

const FREE_SHIPPING_THRESHOLD = 1500

// ── Helpers ────────────────────────────────────────────────────────────────

// ✅ Fix: helper to safely get color name whether selectedColor is string or object
function getColorName(selectedColor: unknown): string {
  if (!selectedColor) return ''
  if (typeof selectedColor === 'string') return selectedColor
  if (typeof selectedColor === 'object' && selectedColor !== null && 'name' in selectedColor) {
    return (selectedColor as { name: string }).name
  }
  return ''
}

function ItemPlaceholder() {
  return (
    <div className="co-item-placeholder">
      <svg viewBox="0 0 80 90" fill="none" width="42" height="48">
        <path d="M25 35Q25 18 40 18Q55 18 55 35" stroke="#C9A84C" strokeWidth="4" strokeLinecap="round" fill="none"/>
        <rect x="10" y="35" width="60" height="46" rx="10" fill="#E91E8C" opacity="0.15"/>
        <rect x="10" y="35" width="60" height="46" rx="10" stroke="#E91E8C" strokeWidth="1.5"/>
        <circle cx="40" cy="52" r="6" fill="#C9A84C" opacity="0.5"/>
        <circle cx="40" cy="52" r="3" fill="#1A1A2E" opacity="0.3"/>
      </svg>
    </div>
  )
}

function StepBadge({ step, label, active, done }: { step: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className={`co-step ${active ? 'co-step-active' : done ? 'co-step-done' : 'co-step-idle'}`}>
      <span className="co-step-circle">
        {done ? <CheckCircle2 size={16} /> : step}
      </span>
      <span className="co-step-label">{label}</span>
    </div>
  )
}

function GatewayNotice({ method }: { method: string }) {
  if (method === 'cod') return null
  const m = PAYMENT_METHODS.find(p => p.id === method)
  if (!m) return null
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
      padding: '1rem 1.25rem',
      background: m.badgeBg,
      border: `1px solid ${m.color}22`,
      borderRadius: '0.875rem',
      marginTop: '0.5rem',
    }}>
      <ExternalLink size={16} style={{ color: m.color, flexShrink: 0, marginTop: '2px' }} />
      <div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 700, color: m.color, margin: '0 0 2px' }}>
          You will be redirected to {m.label}
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0 }}>
          After payment confirmation, you will be returned to BagBliss BD automatically.
          Your order is created before redirect — it is safe to proceed.
        </p>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router    = useRouter()
  const { data: session } = useSession()
  const items     = useCartStore(s => s.items)
  const clearCart = useCartStore(s => s.clearCart)

  const [delivery,    setDelivery]    = useState('standard')
  const [payment,     setPayment]     = useState('cod')
  const [isPlacing,   setIsPlacing]   = useState(false)
  const [placed,      setPlaced]      = useState(false)
  const [step,        setStep]        = useState<1 | 2>(1)
  const [orderTotal,  setOrderTotal]  = useState(0)
  const [orderId,     setOrderId]     = useState('')
  const [redirecting, setRedirecting] = useState(false)

  const deliveryFee  = DELIVERY_OPTIONS.find(d => d.id === delivery)?.fee ?? 60
  const subtotal     = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD
  const shipping     = freeShipping ? 0 : deliveryFee
  const total        = subtotal + shipping

  const isGatewayPayment = PAYMENT_METHODS.find(p => p.id === payment)?.gateway ?? false

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: session?.user?.name  ?? '',
      email:    session?.user?.email ?? '',
      phone: '', division: '', district: '',
      thana: '', address: '', postalCode: '',
    },
  })

  useEffect(() => {
    if (items.length === 0 && !placed && !redirecting) router.replace('/shop')
  }, [items, placed, redirecting, router])

  const buildOrderPayload = (data: CheckoutForm) => ({
    items: items.map(item => ({
      productId: item.product._id,
      name:      item.product.name,
      price:     item.price,
      quantity:  item.quantity,
      color:     getColorName(item.selectedColor), // ✅ Fix: send string not object
      image:     item.product.mainImage?.url ?? '',
    })),
    shipping: {
      fullName:   data.fullName,
      phone:      data.phone,
      email:      data.email      ?? '',
      division:   data.division,
      district:   data.district,
      thana:      data.thana,
      address:    data.address,
      postalCode: data.postalCode ?? '',
    },
    delivery,
    deliveryFee: freeShipping ? 0 : deliveryFee,
    subtotal,
    total,
    orderNote: data.orderNote ?? '',
  })

  const onSubmit = async (data: CheckoutForm) => {
    if (step === 1) { setStep(2); return }

    setIsPlacing(true)
    try {
      const payload = buildOrderPayload(data)

      if (payment === 'cod') {
        const res  = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, payment: 'cod' }),
        })
        const json = await res.json()
        if (!json.success) throw new Error(json.error ?? 'Order failed')

        setOrderTotal(total)
        setOrderId(json.order.orderNumber)
        clearCart()
        setPlaced(true)
        toast.success(`🎉 Order placed successfully!`)
        return
      }

      setRedirecting(true)
      toast.loading('Redirecting to payment gateway…', { id: 'ssl-redirect' })

      const res  = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, payment }),
      })
      const json = await res.json()

      if (!res.ok || !json.gatewayUrl) {
        throw new Error(json.error ?? 'Payment gateway error. Please try again.')
      }

      clearCart()
      toast.dismiss('ssl-redirect')
      toast.success('Redirecting to secure payment…')
      await new Promise(r => setTimeout(r, 800))
      window.location.href = json.gatewayUrl

    } catch (err: unknown) {
      toast.dismiss('ssl-redirect')
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
      setIsPlacing(false)
      setRedirecting(false)
    }
  }

  // ── Order Placed Screen ────────────────────────────────────────────────
  if (placed) {
    return (
      <div className="co-success-page">
        <div className="co-success-inner">
          <div className="co-success-icon" style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>
            <CheckCircle2 size={48} />
          </div>
          <h1 className="co-success-title">Order Confirmed! 🎉</h1>
          <p className="co-success-desc">
            Thank you! Your order has been placed. We will process it shortly.
            Expected delivery in {delivery === 'express' ? '1–2' : '3–5'} business days.
          </p>
          <div className="co-success-meta">
            <div className="co-success-meta-item"><span>Order ID</span><strong>#{orderId}</strong></div>
            <div className="co-success-meta-item"><span>Payment</span><strong>Cash on Delivery</strong></div>
            <div className="co-success-meta-item"><span>Total</span><strong>৳{orderTotal.toLocaleString('en-BD')}</strong></div>
          </div>
          <div className="co-success-actions">
            <Link href="/shop" className="btn-primary"><ShoppingBag size={18} /> Continue Shopping</Link>
            <Link href="/account/orders" className="btn-secondary">Track Order</Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Gateway Redirecting Screen ─────────────────────────────────────────
  if (redirecting) {
    const pm = PAYMENT_METHODS.find(p => p.id === payment)
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdfaf7', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: `${pm?.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: `4px solid ${pm?.color}33`, borderTopColor: pm?.color, animation: 'spin 0.8s linear infinite' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: '#1a1a2e', margin: '0 0 0.75rem' }}>
            Redirecting to {pm?.label}
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: '#6b7280', lineHeight: 1.7 }}>
            Please wait while we redirect you to the secure payment gateway. Do not close this window.
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div className="co-page">
      {/* Breadcrumb */}
      <div className="co-breadcrumb-bar">
        <div className="container-bagbliss">
          <nav className="co-breadcrumb">
            <Link href="/" className="co-breadcrumb-link">Home</Link>
            <ChevronRight size={14} className="co-breadcrumb-sep" />
            <Link href="/cart" className="co-breadcrumb-link">Cart</Link>
            <ChevronRight size={14} className="co-breadcrumb-sep" />
            <span className="co-breadcrumb-current">Checkout</span>
          </nav>
        </div>
      </div>

      <div className="container-bagbliss">
        <div className="co-header">
          <div>
            <h1 className="co-title">Checkout</h1>
            <p className="co-subtitle">{items.length} item{items.length !== 1 ? 's' : ''} in your order</p>
          </div>
          <div className="co-steps">
            <StepBadge step={1} label="Details" active={step === 1} done={step > 1} />
            <div className="co-steps-connector" />
            <StepBadge step={2} label="Review"  active={step === 2} done={false} />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="co-layout">

            {/* ── Left Column ──────────────────────────────────────── */}
            <div className="co-main-col">

              {step === 1 && (
                <>
                  {/* Shipping Info */}
                  <div className="co-card">
                    <div className="co-card-header">
                      <MapPin size={20} className="co-card-icon" />
                      <h2 className="co-card-title">Shipping Information</h2>
                    </div>
                    <div className="co-form-grid">

                      <div className="co-field co-field-half">
                        <label className="co-label"><User size={14} /> Full Name *</label>
                        <input
                          {...register('fullName')}
                          className={`co-input ${errors.fullName ? 'co-input-error' : ''}`}
                          placeholder="Fatima Rahman"
                          suppressHydrationWarning
                        />
                        {errors.fullName && <span className="co-field-error"><AlertCircle size={12} /> {errors.fullName.message}</span>}
                      </div>

                      <div className="co-field co-field-half">
                        <label className="co-label"><Phone size={14} /> Phone Number *</label>
                        <input
                          {...register('phone')}
                          className={`co-input ${errors.phone ? 'co-input-error' : ''}`}
                          placeholder="01XXXXXXXXX"
                          type="tel"
                          suppressHydrationWarning
                        />
                        {errors.phone && <span className="co-field-error"><AlertCircle size={12} /> {errors.phone.message}</span>}
                      </div>

                      <div className="co-field co-field-full">
                        <label className="co-label"><Mail size={14} /> Email Address (optional)</label>
                        <input
                          {...register('email')}
                          className={`co-input ${errors.email ? 'co-input-error' : ''}`}
                          placeholder="your@email.com"
                          type="email"
                          suppressHydrationWarning
                        />
                        {errors.email && <span className="co-field-error"><AlertCircle size={12} /> {errors.email.message}</span>}
                      </div>

                      <div className="co-field co-field-third">
                        <label className="co-label">Division *</label>
                        <select
                          {...register('division')}
                          className={`co-input co-select ${errors.division ? 'co-input-error' : ''}`}
                          suppressHydrationWarning
                        >
                          <option value="">Select Division</option>
                          {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        {errors.division && <span className="co-field-error"><AlertCircle size={12} /> {errors.division.message}</span>}
                      </div>

                      <div className="co-field co-field-third">
                        <label className="co-label">District *</label>
                        <input
                          {...register('district')}
                          className={`co-input ${errors.district ? 'co-input-error' : ''}`}
                          placeholder="e.g. Dhaka"
                          suppressHydrationWarning
                        />
                        {errors.district && <span className="co-field-error"><AlertCircle size={12} /> {errors.district.message}</span>}
                      </div>

                      <div className="co-field co-field-third">
                        <label className="co-label">Thana / Upazila *</label>
                        <input
                          {...register('thana')}
                          className={`co-input ${errors.thana ? 'co-input-error' : ''}`}
                          placeholder="e.g. Gulshan"
                          suppressHydrationWarning
                        />
                        {errors.thana && <span className="co-field-error"><AlertCircle size={12} /> {errors.thana.message}</span>}
                      </div>

                      <div className="co-field co-field-full">
                        <label className="co-label"><Home size={14} /> Full Address *</label>
                        <textarea
                          {...register('address')}
                          className={`co-input co-textarea ${errors.address ? 'co-input-error' : ''}`}
                          placeholder="House no, Road no, Area, Landmark…"
                          rows={3}
                          suppressHydrationWarning
                        />
                        {errors.address && <span className="co-field-error"><AlertCircle size={12} /> {errors.address.message}</span>}
                      </div>

                      <div className="co-field co-field-half">
                        <label className="co-label">Postal Code</label>
                        <input
                          {...register('postalCode')}
                          className={`co-input ${errors.postalCode ? 'co-input-error' : ''}`}
                          placeholder="1212"
                          maxLength={4}
                          suppressHydrationWarning
                        />
                        {errors.postalCode && <span className="co-field-error"><AlertCircle size={12} /> {errors.postalCode.message}</span>}
                      </div>

                      <div className="co-field co-field-full">
                        <label className="co-label"><Tag size={14} /> Order Note (optional)</label>
                        <textarea
                          {...register('orderNote')}
                          className="co-input co-textarea"
                          placeholder="Special instructions, color preferences…"
                          rows={2}
                          suppressHydrationWarning
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Method */}
                  <div className="co-card">
                    <div className="co-card-header">
                      <Truck size={20} className="co-card-icon" />
                      <h2 className="co-card-title">Delivery Method</h2>
                    </div>
                    <div className="co-delivery-options">
                      {DELIVERY_OPTIONS.map(opt => {
                        const Icon   = opt.icon
                        const active = delivery === opt.id
                        return (
                          <button
                            key={opt.id} type="button"
                            onClick={() => setDelivery(opt.id)}
                            className={`co-delivery-opt ${active ? 'co-delivery-opt-active' : ''}`}
                            suppressHydrationWarning
                          >
                            <div className={`co-delivery-radio ${active ? 'co-delivery-radio-active' : ''}`}>
                              {active && <div className="co-delivery-radio-dot" />}
                            </div>
                            <div className="co-delivery-icon-wrap"><Icon size={20} /></div>
                            <div className="co-delivery-info">
                              <span className="co-delivery-label">{opt.label}</span>
                              <span className="co-delivery-time">{opt.time}</span>
                            </div>
                            <div className="co-delivery-fee">
                              {freeShipping
                                ? <span className="co-delivery-free">FREE</span>
                                : <span>৳{opt.fee}</span>}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                    {freeShipping && (
                      <p className="co-free-ship-note">
                        <CheckCircle2 size={14} /> You qualify for free shipping!
                      </p>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div className="co-card">
                    <div className="co-card-header">
                      <CreditCard size={20} className="co-card-icon" />
                      <h2 className="co-card-title">Payment Method</h2>
                    </div>
                    <div className="co-payment-grid">
                      {PAYMENT_METHODS.map(pm => {
                        const Icon   = pm.icon
                        const active = payment === pm.id
                        return (
                          <button
                            key={pm.id} type="button"
                            onClick={() => setPayment(pm.id)}
                            className={`co-payment-opt ${active ? 'co-payment-opt-active' : ''}`}
                            suppressHydrationWarning
                          >
                            <div className="co-payment-icon" style={{ background: pm.color }}>
                              <Icon size={18} color="white" />
                            </div>
                            <div className="co-payment-info">
                              <span className="co-payment-label">{pm.label}</span>
                              <span className="co-payment-desc">{pm.desc}</span>
                            </div>
                            {active && <CheckCircle2 size={18} className="co-payment-check" />}
                          </button>
                        )
                      })}
                    </div>
                    <div style={{ padding: '0 1.25rem 1.25rem' }}>
                      <GatewayNotice method={payment} />
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="co-card">
                    <div className="co-card-header">
                      <MapPin size={20} className="co-card-icon" />
                      <h2 className="co-card-title">Shipping Address</h2>
                      <button type="button" onClick={() => setStep(1)} className="co-edit-btn" suppressHydrationWarning>Edit</button>
                    </div>
                    <div className="co-review-address">
                      <p><strong>{watch('fullName')}</strong></p>
                      <p>{watch('phone')}</p>
                      <p>{watch('address')}</p>
                      <p>
                        {watch('thana')}, {watch('district')}, {watch('division')}
                        {watch('postalCode') ? ` – ${watch('postalCode')}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="co-card">
                    <div className="co-card-header">
                      <ShoppingBag size={20} className="co-card-icon" />
                      <h2 className="co-card-title">Order Items ({items.length})</h2>
                    </div>
                    <div className="co-review-items">
                      {items.map(item => (
                        <div key={item.product._id + getColorName(item.selectedColor)} className="co-review-item"> {/* ✅ Fix */}
                          <div className="co-review-item-img">
                            {item.product.mainImage?.url ? (
                              <Image src={item.product.mainImage.url} alt={item.product.name} fill sizes="72px" className="co-review-item-photo" />
                            ) : <ItemPlaceholder />}
                          </div>
                          <div className="co-review-item-info">
                            <p className="co-review-item-name">{item.product.name}</p>
                            <p className="co-review-item-color">Color: {getColorName(item.selectedColor)}</p> {/* ✅ Fix */}
                            <p className="co-review-item-qty">Qty: {item.quantity}</p>
                          </div>
                          <span className="co-review-item-price">
                            ৳{(item.price * item.quantity).toLocaleString('en-BD')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="co-card">
                    <div className="co-card-header">
                      <CreditCard size={20} className="co-card-icon" />
                      <h2 className="co-card-title">Payment & Delivery</h2>
                      <button type="button" onClick={() => setStep(1)} className="co-edit-btn" suppressHydrationWarning>Edit</button>
                    </div>
                    <div className="co-review-pd">
                      <div className="co-review-pd-item">
                        <span>Payment</span>
                        <strong>{PAYMENT_METHODS.find(p => p.id === payment)?.label}</strong>
                      </div>
                      <div className="co-review-pd-item">
                        <span>Delivery</span>
                        <strong>{DELIVERY_OPTIONS.find(d => d.id === delivery)?.label}</strong>
                      </div>
                      <div className="co-review-pd-item">
                        <span>Estimated Time</span>
                        <strong>{DELIVERY_OPTIONS.find(d => d.id === delivery)?.time}</strong>
                      </div>
                    </div>
                    {isGatewayPayment && (
                      <div style={{ padding: '0 1.25rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem 1.25rem', background: 'rgba(233,30,140,0.04)', border: '1px solid rgba(233,30,140,0.15)', borderRadius: '0.875rem' }}>
                          <Lock size={15} style={{ color: '#e91e8c', flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 700, color: '#e91e8c', margin: '0 0 3px' }}>
                              Secure Payment via {PAYMENT_METHODS.find(p => p.id === payment)?.label}
                            </p>
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0 }}>
                              Clicking &quot;Pay Now&quot; will redirect you to the secure SSLCommerz gateway.
                              Your order is reserved. You&apos;ll return here after payment.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Navigation */}
              <div className="co-nav-btns">
                {step === 1 ? (
                  <Link href="/cart" className="co-back-link">
                    <ChevronLeft size={16} /> Back to Cart
                  </Link>
                ) : (
                  <button type="button" onClick={() => setStep(1)} className="co-back-link" suppressHydrationWarning>
                    <ChevronLeft size={16} /> Back to Details
                  </button>
                )}

                <button type="submit" disabled={isPlacing} className="co-next-btn" suppressHydrationWarning>
                  {isPlacing ? (
                    <><span className="co-btn-spinner" /> {isGatewayPayment ? 'Connecting…' : 'Processing…'}</>
                  ) : step === 1 ? (
                    <>Review Order <ChevronRight size={18} /></>
                  ) : isGatewayPayment ? (
                    <><Lock size={16} /> Pay Now — ৳{total.toLocaleString('en-BD')} <ExternalLink size={14} /></>
                  ) : (
                    <><Lock size={16} /> Place Order — ৳{total.toLocaleString('en-BD')}</>
                  )}
                </button>
              </div>
            </div>

            {/* ── Right: Order Summary ──────────────────────────────── */}
            <aside className="co-summary-col">
              <div className="co-summary-card">
                <h3 className="co-summary-title">Order Summary</h3>
                <div className="co-summary-items">
                  {items.map(item => (
                    <div key={item.product._id + getColorName(item.selectedColor)} className="co-summary-item"> {/* ✅ Fix */}
                      <div className="co-summary-item-img">
                        {item.product.mainImage?.url ? (
                          <Image src={item.product.mainImage.url} alt={item.product.name} fill sizes="56px" className="co-summary-item-photo" />
                        ) : <ItemPlaceholder />}
                        <span className="co-summary-item-qty">{item.quantity}</span>
                      </div>
                      <div className="co-summary-item-info">
                        <p className="co-summary-item-name">{item.product.name}</p>
                        <p className="co-summary-item-variant">{getColorName(item.selectedColor)}</p> {/* ✅ Fix */}
                      </div>
                      <span className="co-summary-item-price">
                        ৳{(item.price * item.quantity).toLocaleString('en-BD')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="co-summary-divider" />

                <div className="co-summary-rows">
                  <div className="co-summary-row">
                    <span>Subtotal ({items.length} items)</span>
                    <span>৳{subtotal.toLocaleString('en-BD')}</span>
                  </div>
                  <div className="co-summary-row">
                    <span>Shipping</span>
                    {freeShipping
                      ? <span className="co-summary-free">FREE</span>
                      : <span>৳{shipping}</span>}
                  </div>
                  {freeShipping && (
                    <div className="co-summary-saving">
                      <CheckCircle2 size={13} /> You saved ৳{deliveryFee} on shipping!
                    </div>
                  )}
                </div>

                <div className="co-summary-divider" />

                <div className="co-summary-total-row">
                  <span>Total</span>
                  <span className="co-summary-total-price">৳{total.toLocaleString('en-BD')}</span>
                </div>

                {payment !== 'cod' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(233,30,140,0.04)', border: '1px solid rgba(233,30,140,0.12)', marginTop: '0.25rem' }}>
                    <Lock size={13} style={{ color: '#e91e8c', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 600, color: '#e91e8c' }}>
                      Secured by SSLCommerz
                    </span>
                  </div>
                )}

                <div className="co-summary-trust">
                  <div className="co-trust-item"><Shield size={16} /><span>Secure</span></div>
                  <div className="co-trust-item"><Truck size={16} /><span>Fast Delivery</span></div>
                </div>

                <div className="co-summary-payment-badges">
                  <span className="co-pm-badge co-pm-bkash">bKash</span>
                  <span className="co-pm-badge co-pm-nagad">Nagad</span>
                  <span className="co-pm-badge co-pm-visa">VISA</span>
                  <span className="co-pm-badge co-pm-mc">MC</span>
                  <span className="co-pm-badge co-pm-cod">COD</span>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </div>
  )
}