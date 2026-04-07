'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Zap, ArrowRight, ShoppingBag, Clock } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { CURRENCY_SYMBOL } from '@/constants'
import { IProduct } from '@/types'
import toast from 'react-hot-toast'

// ── Countdown Timer Hook ──────────────────────
function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime()
      const target = targetDate.getTime()
      const diff = target - now

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
        return
      }

      setTimeLeft({
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }

    calculate()
    const interval = setInterval(calculate, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  return timeLeft
}

// ── Timer Block ───────────────────────────────
function TimerBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flash-timer-block">
      <div className="flash-timer-value">
        {String(value).padStart(2, '0')}
      </div>
      <div className="flash-timer-label">{label}</div>
    </div>
  )
}

// ── Flash Product Card ────────────────────────
function FlashProductCard({
  product,
  index,
}: {
  product: IProduct
  index: number
}) {
  const { addItem, openCart } = useCartStore()
  const [isAdding, setIsAdding] = useState(false)

  const salePrice = product.flashSalePrice || product.discountPrice || product.price
  const originalPrice = product.price
  const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100)
  const soldPercent = Math.min(
    Math.round((product.soldCount / (product.soldCount + product.stock)) * 100),
    85
  )

  const handleAddToCart = async () => {
    setIsAdding(true)
    addItem({
      product,
      quantity: 1,
      selectedColor: product.colors[0]?.name || 'Default',
      price: salePrice,
    })
    toast.success('⚡ Added to cart!')
    openCart()
    setTimeout(() => setIsAdding(false), 600)
  }

  return (
    <div
      className="flash-card"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Discount Badge */}
      <div className="flash-discount-badge">
        <Zap size={12} fill="currentColor" />
        -{discount}%
      </div>

      {/* Product Image */}
      <Link href={`/product/${product.slug}`} className="flash-card-image">
        {product.mainImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.mainImage.url}
            alt={product.name}
            className="flash-product-img"
          />
        ) : (
          <div className="flash-placeholder">
            <svg viewBox="0 0 120 140" fill="none" width="90">
              <path
                d="M38 48 Q38 22 60 22 Q82 22 82 48"
                stroke="#C9A84C"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
              <rect x="14" y="48" width="92" height="72" rx="12" fill="#E91E8C" />
              <path d="M14 72 Q60 54 106 72 L106 48 Q60 32 14 48 Z" fill="#b5156d" />
              <circle cx="60" cy="74" r="8" fill="#C9A84C" />
              <circle cx="60" cy="74" r="4" fill="#1A1A2E" />
            </svg>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="flash-card-info">
        <span className="flash-card-category">{product.category}</span>
        <Link href={`/product/${product.slug}`}>
          <h3 className="flash-card-name">{product.name}</h3>
        </Link>

        {/* Price */}
        <div className="flash-price-row">
          <span className="flash-price-sale">
            {CURRENCY_SYMBOL}{salePrice.toLocaleString()}
          </span>
          <span className="flash-price-original">
            {CURRENCY_SYMBOL}{originalPrice.toLocaleString()}
          </span>
        </div>

        {/* Stock Progress */}
        <div className="flash-stock">
          <div className="flash-stock-header">
            <span className="flash-stock-label">
              <Clock size={11} />
              Selling fast!
            </span>
            <span className="flash-stock-count">
              {product.stock} left
            </span>
          </div>
          <div className="flash-stock-bar">
            <div
              className="flash-stock-fill"
              style={{ width: `${soldPercent}%` }}
            />
          </div>
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`flash-add-btn ${isAdding ? 'flash-add-btn-adding' : ''}`}
        >
          {isAdding ? (
            <>
              <span className="spinner" style={{ borderTopColor: 'white', width: '14px', height: '14px' }} />
              Adding...
            </>
          ) : (
            <>
              <ShoppingBag size={15} />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ── Flash Sale Products ───────────────────────
const FLASH_PRODUCTS: IProduct[] = [
  {
    _id: 'f1',
    name: 'Gold Chain Sling',
    slug: 'gold-chain-sling',
    description: 'Luxury gold chain strap crossbody',
    shortDescription: 'Statement piece',
    price: 1800,
    discountPrice: 1400,
    flashSalePrice: 1199,
    category: 'Chain Strap',
    tags: ['flash', 'luxury'],
    colors: [
      { name: 'Champagne', hex: '#C9A84C', images: [], stock: 12 },
      { name: 'Black', hex: '#1A1A2E', images: [], stock: 7 },
    ],
    mainImage: { url: '', cloudinaryId: '', alt: 'Gold Chain Sling' },
    status: 'active',
    isFeatured: true,
    isFlashSale: true,
    soldCount: 189,
    stock: 8,
    ratings: { average: 4.9, count: 89 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'f2',
    name: 'Party Glitter Clutch',
    slug: 'party-glitter-clutch',
    description: 'Glamorous glitter evening bag',
    shortDescription: 'Shine at every party',
    price: 1500,
    discountPrice: 1200,
    flashSalePrice: 899,
    category: 'Party & Evening',
    tags: ['flash', 'party'],
    colors: [
      { name: 'Gold Glitter', hex: '#C9A84C', images: [], stock: 5 },
      { name: 'Silver', hex: '#9ca3af', images: [], stock: 6 },
    ],
    mainImage: { url: '', cloudinaryId: '', alt: 'Party Glitter Clutch' },
    status: 'active',
    isFeatured: true,
    isFlashSale: true,
    soldCount: 267,
    stock: 6,
    ratings: { average: 4.8, count: 156 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'f3',
    name: 'Pearl Mini Crossbody',
    slug: 'pearl-mini-crossbody',
    description: 'Elegant pearl-finish mini crossbody bag',
    shortDescription: 'Perfect for daily use',
    price: 1200,
    discountPrice: 950,
    flashSalePrice: 749,
    category: 'Mini Crossbody',
    tags: ['flash', 'new'],
    colors: [
      { name: 'Pearl White', hex: '#f8f4f0', images: [], stock: 9 },
      { name: 'Blush Pink', hex: '#E91E8C', images: [], stock: 7 },
    ],
    mainImage: { url: '', cloudinaryId: '', alt: 'Pearl Mini Crossbody' },
    status: 'active',
    isFeatured: true,
    isFlashSale: true,
    soldCount: 234,
    stock: 9,
    ratings: { average: 4.8, count: 127 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'f4',
    name: 'Candy Quilted Bag',
    slug: 'candy-quilted-bag',
    description: 'Cute quilted pattern mini bag',
    shortDescription: 'Sweet and stylish',
    price: 950,
    discountPrice: 750,
    flashSalePrice: 599,
    category: 'Mini Crossbody',
    tags: ['flash', 'cute'],
    colors: [
      { name: 'Hot Pink', hex: '#E91E8C', images: [], stock: 11 },
      { name: 'Sky Blue', hex: '#3b82f6', images: [], stock: 8 },
    ],
    mainImage: { url: '', cloudinaryId: '', alt: 'Candy Quilted Bag' },
    status: 'active',
    isFeatured: true,
    isFlashSale: true,
    soldCount: 312,
    stock: 11,
    ratings: { average: 4.7, count: 203 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// ── Flash Sale Section ────────────────────────
export default function FlashSale() {
  // Set flash sale end time — 24 hours from now
  const [endTime] = useState(() => {
    const end = new Date()
    end.setHours(end.getHours() + 23)
    end.setMinutes(end.getMinutes() + 45)
    return end
  })

  const { hours, minutes, seconds } = useCountdown(endTime)

  return (
    <section className="flash-section">
      {/* Decorative top border */}
      <div className="flash-top-border" />

      <div className="container-bagbliss">
        {/* Header */}
        <div className="flash-header">
          <div className="flash-header-left">
            {/* Title */}
            <div className="flash-title-row">
              <div className="flash-icon-wrap">
                <Zap size={24} fill="white" color="white" />
              </div>
              <div>
                <div className="flash-eyebrow">Limited Time Only</div>
                <h2 className="flash-title">Flash Sale</h2>
              </div>
            </div>

            {/* Countdown */}
            <div className="flash-countdown">
              <span className="flash-ends-label">
                <Clock size={13} />
                Ends in:
              </span>
              <div className="flash-timer">
                <TimerBlock value={hours} label="HRS" />
                <span className="flash-timer-colon">:</span>
                <TimerBlock value={minutes} label="MIN" />
                <span className="flash-timer-colon">:</span>
                <TimerBlock value={seconds} label="SEC" />
              </div>
            </div>
          </div>

          <Link href="/shop?filter=flash-sale" className="flash-view-all">
            View All Deals
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="flash-grid">
          {FLASH_PRODUCTS.map((product, i) => (
            <FlashProductCard key={product._id} product={product} index={i} />
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="flash-bottom-banner">
          <div className="flash-banner-left">
            <Zap size={18} fill="#E91E8C" color="#E91E8C" />
            <span>
              Flash deals refresh every 24 hours.{' '}
              <strong>Don&apos;t miss out!</strong>
            </span>
          </div>
          <Link href="/shop?filter=flash-sale" className="btn-primary flash-banner-btn">
            Shop All Flash Deals
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Decorative bottom border */}
      <div className="flash-top-border" />
    </section>
  )
}