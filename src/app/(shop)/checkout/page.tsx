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
  ChevronRight,
  ShoppingBag,
  Truck,
  Shield,
  CreditCard,
  Smartphone,
  Banknote,
  MapPin,
  User,
  Phone,
  Mail,
  Home,
  AlertCircle,
  CheckCircle2,
  Lock,
  Zap,
  ChevronLeft,
  Tag,
} from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'

// ── Validation Schema ──────────────────────────────────────────────────────
const checkoutSchema = z.object({
  fullName:    z.string().min(3, 'Full name must be at least 3 characters'),
  phone:       z.string().regex(/^(\+88)?01[3-9]\d{8}$/, 'Enter a valid BD phone number'),
  email:       z.string().email('Enter a valid email address').optional().or(z.literal('')),
  division:    z.string().min(1, 'Please select a division'),
  district:    z.string().min(1, 'Please enter your district'),
  thana:       z.string().min(1, 'Please enter your thana/upazila'),
  address:     z.string().min(10, 'Address must be at least 10 characters'),
  postalCode:  z.string().regex(/^\d{4}$/, 'Enter a valid 4-digit postal code').optional().or(z.literal('')),
  orderNote:   z.string().optional(),
})

type CheckoutForm = z.infer<typeof checkoutSchema>

// ── Constants ──────────────────────────────────────────────────────────────
const DIVISIONS = [
  'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi',
  'Khulna', 'Barisal', 'Rangpur', 'Mymensingh',
]

const DELIVERY_OPTIONS = [
  {
    id:    'standard',
    label: 'Standard Delivery',
    time:  '3–5 business days',
    fee:   60,
    icon:  Truck,
  },
  {
    id:    'express',
    label: 'Express Delivery',
    time:  '1–2 business days',
    fee:   120,
    icon:  Zap,
  },
]

const PAYMENT_METHODS = [
  { id: 'cod',    label: 'Cash on Delivery', icon: Banknote,    desc: 'Pay when you receive', color: '#1a1a2e' },
  { id: 'bkash',  label: 'bKash',            icon: Smartphone,  desc: 'Pay via bKash',        color: '#e2136e' },
  { id: 'nagad',  label: 'Nagad',             icon: Smartphone,  desc: 'Pay via Nagad',        color: '#f6a623' },
  { id: 'card',   label: 'Card',              icon: CreditCard,  desc: 'Visa / Mastercard',    color: '#1a1f71' },
]

const FREE_SHIPPING_THRESHOLD = 1500

// ── Bag placeholder (for cart items with no image) ─────────────────────────
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

// ── Step indicator ─────────────────────────────────────────────────────────
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

// ── Main Page ──────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router   = useRouter()
  const { data: session } = useSession()
  const items    = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)

  const [delivery,    setDelivery]    = useState('standard')
  const [payment,     setPayment]     = useState('cod')
  const [isPlacing,   setIsPlacing]   = useState(false)
  const [placed,      setPlaced]      = useState(false)
  const [step,        setStep]        = useState<1 | 2>(1)    // 1 = info, 2 = review
  const [orderTotal,  setOrderTotal]  = useState(0)           // captured before cart is cleared
  const [orderId,     setOrderId]     = useState('')          // captured once, stable across re-renders

  const deliveryFee  = DELIVERY_OPTIONS.find((d) => d.id === delivery)?.fee ?? 60
  const subtotal     = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD
  const shipping     = freeShipping ? 0 : deliveryFee
  const total        = subtotal + shipping

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: session?.user?.name ?? '',
      email:    session?.user?.email ?? '',
      phone:    '',
      division: '',
      district: '',
      thana:    '',
      address:  '',
    },
  })

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !placed) router.replace('/shop')
  }, [items, placed, router])

  const onSubmit = async (data: CheckoutForm) => {
  if (step === 1) { setStep(2); return }

  setIsPlacing(true)
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((item) => ({
          productId: item.product._id,
          name:      item.product.name,
          price:     item.price,
          quantity:  item.quantity,
          color:     item.selectedColor,
          image:     item.product.mainImage?.url ?? '',
        })),
        shipping: {
          fullName:   data.fullName,
          phone:      data.phone,
          email:      data.email ?? '',
          division:   data.division,
          district:   data.district,
          thana:      data.thana,
          address:    data.address,
          postalCode: data.postalCode ?? '',
        },
        delivery:    delivery,
        deliveryFee: freeShipping ? 0 : deliveryFee,
        payment:     payment,
        subtotal:    subtotal,
        total:       total,
        orderNote:   data.orderNote ?? '',
      }),
    })

    const json = await res.json()
    if (!json.success) throw new Error(json.error)

    setOrderTotal(total)
    setOrderId(json.order.orderNumber)
    clearCart()
    setPlaced(true)
    toast.success(`🎉 Order placed for ${data.fullName}!`)
   } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    toast.error('Failed to place order. Please try again.')
  } finally {
    setIsPlacing(false)
  }
}

  // ── Order Placed confirmation ──────────────────────────────────────────
  if (placed) {
    return (
      <div className="co-success-page">
        <div className="co-success-inner">
          <div className="co-success-icon">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="co-success-title">Order Confirmed! 🎉</h1>
          <p className="co-success-desc">
            Thank you for your order! We will process it shortly and send you a
            confirmation. Expected delivery in{' '}
            {delivery === 'express' ? '1–2' : '3–5'} business days.
          </p>
          <div className="co-success-meta">
            <div className="co-success-meta-item">
              <span>Order ID</span>
              <strong>#{orderId}</strong>
            </div>
            <div className="co-success-meta-item">
              <span>Payment</span>
              <strong>{PAYMENT_METHODS.find((p) => p.id === payment)?.label}</strong>
            </div>
            <div className="co-success-meta-item">
              <span>Total</span>
              <strong>৳{orderTotal.toLocaleString('en-BD')}</strong>
            </div>
          </div>
          <div className="co-success-actions">
            <Link href="/shop" className="btn-primary">
              <ShoppingBag size={18} /> Continue Shopping
            </Link>
            <Link href="/account/orders" className="btn-secondary">
              Track Order
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="co-page">
      {/* ── Breadcrumb ────────────────────────────────────────────────── */}
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
        {/* ── Header + Steps ──────────────────────────────────────────── */}
        <div className="co-header">
          <div>
            <h1 className="co-title">Checkout</h1>
            <p className="co-subtitle">{items.length} item{items.length !== 1 ? 's' : ''} in your order</p>
          </div>
          <div className="co-steps">
            <StepBadge step={1} label="Details"  active={step === 1} done={step > 1} />
            <div className="co-steps-connector" />
            <StepBadge step={2} label="Review"   active={step === 2} done={false} />
          </div>
        </div>

        {/* ── Main Layout ──────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="co-layout">
            {/* ── Left column ──────────────────────────────────────── */}
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
                      {/* Full Name */}
                      <div className="co-field co-field-half">
                        <label className="co-label">
                          <User size={14} /> Full Name *
                        </label>
                        <input
                          {...register('fullName')}
                          className={`co-input ${errors.fullName ? 'co-input-error' : ''}`}
                          placeholder="Fatima Rahman"
                        />
                        {errors.fullName && (
                          <span className="co-field-error">
                            <AlertCircle size={12} /> {errors.fullName.message}
                          </span>
                        )}
                      </div>

                      {/* Phone */}
                      <div className="co-field co-field-half">
                        <label className="co-label">
                          <Phone size={14} /> Phone Number *
                        </label>
                        <input
                          {...register('phone')}
                          className={`co-input ${errors.phone ? 'co-input-error' : ''}`}
                          placeholder="01XXXXXXXXX"
                          type="tel"
                        />
                        {errors.phone && (
                          <span className="co-field-error">
                            <AlertCircle size={12} /> {errors.phone.message}
                          </span>
                        )}
                      </div>

                      {/* Email */}
                      <div className="co-field co-field-full">
                        <label className="co-label">
                          <Mail size={14} /> Email Address (optional)
                        </label>
                        <input
                          {...register('email')}
                          className={`co-input ${errors.email ? 'co-input-error' : ''}`}
                          placeholder="your@email.com"
                          type="email"
                        />
                        {errors.email && (
                          <span className="co-field-error">
                            <AlertCircle size={12} /> {errors.email.message}
                          </span>
                        )}
                      </div>

                      {/* Division */}
                      <div className="co-field co-field-third">
                        <label className="co-label">Division *</label>
                        <select
                          {...register('division')}
                          className={`co-input co-select ${errors.division ? 'co-input-error' : ''}`}
                        >
                          <option value="">Select Division</option>
                          {DIVISIONS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        {errors.division && (
                          <span className="co-field-error">
                            <AlertCircle size={12} /> {errors.division.message}
                          </span>
                        )}
                      </div>

                      {/* District */}
                      <div className="co-field co-field-third">
                        <label className="co-label">District *</label>
                        <input
                          {...register('district')}
                          className={`co-input ${errors.district ? 'co-input-error' : ''}`}
                          placeholder="e.g. Dhaka"
                        />
                        {errors.district && (
                          <span className="co-field-error">
                            <AlertCircle size={12} /> {errors.district.message}
                          </span>
                        )}
                      </div>

                      {/* Thana */}
                      <div className="co-field co-field-third">
                        <label className="co-label">Thana / Upazila *</label>
                        <input
                          {...register('thana')}
                          className={`co-input ${errors.thana ? 'co-input-error' : ''}`}
                          placeholder="e.g. Gulshan"
                        />
                        {errors.thana && (
                          <span className="co-field-error">
                            <AlertCircle size={12} /> {errors.thana.message}
                          </span>
                        )}
                      </div>

                      {/* Address */}
                      <div className="co-field co-field-full">
                        <label className="co-label">
                          <Home size={14} /> Full Address *
                        </label>
                        <textarea
                          {...register('address')}
                          className={`co-input co-textarea ${errors.address ? 'co-input-error' : ''}`}
                          placeholder="House no, Road no, Area, Landmark…"
                          rows={3}
                        />
                        {errors.address && (
                          <span className="co-field-error">
                            <AlertCircle size={12} /> {errors.address.message}
                          </span>
                        )}
                      </div>

                      {/* Postal Code */}
                      <div className="co-field co-field-half">
                        <label className="co-label">Postal Code</label>
                        <input
                          {...register('postalCode')}
                          className={`co-input ${errors.postalCode ? 'co-input-error' : ''}`}
                          placeholder="1212"
                          maxLength={4}
                        />
                        {errors.postalCode && (
                          <span className="co-field-error">
                            <AlertCircle size={12} /> {errors.postalCode.message}
                          </span>
                        )}
                      </div>

                      {/* Order Note */}
                      <div className="co-field co-field-full">
                        <label className="co-label">
                          <Tag size={14} /> Order Note (optional)
                        </label>
                        <textarea
                          {...register('orderNote')}
                          className="co-input co-textarea"
                          placeholder="Special instructions, color preferences…"
                          rows={2}
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
                      {DELIVERY_OPTIONS.map((opt) => {
                        const Icon = opt.icon
                        const active = delivery === opt.id
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setDelivery(opt.id)}
                            className={`co-delivery-opt ${active ? 'co-delivery-opt-active' : ''}`}
                          >
                            <div className={`co-delivery-radio ${active ? 'co-delivery-radio-active' : ''}`}>
                              {active && <div className="co-delivery-radio-dot" />}
                            </div>
                            <div className="co-delivery-icon-wrap">
                              <Icon size={20} />
                            </div>
                            <div className="co-delivery-info">
                              <span className="co-delivery-label">{opt.label}</span>
                              <span className="co-delivery-time">{opt.time}</span>
                            </div>
                            <div className="co-delivery-fee">
                              {freeShipping ? (
                                <span className="co-delivery-free">FREE</span>
                              ) : (
                                <span>৳{opt.fee}</span>
                              )}
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
                      {PAYMENT_METHODS.map((pm) => {
                        const Icon = pm.icon
                        const active = payment === pm.id
                        return (
                          <button
                            key={pm.id}
                            type="button"
                            onClick={() => setPayment(pm.id)}
                            className={`co-payment-opt ${active ? 'co-payment-opt-active' : ''}`}
                            style={{ '--pm-color': pm.color } as React.CSSProperties}
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

                    {/* bKash / Nagad number input */}
                    {(payment === 'bkash' || payment === 'nagad') && (
                      <div className="co-mobile-banking">
                        <div className="co-mb-instructions">
                          <p className="co-mb-step">
                            <strong>Step 1:</strong> Send money to <strong>01XXXXXXXXX</strong> via {payment === 'bkash' ? 'bKash' : 'Nagad'}
                          </p>
                          <p className="co-mb-step">
                            <strong>Step 2:</strong> Enter your transaction ID below
                          </p>
                        </div>
                        <input
                          className="co-input"
                          placeholder="Transaction ID (e.g. 8N5TXX…)"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  {/* Review: shipping address summary */}
                  <div className="co-card">
                    <div className="co-card-header">
                      <MapPin size={20} className="co-card-icon" />
                      <h2 className="co-card-title">Shipping Address</h2>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="co-edit-btn"
                      >
                        Edit
                      </button>
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

                  {/* Review: items */}
                  <div className="co-card">
                    <div className="co-card-header">
                      <ShoppingBag size={20} className="co-card-icon" />
                      <h2 className="co-card-title">Order Items ({items.length})</h2>
                    </div>
                    <div className="co-review-items">
                      {items.map((item) => (
                        <div key={item.product._id + item.selectedColor} className="co-review-item">
                          <div className="co-review-item-img">
                            {item.product.mainImage?.url ? (
                              <Image
                                src={item.product.mainImage.url}
                                alt={item.product.name}
                                fill
                                sizes="72px"
                                className="co-review-item-photo"
                              />
                            ) : (
                              <ItemPlaceholder />
                            )}
                          </div>
                          <div className="co-review-item-info">
                            <p className="co-review-item-name">{item.product.name}</p>
                            <p className="co-review-item-color">
                              Color: {item.selectedColor}
                            </p>
                            <p className="co-review-item-qty">Qty: {item.quantity}</p>
                          </div>
                          <span className="co-review-item-price">
                            ৳{(item.price * item.quantity).toLocaleString('en-BD')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Review: payment & delivery */}
                  <div className="co-card">
                    <div className="co-card-header">
                      <CreditCard size={20} className="co-card-icon" />
                      <h2 className="co-card-title">Payment & Delivery</h2>
                      <button type="button" onClick={() => setStep(1)} className="co-edit-btn">Edit</button>
                    </div>
                    <div className="co-review-pd">
                      <div className="co-review-pd-item">
                        <span>Payment</span>
                        <strong>{PAYMENT_METHODS.find((p) => p.id === payment)?.label}</strong>
                      </div>
                      <div className="co-review-pd-item">
                        <span>Delivery</span>
                        <strong>{DELIVERY_OPTIONS.find((d) => d.id === delivery)?.label}</strong>
                      </div>
                      <div className="co-review-pd-item">
                        <span>Estimated Time</span>
                        <strong>{DELIVERY_OPTIONS.find((d) => d.id === delivery)?.time}</strong>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Navigation buttons */}
              <div className="co-nav-btns">
                {step === 1 ? (
                  <Link href="/cart" className="co-back-link">
                    <ChevronLeft size={16} /> Back to Cart
                  </Link>
                ) : (
                  <button type="button" onClick={() => setStep(1)} className="co-back-link">
                    <ChevronLeft size={16} /> Back to Details
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isPlacing}
                  className="co-next-btn"
                >
                  {isPlacing ? (
                    <><span className="co-btn-spinner" /> Processing…</>
                  ) : step === 1 ? (
                    <>Review Order <ChevronRight size={18} /></>
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

                {/* Items list */}
                <div className="co-summary-items">
                  {items.map((item) => (
                    <div key={item.product._id + item.selectedColor} className="co-summary-item">
                      <div className="co-summary-item-img">
                        {item.product.mainImage?.url ? (
                          <Image
                            src={item.product.mainImage.url}
                            alt={item.product.name}
                            fill
                            sizes="56px"
                            className="co-summary-item-photo"
                          />
                        ) : (
                          <ItemPlaceholder />
                        )}
                        <span className="co-summary-item-qty">{item.quantity}</span>
                      </div>
                      <div className="co-summary-item-info">
                        <p className="co-summary-item-name">{item.product.name}</p>
                        <p className="co-summary-item-variant">{item.selectedColor}</p>
                      </div>
                      <span className="co-summary-item-price">
                        ৳{(item.price * item.quantity).toLocaleString('en-BD')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="co-summary-divider" />

                {/* Totals */}
                <div className="co-summary-rows">
                  <div className="co-summary-row">
                    <span>Subtotal ({items.length} items)</span>
                    <span>৳{subtotal.toLocaleString('en-BD')}</span>
                  </div>
                  <div className="co-summary-row">
                    <span>Shipping</span>
                    {freeShipping ? (
                      <span className="co-summary-free">FREE</span>
                    ) : (
                      <span>৳{shipping}</span>
                    )}
                  </div>
                  {freeShipping && (
                    <div className="co-summary-saving">
                      <CheckCircle2 size={13} />
                      You saved ৳{deliveryFee} on shipping!
                    </div>
                  )}
                </div>

                <div className="co-summary-divider" />

                <div className="co-summary-total-row">
                  <span>Total</span>
                  <span className="co-summary-total-price">৳{total.toLocaleString('en-BD')}</span>
                </div>

                {/* Trust */}
                <div className="co-summary-trust">
                  <div className="co-trust-item">
                    <Shield size={16} />
                    <span>Secure Checkout</span>
                  </div>
                  <div className="co-trust-item">
                    <Truck size={16} />
                    <span>Fast Delivery BD</span>
                  </div>
                </div>

                {/* Payment badges */}
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