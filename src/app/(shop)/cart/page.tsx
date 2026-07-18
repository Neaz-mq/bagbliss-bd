'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Tag,
  Shield,
  Truck,
  RotateCcw,
  X,
} from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import {
  CURRENCY_SYMBOL,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_INSIDE_DHAKA,
  SHIPPING_OUTSIDE_DHAKA,
} from '@/constants'
import toast from 'react-hot-toast'

// ── Coupon codes (mock) ───────────────────────
const VALID_COUPONS: Record<
  string,
  { type: 'percent' | 'fixed'; value: number }
> = {
  BAGBLISS10: { type: 'percent', value: 10 },
  WELCOME50: { type: 'fixed', value: 50 },
  NEWGIRL20: { type: 'percent', value: 20 },
}

// ── Helper: safely resolve selectedColor to a plain string ────────────
// selectedColor may arrive as a string OR as a color object {name, hex, stock, _id}
function resolveColorName(color: unknown): string {
  if (typeof color === 'string') return color
  if (color && typeof color === 'object') {
    const c = color as Record<string, unknown>
    if (typeof c.name === 'string') return c.name
    if (typeof c.hex === 'string') return c.hex
  }
  return 'Default'
}

function resolveColorHex(color: unknown, fallbackHex = '#E91E8C'): string {
  if (typeof color === 'string') return fallbackHex // it's a name, not a hex
  if (color && typeof color === 'object') {
    const c = color as Record<string, unknown>
    if (typeof c.hex === 'string') return c.hex
  }
  return fallbackHex
}

// ── Cart Item Row ─────────────────────────────
function CartPageItem({
  item,
}: {
  item: ReturnType<typeof useCartStore.getState>['items'][0]
}) {
  const { updateQuantity, removeItem } = useCartStore()
  const { toggleItem, isWishlisted } = useWishlistStore()

  // Safely extract color name & hex regardless of whether selectedColor is
  // a plain string or a color object {name, hex, stock, _id}
  const colorName = resolveColorName(item.selectedColor)
  const colorHex =
    resolveColorHex(item.selectedColor) ||
    item.product.colors.find((c) => c.name === colorName)?.hex ||
    '#E91E8C'

  const currentPrice = item.price
  const totalPrice = currentPrice * item.quantity

  const handleRemove = () => {
    removeItem(item.product._id, colorName)
    toast.success('Item removed from cart')
  }

  const handleMoveToWishlist = () => {
    toggleItem(item.product._id)
    removeItem(item.product._id, colorName)
    toast.success('❤️ Moved to wishlist!')
  }

  return (
    <div className="cart-page-item">
      {/* Product Image */}
      <Link
        href={`/product/${item.product.slug}`}
        className="cart-page-item-image"
      >
        {item.product.mainImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.product.mainImage.url}
            alt={item.product.name}
            className="cart-page-item-img"
          />
        ) : (
          <div className="cart-page-img-placeholder">
            <svg viewBox="0 0 100 115" fill="none" width="65">
              <path
                d="M30 42 Q30 18 50 18 Q70 18 70 42"
                stroke="#C9A84C"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
              <rect
                x="10"
                y="42"
                width="80"
                height="62"
                rx="12"
                fill="#E91E8C"
              />
              <path
                d="M10 62 Q50 46 90 62 L90 42 Q50 28 10 42 Z"
                fill="#b5156d"
              />
              <circle cx="50" cy="64" r="8" fill="#C9A84C" />
              <circle cx="50" cy="64" r="4" fill="#1A1A2E" />
            </svg>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="cart-page-item-details">
        {/* Top row */}
        <div className="cart-page-item-top">
          <div className="cart-page-item-meta">
            <span className="cart-page-item-category">
              {item.product.category}
            </span>
            <Link
              href={`/product/${item.product.slug}`}
              className="cart-page-item-name"
            >
              {item.product.name}
            </Link>
            <div className="cart-page-item-color">
              <span
                className="cart-page-color-dot"
                style={{ background: colorHex }}
              />
              {/* ✅ Always renders a plain string, never an object */}
              <span>{colorName}</span>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="cart-page-remove-btn"
            aria-label="Remove item"
          >
            <X size={18} />
          </button>
        </div>

        {/* Bottom row */}
        <div className="cart-page-item-bottom">
          {/* Quantity */}
          <div className="cart-page-quantity">
            <button
              onClick={() =>
                updateQuantity(
                  item.product._id,
                  colorName,
                  item.quantity - 1
                )
              }
              className="cart-page-qty-btn"
              disabled={item.quantity <= 1}
              aria-label="Decrease"
            >
              <Minus size={14} />
            </button>
            <span className="cart-page-qty-value">{item.quantity}</span>
            <button
              onClick={() =>
                updateQuantity(
                  item.product._id,
                  colorName,
                  item.quantity + 1
                )
              }
              className="cart-page-qty-btn"
              aria-label="Increase"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Price + Wishlist */}
          <div className="cart-page-item-price-col">
            <span className="cart-page-item-price">
              {CURRENCY_SYMBOL}
              {totalPrice.toLocaleString()}
            </span>
            <span className="cart-page-unit-price">
              {CURRENCY_SYMBOL}
              {currentPrice.toLocaleString()} each
            </span>
            <button
              onClick={handleMoveToWishlist}
              className={`cart-page-wish-btn ${
                isWishlisted(item.product._id) ? 'cart-page-wish-active' : ''
              }`}
            >
              {isWishlisted(item.product._id)
                ? '❤️ In Wishlist'
                : '♡ Move to Wishlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Cart Page ────────────────────────────
export default function CartPage() {
  const router = useRouter()
  const { items, getSubtotal, clearCart } = useCartStore()
  const [isMounted, setIsMounted] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    type: 'percent' | 'fixed'
    value: number
  } | null>(null)
  const [couponError, setCouponError] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [deliveryType, setDeliveryType] = useState<'inside' | 'outside'>(
    'inside'
  )

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  const subtotal = isMounted ? getSubtotal() : 0
  const itemCount = isMounted ? items.reduce((t, i) => t + i.quantity, 0) : 0
  const shippingFee =
    subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : deliveryType === 'inside'
        ? SHIPPING_INSIDE_DHAKA
        : SHIPPING_OUTSIDE_DHAKA

  const discountAmount = appliedCoupon
    ? appliedCoupon.type === 'percent'
      ? Math.round((subtotal * appliedCoupon.value) / 100)
      : appliedCoupon.value
    : 0

  const total = subtotal + shippingFee - discountAmount

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setIsApplying(true)
    setCouponError('')

    await new Promise((r) => setTimeout(r, 600))

    const coupon = VALID_COUPONS[couponCode.toUpperCase()]
    if (coupon) {
      setAppliedCoupon({ code: couponCode.toUpperCase(), ...coupon })
      toast.success(
        `🎉 Coupon applied! ${coupon.type === 'percent' ? coupon.value + '% off' : CURRENCY_SYMBOL + coupon.value + ' off'}`
      )
      setCouponCode('')
    } else {
      setCouponError('Invalid coupon code. Try: BAGBLISS10')
    }
    setIsApplying(false)
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    toast.success('Coupon removed')
  }

  if (!isMounted) return null

  // ── Empty Cart ──────────────────────────────
  if (items.length === 0) {
    return (
      <div className="cart-page-empty">
        <div className="cart-page-empty-inner">
          <div className="cart-page-empty-icon">
            <ShoppingBag size={64} strokeWidth={1} color="#E91E8C" />
          </div>
          <h1 className="cart-page-empty-title">Your cart is empty</h1>
          <p className="cart-page-empty-desc">
            Looks like you haven&apos;t added any bags yet. Explore our
            collection and find your perfect bag!
          </p>
          <div className="cart-page-empty-actions">
            <Link href="/shop" className="btn-primary">
              <ShoppingBag size={18} />
              Start Shopping
              <ArrowRight size={16} />
            </Link>
            <Link href="/flash-sale" className="btn-secondary">
              ⚡ View Flash Sale
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="container-bagbliss">
        {/* Page Header */}
        <div className="cart-page-header">
          <div>
            <h1 className="cart-page-title">Shopping Cart</h1>
            <p className="cart-page-subtitle">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <Link href="/shop" className="cart-page-continue-link">
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>
        </div>

        {/* Free shipping progress */}
        {subtotal < FREE_SHIPPING_THRESHOLD && (
          <div className="cart-page-shipping-bar">
            <div className="cart-page-shipping-bar-text">
              <Tag size={14} />
              <span>
                Add{' '}
                <strong>
                  {CURRENCY_SYMBOL}
                  {(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString()}
                </strong>{' '}
                more to get <strong>FREE delivery!</strong>
              </span>
            </div>
            <div className="cart-page-shipping-bar-track">
              <div
                className="cart-page-shipping-bar-fill"
                style={{
                  width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {subtotal >= FREE_SHIPPING_THRESHOLD && (
          <div className="cart-page-free-ship-alert">
            🎉 Congratulations! You&apos;ve unlocked{' '}
            <strong>FREE delivery!</strong>
          </div>
        )}

        {/* Main Content */}
        <div className="cart-page-layout">
          {/* ── Left: Items ──────────────────── */}
          <div className="cart-page-items-col">
            <div className="cart-page-items-card">
              <div className="cart-page-items-header">
                <h2 className="cart-page-items-title">
                  Order Items ({itemCount})
                </h2>
                <button
                  onClick={() => {
                    if (confirm('Remove all items from cart?')) {
                      clearCart()
                      toast.success('Cart cleared')
                    }
                  }}
                  className="cart-page-clear-btn"
                >
                  <Trash2 size={14} />
                  Clear Cart
                </button>
              </div>

              <div className="cart-page-items-list">
                {items.map((item, i) => {
                  // ✅ Key uses resolved string, never [object Object]
                  const colorKey = resolveColorName(item.selectedColor)
                  return (
                    <CartPageItem
                      key={`${item.product._id}-${colorKey}-${i}`}
                      item={item}
                    />
                  )
                })}
              </div>
            </div>

            {/* Coupon Code */}
            <div className="cart-page-coupon-card">
              <h3 className="cart-page-coupon-title">
                <Tag size={18} />
                Have a Coupon Code?
              </h3>

              {appliedCoupon ? (
                <div className="cart-page-coupon-applied">
                  <div className="cart-page-coupon-applied-info">
                    <span className="cart-page-coupon-code">
                      {appliedCoupon.code}
                    </span>
                    <span className="cart-page-coupon-savings">
                      {appliedCoupon.type === 'percent'
                        ? `${appliedCoupon.value}% off`
                        : `${CURRENCY_SYMBOL}${appliedCoupon.value} off`}
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="cart-page-coupon-remove"
                  >
                    <X size={14} />
                    Remove
                  </button>
                </div>
              ) : (
                <div className="cart-page-coupon-form">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase())
                      setCouponError('')
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    className={`cart-page-coupon-input ${couponError ? 'cart-coupon-error' : ''}`}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isApplying || !couponCode.trim()}
                    className="cart-page-coupon-btn"
                  >
                    {isApplying ? (
                      <span
                        className="spinner"
                        style={{
                          width: '16px',
                          height: '16px',
                          borderTopColor: 'white',
                        }}
                      />
                    ) : (
                      'Apply'
                    )}
                  </button>
                </div>
              )}

              {couponError && (
                <p className="cart-page-coupon-error">{couponError}</p>
              )}

              <p className="cart-page-coupon-hint">
                Try: <strong>BAGBLISS10</strong> for 10% off or{' '}
                <strong>NEWGIRL20</strong> for 20% off
              </p>
            </div>

            {/* Delivery Options */}
            <div className="cart-page-delivery-card">
              <h3 className="cart-page-delivery-title">
                <Truck size={18} />
                Select Delivery Area
              </h3>
              <div className="cart-page-delivery-options">
                <button
                  onClick={() => setDeliveryType('inside')}
                  className={`cart-page-delivery-option ${
                    deliveryType === 'inside' ? 'cart-delivery-active' : ''
                  }`}
                >
                  <div className="cart-delivery-radio">
                    <div
                      className={`cart-delivery-radio-dot ${deliveryType === 'inside' ? 'cart-delivery-radio-active' : ''}`}
                    />
                  </div>
                  <div className="cart-delivery-info">
                    <span className="cart-delivery-label">Inside Dhaka</span>
                    <span className="cart-delivery-time">1–2 business days</span>
                  </div>
                  <span className="cart-delivery-fee">
                    {subtotal >= FREE_SHIPPING_THRESHOLD
                      ? 'FREE'
                      : `${CURRENCY_SYMBOL}${SHIPPING_INSIDE_DHAKA}`}
                  </span>
                </button>

                <button
                  onClick={() => setDeliveryType('outside')}
                  className={`cart-page-delivery-option ${
                    deliveryType === 'outside' ? 'cart-delivery-active' : ''
                  }`}
                >
                  <div className="cart-delivery-radio">
                    <div
                      className={`cart-delivery-radio-dot ${deliveryType === 'outside' ? 'cart-delivery-radio-active' : ''}`}
                    />
                  </div>
                  <div className="cart-delivery-info">
                    <span className="cart-delivery-label">Outside Dhaka</span>
                    <span className="cart-delivery-time">3–5 business days</span>
                  </div>
                  <span className="cart-delivery-fee">
                    {subtotal >= FREE_SHIPPING_THRESHOLD
                      ? 'FREE'
                      : `${CURRENCY_SYMBOL}${SHIPPING_OUTSIDE_DHAKA}`}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Right: Summary ────────────────── */}
          <div className="cart-page-summary-col">
            <div className="cart-page-summary-card">
              <h2 className="cart-page-summary-title">Order Summary</h2>

              <div className="cart-page-summary-rows">
                <div className="cart-page-summary-row">
                  <span>
                    Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                  </span>
                  <span>
                    {CURRENCY_SYMBOL}
                    {subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="cart-page-summary-row">
                  <span>
                    Delivery (
                    {deliveryType === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'}
                    )
                  </span>
                  <span
                    className={shippingFee === 0 ? 'cart-summary-free-text' : ''}
                  >
                    {shippingFee === 0
                      ? 'FREE'
                      : `${CURRENCY_SYMBOL}${shippingFee}`}
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="cart-page-summary-row cart-page-summary-discount">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span>
                      -{CURRENCY_SYMBOL}
                      {discountAmount.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="cart-page-summary-divider" />

                <div className="cart-page-summary-row cart-page-summary-total">
                  <span>Total</span>
                  <span>
                    {CURRENCY_SYMBOL}
                    {total.toLocaleString()}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="cart-page-savings">
                    🎉 You&apos;re saving{' '}
                    <strong>
                      {CURRENCY_SYMBOL}
                      {discountAmount.toLocaleString()}
                    </strong>{' '}
                    on this order!
                  </div>
                )}
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="cart-page-checkout-btn"
              >
                Proceed to Checkout
                <ArrowRight size={20} />
              </button>

              <p className="cart-page-cod-note">
                💵 Cash on Delivery also available at checkout
              </p>

              <div className="cart-page-trust">
                <div className="cart-page-trust-item">
                  <Shield size={16} />
                  <span>Secure Checkout</span>
                </div>
                <div className="cart-page-trust-item">
                  <Truck size={16} />
                  <span>Fast Delivery</span>
                </div>
                <div className="cart-page-trust-item">
                  <RotateCcw size={16} />
                  <span>7-Day Returns</span>
                </div>
              </div>

              <div className="cart-page-payment-methods">
                <p className="cart-page-payment-label">We accept:</p>
                <div className="cart-page-payment-badges">
                  <span className="cart-pm-badge cart-pm-bkash">bKash</span>
                  <span className="cart-pm-badge cart-pm-nagad">Nagad</span>
                  <span className="cart-pm-badge cart-pm-rocket">Rocket</span>
                  <span className="cart-pm-badge cart-pm-visa">VISA</span>
                  <span className="cart-pm-badge cart-pm-mc">MC</span>
                </div>
              </div>
            </div>

            <div className="cart-page-help-card">
              <p className="cart-page-help-text">Need help with your order?</p>
              <Link href="/contact" className="cart-page-help-link">
                Contact Support →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}