'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Tag,
} from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import {
  CURRENCY_SYMBOL,
  SHIPPING_INSIDE_DHAKA,
  FREE_SHIPPING_THRESHOLD,
} from '@/constants'

// ── Helper: selectedColor may be stored as a string OR a color object ──
// This handles both cases safely so React never tries to render an object.
type ColorObject = { name: string; hex: string; stock?: number; _id?: string }
type SelectedColor = string | ColorObject

function resolveColor(
  selectedColor: SelectedColor,
  colors: ColorObject[]
): { colorName: string; colorHex: string } {
  if (typeof selectedColor === 'string') {
    const match = colors.find((c) => c.name === selectedColor)
    return {
      colorName: selectedColor,
      colorHex: match?.hex ?? '#E91E8C',
    }
  }
  // selectedColor is already the full color object
  return {
    colorName: selectedColor?.name ?? '',
    colorHex: selectedColor?.hex ?? '#E91E8C',
  }
}

// ── Cart Item Row ─────────────────────────────
function CartItem({
  item,
}: {
  item: ReturnType<typeof useCartStore.getState>['items'][0]
}) {
  const { updateQuantity, removeItem } = useCartStore()

  // Safely resolve color regardless of how it was stored
  const { colorName, colorHex } = resolveColor(
    item.selectedColor as SelectedColor,
    item.product.colors as ColorObject[]
  )

  const handleRemove = () => {
    removeItem(item.product._id, item.selectedColor)
  }

  const handleIncrease = () => {
    updateQuantity(item.product._id, item.selectedColor, item.quantity + 1)
  }

  const handleDecrease = () => {
    updateQuantity(item.product._id, item.selectedColor, item.quantity - 1)
  }

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        {item.product.mainImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.product.mainImage.url}
            alt={item.product.name}
            className="cart-item-img"
          />
        ) : (
          <div className="cart-item-placeholder">
            <svg viewBox="0 0 80 90" fill="none" width="50">
              <path
                d="M25 32 Q25 16 40 16 Q55 16 55 32"
                stroke="#C9A84C"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <rect x="10" y="32" width="60" height="48" rx="8" fill="#E91E8C" />
              <path d="M10 48 Q40 36 70 48 L70 32 Q40 22 10 32 Z" fill="#b5156d" />
              <circle cx="40" cy="50" r="5" fill="#C9A84C" />
              <circle cx="40" cy="50" r="2.5" fill="#1A1A2E" />
            </svg>
          </div>
        )}
      </div>

      <div className="cart-item-info">
        <div className="cart-item-header">
          <div>
            <p className="cart-item-name">{item.product.name}</p>
            <p className="cart-item-color">
              <span
                className="cart-item-color-dot"
                style={{ background: colorHex }}
              />
              {/* colorName is always a string — safe to render */}
              {colorName}
            </p>
          </div>
          <button
            onClick={handleRemove}
            className="cart-item-remove"
            aria-label="Remove item"
          >
            <Trash2 size={15} />
          </button>
        </div>

        <div className="cart-item-footer">
          <div className="cart-quantity">
            <button
              onClick={handleDecrease}
              className="cart-qty-btn"
              aria-label="Decrease"
            >
              <Minus size={13} />
            </button>
            <span className="cart-qty-value">{item.quantity}</span>
            <button
              onClick={handleIncrease}
              className="cart-qty-btn"
              aria-label="Increase"
            >
              <Plus size={13} />
            </button>
          </div>
          <p className="cart-item-price">
            {CURRENCY_SYMBOL}
            {(item.price * item.quantity).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Cart Drawer ───────────────────────────────
export default function CartDrawer() {
  const { items, isOpen, closeCart, getSubtotal, clearCart } = useCartStore()
  const drawerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Mount check — fixes hydration mismatch
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  // Derived values — safe after mount
  const subtotal = isMounted ? getSubtotal() : 0
  const itemCount = isMounted
    ? items.reduce((t, i) => t + i.quantity, 0)
    : 0
  const shippingFee =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_INSIDE_DHAKA
  const total = subtotal + shippingFee
  const freeShippingLeft = FREE_SHIPPING_THRESHOLD - subtotal

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(e.target as Node)
      ) {
        closeCart()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClick)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.body.style.overflow = ''
    }
  }, [isOpen, closeCart])

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [closeCart])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cart-backdrop ${isOpen ? 'cart-backdrop-visible' : ''}`}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`cart-drawer ${isOpen ? 'cart-drawer-open' : ''}`}
        role="dialog"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="cart-header">
          <div className="cart-header-left">
            <ShoppingBag size={22} strokeWidth={1.5} />
            <h2 className="cart-title">My Cart</h2>
            {isMounted && itemCount > 0 && (
              <span className="cart-count-badge">{itemCount}</span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="cart-close-btn"
            aria-label="Close cart"
          >
            <X size={22} />
          </button>
        </div>

        {/* Free Shipping Progress */}
        {isMounted && subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
          <div className="cart-shipping-progress">
            <div className="cart-shipping-text">
              <Tag size={13} />
              <span>
                Add{' '}
                <strong>
                  {CURRENCY_SYMBOL}
                  {freeShippingLeft.toLocaleString()}
                </strong>{' '}
                more for free delivery!
              </span>
            </div>
            <div className="cart-progress-bar">
              <div
                className="cart-progress-fill"
                style={{
                  width: `${Math.min(
                    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        )}

        {isMounted && subtotal >= FREE_SHIPPING_THRESHOLD && subtotal > 0 && (
          <div className="cart-free-shipping">
            🎉 You&apos;ve unlocked free delivery!
          </div>
        )}

        {/* Cart Items */}
        <div className="cart-items-container">
          {!isMounted || items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">
                <ShoppingBag size={48} strokeWidth={1} />
              </div>
              <h3 className="cart-empty-title">Your cart is empty</h3>
              <p className="cart-empty-subtitle">
                Discover our trendy mini crossbody bags and add your favorites!
              </p>
              <button
                onClick={closeCart}
                className="btn-primary cart-empty-btn"
              >
                Start Shopping
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {items.map((item) => (
                <CartItem
                  key={`${item.product._id}-${
                    typeof item.selectedColor === 'string'
                      ? item.selectedColor
                      : (item.selectedColor as ColorObject)?.name ?? ''
                  }`}
                  item={item}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {isMounted && items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary">
              <div className="cart-summary-row">
                <span>Subtotal ({itemCount} items)</span>
                <span>
                  {CURRENCY_SYMBOL}
                  {subtotal.toLocaleString()}
                </span>
              </div>
              <div className="cart-summary-row">
                <span>Delivery</span>
                <span
                  className={shippingFee === 0 ? 'cart-summary-free' : ''}
                >
                  {shippingFee === 0
                    ? 'FREE'
                    : `${CURRENCY_SYMBOL}${shippingFee}`}
                </span>
              </div>
              <div className="cart-summary-divider" />
              <div className="cart-summary-row cart-summary-total">
                <span>Total</span>
                <span>
                  {CURRENCY_SYMBOL}
                  {total.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="cart-actions">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="btn-primary cart-checkout-btn"
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="btn-secondary cart-view-btn"
              >
                View Full Cart
              </Link>
            </div>

            <button
              onClick={() => {
                if (confirm('Clear all items from cart?')) clearCart()
              }}
              className="cart-clear-btn"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  )
}