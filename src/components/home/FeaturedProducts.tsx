'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, Eye, ChevronLeft, ChevronRight, ArrowRight, ShoppingBag, X, Minus, Plus } from 'lucide-react'
import { IProduct } from '@/types'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import toast from 'react-hot-toast'

// ── Normalize raw DB product → IProduct shape ────────────────────────────
function normalizeProduct(raw: Record<string, unknown>): IProduct {
  const hasDiscount =
    raw.originalPrice &&
    typeof raw.originalPrice === 'number' &&
    typeof raw.price === 'number' &&
    raw.originalPrice > (raw.price as number)

  const rawColors = (raw.colors as Record<string, unknown>[]) ?? []
  const colors = rawColors.map((c) => ({
    name: (c.name as string) ?? 'Default',
    hex: (c.hex as string) ?? '#d08a60',
    images: [],
    stock: typeof c.stock === 'number' ? c.stock : 0,
  }))

  const rawImages = (raw.images as unknown[]) ?? []
  const firstImageUrl =
    rawImages.length > 0 && typeof rawImages[0] === 'string'
      ? (rawImages[0] as string)
      : ''

  return {
    _id: raw._id as string,
    name: (raw.name as string) ?? '',
    slug: (raw.slug as string) ?? '',
    description: (raw.description as string) ?? '',
    shortDescription: (raw.shortDescription as string) ?? '',
    price: hasDiscount ? (raw.originalPrice as number) : (raw.price as number),
    discountPrice: hasDiscount ? (raw.price as number) : undefined,
    category: (raw.category as string) ?? '',
    tags: (raw.tags as string[]) ?? [],
    colors,
    mainImage: {
      url: firstImageUrl,
      cloudinaryId: '',
      alt: (raw.name as string) ?? 'Product',
    },
    status: raw.isActive ? 'active' : 'inactive',
    isFeatured: (raw.isFeatured as boolean) ?? false,
    isFlashSale: (raw.isFlashSale as boolean) ?? false,
    flashSalePrice: raw.flashSalePrice as number | undefined,
    soldCount: (raw.soldCount as number) ?? 0,
    stock: (raw.totalStock as number) ?? 0,
    ratings: {
      average: (raw.rating as number) ?? 0,
      count: (raw.reviewCount as number) ?? 0,
    },
    createdAt: (raw.createdAt as string) ?? new Date().toISOString(),
    updatedAt: (raw.updatedAt as string) ?? new Date().toISOString(),
  }
}


// ── Quick View Modal ─────────────────────────────────────────────────────
function QuickViewModal({
  product,
  onClose,
}: {
  product: IProduct | null
  onClose: () => void
}) {
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const toggleWish = useWishlistStore((s) => s.toggleItem)
  const inWishlist = useWishlistStore((s) =>
    product ? s.items.includes(product._id) : false
  )

  const [selectedColor, setSelectedColor] = useState<string>('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [qty, setQty] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors?.[0]?.name ?? 'Default')
      setQty(1)
    }
  }, [product])

  // Lock body scroll while open
  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [product])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() },
    [onClose]
  )
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return
    const handler = () => setDropdownOpen(false)
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [dropdownOpen])

  if (!product) return null

  const displayPrice = product.discountPrice ?? product.price
  const originalPrice = product.discountPrice ? product.price : null
  const isOutOfStock = product.stock === 0

  const handleAddToCart = () => {
    if (isAdding || isOutOfStock) return
    setIsAdding(true)
    addItem({
      product,
      quantity: qty,
      selectedColor,
      price: displayPrice,
    })
    toast.success(`🛍️ ${product.name} added to cart!`)
    setTimeout(() => {
      setIsAdding(false)
      onClose()
      openCart()
    }, 500)
  }

  const handleWishlist = () => {
    toggleWish(product._id)
    toast.success(inWishlist ? 'Removed from wishlist' : '❤️ Added to wishlist!')
  }

  const colorOptions = product.colors?.length
    ? product.colors
    : [{ name: 'Default', hex: '#d08a60', images: [], stock: 0 }]

  return (
    <>
      <style jsx global>{`
        /* ── MODAL BACKDROP ── */
        .qv-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          z-index: 9000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: qv-fade-in 0.22s ease;
        }

        @keyframes qv-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ── MODAL BOX ── */
        .qv-modal {
          position: relative;
          background: #ffffff;
          border-radius: 16px;
          width: 100%;
          max-width: 860px;
          max-height: 90vh;
          overflow-y: auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          animation: qv-slide-up 0.28s cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes qv-slide-up {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── CLOSE BUTTON ── */
        .qv-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 36px;
          height: 36px;
          border-radius: 999px;
          border: none;
          background: #f4f2ef;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #17172f;
          z-index: 10;
          transition: background 0.2s ease;
        }

        .qv-close:hover {
          background: #e8e4df;
        }

        /* ── IMAGE PANEL ── */
        .qv-img-panel {
          background: #f4f2ef;
          border-radius: 16px 0 0 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 380px;
          padding: 32px;
        }

        .qv-img {
          width: 100%;
          max-height: 340px;
          object-fit: contain;
        }

        .qv-img-placeholder {
          width: 100%;
          height: 280px;
          background: #e8e4df;
          border-radius: 8px;
        }

        /* ── INFO PANEL ── */
        .qv-info {
          padding: 40px 36px 36px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* Divider */
        .qv-divider {
          width: 100%;
          height: 1px;
          background: #eee;
          margin: 20px 0;
        }

        .qv-category {
          font-family: 'Poppins', sans-serif;
          font-size: 0.78rem;
          font-weight: 500;
          color: #aaa;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0 0 6px;
        }

        .qv-name {
          font-family: 'Poppins', sans-serif;
          font-size: clamp(1.1rem, 2vw, 1.5rem);
          font-weight: 600;
          color: #17172f;
          margin: 0 0 10px;
          line-height: 1.25;
          letter-spacing: -0.02em;
        }

        /* Price row */
        .qv-price-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .qv-price {
          font-family: 'Poppins', sans-serif;
          font-size: 1.35rem;
          font-weight: 700;
          color: #d08a60;
        }

        .qv-original {
          font-family: 'Poppins', sans-serif;
          font-size: 1rem;
          color: #bbb;
          text-decoration: line-through;
          font-weight: 400;
        }

        /* ── Custom color dropdown ── */
        .qv-color-row {
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
        }

        .qv-label {
          font-family: 'Poppins', sans-serif;
          font-size: 0.88rem;
          font-weight: 600;
          color: #17172f;
          margin: 0;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* Trigger button */
        .qv-dd-wrap {
          position: relative;
          flex: 1;
          user-select: none;
        }

        .qv-dd-trigger {
          width: 100%;
          height: 46px;
          border: 1.5px solid #e0dbd5;
          border-radius: 999px;
          padding: 0 44px 0 20px;
          font-family: 'Poppins', sans-serif;
          font-size: 0.88rem;
          color: #17172f;
          background: #ffffff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
          text-align: left;
          outline: none;
          box-sizing: border-box;
        }

        .qv-dd-trigger:hover,
        .qv-dd-trigger--open {
          border-color: #d08a60;
          box-shadow: 0 0 0 3px rgba(208, 138, 96, 0.13);
        }

        .qv-dd-arrow {
          position: absolute;
          right: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
          pointer-events: none;
          transition: transform 0.25s cubic-bezier(0.22,1,0.36,1);
          display: flex;
          align-items: center;
        }

        .qv-dd-arrow--open {
          transform: translateY(-50%) rotate(180deg);
        }

        /* Options list */
        .qv-dd-list {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: #ffffff;
          border: 1.5px solid #e8e3dd;
          border-radius: 18px;
          box-shadow: 0 12px 40px rgba(23, 23, 47, 0.13);
          z-index: 200;
          overflow: hidden;
          animation: qv-dd-appear 0.2s cubic-bezier(0.22, 1, 0.36, 1);
          padding: 6px;
        }

        @keyframes qv-dd-appear {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .qv-dd-option {
          padding: 11px 18px;
          font-family: 'Poppins', sans-serif;
          font-size: 0.88rem;
          color: #17172f;
          cursor: pointer;
          border-radius: 12px;
          transition: background 0.18s ease, color 0.18s ease;
        }

        .qv-dd-option:hover {
          background: #f4f2ef;
        }

        .qv-dd-option--selected {
          background: #d08a60;
          color: #ffffff;
          font-weight: 600;
        }

        .qv-dd-option--selected:hover {
          background: #bf7a50;
        }

        /* Quantity row */
        .qv-qty-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .qv-qty-label {
          font-family: 'Poppins', sans-serif;
          font-size: 0.88rem;
          font-weight: 600;
          color: #17172f;
          white-space: nowrap;
        }

        .qv-qty-ctrl {
          display: flex;
          align-items: center;
          border: 1.5px solid #e0dbd5;
          border-radius: 999px;
          overflow: hidden;
        }

        .qv-qty-btn {
          width: 38px;
          height: 38px;
          border: none;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #17172f;
          transition: background 0.2s ease;
        }

        .qv-qty-btn:hover:not(:disabled) {
          background: #f4f2ef;
        }

        .qv-qty-btn:disabled {
          color: #ccc;
          cursor: default;
        }

        .qv-qty-num {
          min-width: 36px;
          text-align: center;
          font-family: 'Poppins', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          color: #17172f;
        }

        /* CTA row */
        .qv-cta-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .qv-add-btn {
          flex: 1;
          height: 54px;
          border: none;
          border-radius: 999px;
          background: #d08a60;
          font-family: 'Poppins', sans-serif;
          font-size: 0.88rem;
          font-weight: 700;
          letter-spacing: 0.07em;
          color: #ffffff;
          cursor: pointer;
          transition: background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .qv-add-btn:hover:not(:disabled) {
          background: #bf7a50;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(208, 138, 96, 0.38);
        }

        .qv-add-btn:disabled {
          opacity: 0.65;
          cursor: default;
        }

        .qv-wish-btn {
          width: 54px;
          height: 54px;
          border-radius: 999px;
          border: 1.5px solid #e0dbd5;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #17172f;
          flex-shrink: 0;
          transition: all 0.25s ease;
        }

        .qv-wish-btn:hover,
        .qv-wish-btn--active {
          background: #17172f;
          border-color: #17172f;
          color: #ffffff;
        }

        /* View full page link */
        .qv-view-link {
          font-family: 'Poppins', sans-serif;
          font-size: 0.82rem;
          color: #aaa;
          text-decoration: none;
          text-align: center;
          display: block;
          margin-top: 14px;
          transition: color 0.2s ease;
        }

        .qv-view-link:hover {
          color: #d08a60;
          text-decoration: underline;
        }

        /* Spinner */
        .qv-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: fp-spin 0.7s linear infinite;
        }

        /* ── MOBILE modal ── */
        @media (max-width: 640px) {
          .qv-modal {
            grid-template-columns: 1fr;
            border-radius: 16px;
            max-height: 92vh;
          }

          .qv-img-panel {
            border-radius: 16px 16px 0 0;
            min-height: 220px;
            padding: 24px;
          }

          .qv-img {
            max-height: 200px;
          }

          .qv-info {
            padding: 24px 22px 28px;
          }

          .qv-name {
            font-size: 1.1rem;
          }

          .qv-price {
            font-size: 1.15rem;
          }

          .qv-add-btn {
            height: 48px;
            font-size: 0.82rem;
          }

          .qv-wish-btn {
            width: 48px;
            height: 48px;
          }
        }
      `}</style>

      {/* Backdrop */}
      <div className="qv-backdrop" onClick={onClose}>
        <div className="qv-modal" onClick={(e) => e.stopPropagation()}>
          {/* Close */}
          <button className="qv-close" onClick={onClose} aria-label="Close">
            <X size={18} strokeWidth={2} />
          </button>

          {/* Left: image */}
          <div className="qv-img-panel">
            {product.mainImage?.url ? (
              <img
                src={product.mainImage.url}
                alt={product.mainImage.alt}
                className="qv-img"
                draggable={false}
              />
            ) : (
              <div className="qv-img-placeholder" />
            )}
          </div>

          {/* Right: info */}
          <div className="qv-info">
            {product.category && (
              <p className="qv-category">{product.category}</p>
            )}
            <h3 className="qv-name">{product.name}</h3>

            <div className="qv-price-row">
              <span className="qv-price">৳{displayPrice.toLocaleString()}</span>
              {originalPrice && (
                <span className="qv-original">৳{originalPrice.toLocaleString()}</span>
              )}
            </div>

            <div className="qv-divider" />

            {/* Color — label + custom dropdown on same row */}
            <div className="qv-color-row" style={{ marginBottom: '20px' }}>
              <span className="qv-label">Color</span>
              <div className="qv-dd-wrap">
                {/* Trigger */}
                <button
                  type="button"
                  className={`qv-dd-trigger${dropdownOpen ? ' qv-dd-trigger--open' : ''}`}
                  onClick={() => setDropdownOpen((o) => !o)}
                >
                  {selectedColor || 'Select color'}
                </button>
                <span className={`qv-dd-arrow${dropdownOpen ? ' qv-dd-arrow--open' : ''}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </span>

                {/* Options list */}
                {dropdownOpen && (
                  <div className="qv-dd-list">
                    {colorOptions.map((c) => (
                      <div
                        key={c.name}
                        className={`qv-dd-option${selectedColor === c.name ? ' qv-dd-option--selected' : ''}`}
                        onClick={() => {
                          setSelectedColor(c.name)
                          setDropdownOpen(false)
                        }}
                      >
                        {c.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quantity */}
            <div className="qv-qty-row" style={{ marginBottom: '24px' }}>
              <span className="qv-qty-label">Quantity:</span>
              <div className="qv-qty-ctrl">
                <button
                  className="qv-qty-btn"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label="Decrease"
                >
                  <Minus size={14} strokeWidth={2.5} />
                </button>
                <span className="qv-qty-num">{qty}</span>
                <button
                  className="qv-qty-btn"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase"
                >
                  <Plus size={14} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* CTA */}
            <div className="qv-cta-row">
              <button
                className="qv-add-btn"
                onClick={handleAddToCart}
                disabled={isAdding || isOutOfStock}
              >
                {isAdding ? (
                  <><span className="qv-spinner" /><span>ADDING…</span></>
                ) : isOutOfStock ? (
                  <span>OUT OF STOCK</span>
                ) : (
                  <span>ADD TO CART</span>
                )}
              </button>

              <button
                className={`qv-wish-btn${inWishlist ? ' qv-wish-btn--active' : ''}`}
                onClick={handleWishlist}
                aria-label="Wishlist"
              >
                <Heart size={18} fill={inWishlist ? '#ffffff' : 'none'} strokeWidth={2} />
              </button>
            </div>

            <a href={`/product/${product.slug}`} className="qv-view-link">
              View full details →
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Shared card logic hook ────────────────────────────────────────────────
function useCardLogic(product: IProduct, onQuickView: (p: IProduct) => void) {
  const [isAdding, setIsAdding] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const toggleWish = useWishlistStore((s) => s.toggleItem)
  const inWishlist = useWishlistStore((s) => s.items.includes(product._id))

  const displayPrice = product.discountPrice ?? product.price
  const originalPrice = product.discountPrice ? product.price : null
  const discountPct = originalPrice
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : null
  const isOutOfStock = product.stock === 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isAdding || isOutOfStock) return
    setIsAdding(true)
    addItem({
      product,
      quantity: 1,
      selectedColor: product.colors?.[0]?.name ?? 'Default',
      price: displayPrice,
    })
    toast.success(`🛍️ ${product.name} added to cart!`)
    setTimeout(() => {
      setIsAdding(false)
      openCart()
    }, 500)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWish(product._id)
    toast.success(inWishlist ? 'Removed from wishlist' : '❤️ Added to wishlist!')
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onQuickView(product)
  }

  return {
    isAdding,
    inWishlist,
    displayPrice,
    originalPrice,
    discountPct,
    isOutOfStock,
    handleAddToCart,
    handleWishlist,
    handleQuickView,
  }
}

// ── Desktop card (unchanged layout) ─────────────────────────────────────
function FpCard({
  product,
  onQuickView,
}: {
  product: IProduct
  onQuickView: (p: IProduct) => void
}) {
  const router = useRouter()
  const {
    isAdding,
    inWishlist,
    displayPrice,
    originalPrice,
    discountPct,
    isOutOfStock,
    handleAddToCart,
    handleWishlist,
    handleQuickView,
  } = useCardLogic(product, onQuickView)

  return (
    <div
      className="fp-card"
      onClick={() => router.push(`/product/${product.slug}`)}
      style={{ cursor: 'pointer' }}
    >
      {/* Top row: meta left, icons right */}
      <div className="fp-card-top">
        <div className="fp-meta">
          <h3 className="fp-name">{product.name}</h3>
          <div className="fp-pricing">
            <span className="fp-price">৳{displayPrice.toLocaleString()}</span>
            {originalPrice && (
              <span className="fp-original">৳{originalPrice.toLocaleString()}</span>
            )}
            {discountPct && <span className="fp-badge">-{discountPct}%</span>}
          </div>
        </div>

        <div className="fp-actions">
          <button
            className={`fp-icon-btn${inWishlist ? ' fp-icon-btn--wished' : ''}`}
            onClick={handleWishlist}
            aria-label="Wishlist"
          >
            <Heart size={15} fill={inWishlist ? '#ffffff' : 'none'} strokeWidth={2} />
          </button>
          <button
            className="fp-icon-btn"
            onClick={handleQuickView}
            aria-label="Quick view"
          >
            <Eye size={15} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Image area */}
      <div className="fp-img-wrap">
        {product.mainImage?.url ? (
          <img
            src={product.mainImage.url}
            alt={product.mainImage.alt}
            className="fp-img"
            draggable={false}
          />
        ) : (
          <div className="fp-img-placeholder" />
        )}
      </div>

      {/* ADD TO CART hover button */}
      <div className="fp-cart-hover">
        <button
          className="fp-add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={isAdding || isOutOfStock}
        >
          {isAdding ? (
            <>
              <span className="fp-spinner" />
              <span>ADDING…</span>
            </>
          ) : isOutOfStock ? (
            <span>OUT OF STOCK</span>
          ) : (
            <>
              <span>ADD TO CART</span>
              <ArrowRight size={18} strokeWidth={2.2} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ── Mobile card — reference design: centered title, price, 3 icons, image ──
function FpCardMobile({
  product,
  onQuickView,
}: {
  product: IProduct
  onQuickView: (p: IProduct) => void
}) {
  const router = useRouter()
  const {
    isAdding,
    inWishlist,
    displayPrice,
    originalPrice,
    discountPct,
    isOutOfStock,
    handleAddToCart,
    handleWishlist,
    handleQuickView,
  } = useCardLogic(product, onQuickView)

  return (
    <div
      className="fpm-card"
      onClick={() => router.push(`/product/${product.slug}`)}
      style={{ cursor: 'pointer' }}
    >
      {/* Centered name */}
      <h3 className="fpm-name">{product.name}</h3>

      {/* Centered price row */}
      <div className="fpm-pricing">
        <span className="fpm-price">৳{displayPrice.toLocaleString()}</span>
        {originalPrice && (
          <span className="fpm-original">৳{originalPrice.toLocaleString()}</span>
        )}
        {discountPct && <span className="fpm-badge">-{discountPct}%</span>}
      </div>

      {/* Centered 3-icon row */}
      <div className="fpm-actions">
        <button
          className={`fpm-icon-btn${inWishlist ? ' fpm-icon-btn--wished' : ''}`}
          onClick={handleWishlist}
          aria-label="Wishlist"
        >
          <Heart size={16} fill={inWishlist ? '#ffffff' : 'none'} strokeWidth={2} />
        </button>

        <button
          className={`fpm-icon-btn fpm-icon-btn--cart${isOutOfStock ? ' fpm-icon-btn--disabled' : ''}`}
          onClick={handleAddToCart}
          disabled={isAdding || isOutOfStock}
          aria-label="Add to cart"
        >
          {isAdding ? (
            <span className="fpm-spinner" />
          ) : (
            <ShoppingBag size={16} strokeWidth={2} />
          )}
        </button>

        <button
          className="fpm-icon-btn"
          onClick={handleQuickView}
          aria-label="Quick view"
        >
          <Eye size={16} strokeWidth={2} />
        </button>
      </div>

      {/* Product image */}
      <div className="fpm-img-wrap">
        {product.mainImage?.url ? (
          <img
            src={product.mainImage.url}
            alt={product.mainImage.alt}
            className="fpm-img"
            draggable={false}
          />
        ) : (
          <div className="fpm-img-placeholder" />
        )}
      </div>
    </div>
  )
}

// ── Mobile skeleton ───────────────────────────────────────────────────────
function FpSkeletonMobile() {
  return (
    <div className="fpm-card fpm-skeleton">
      <div className="fpm-sk-line fpm-sk-line--name" />
      <div className="fpm-sk-line fpm-sk-line--price" />
      <div className="fpm-sk-icons">
        <div className="fpm-sk-circle" />
        <div className="fpm-sk-circle" />
        <div className="fpm-sk-circle" />
      </div>
      <div className="fpm-img-wrap">
        <div className="fpm-sk-img" />
      </div>
    </div>
  )
}

// ── Desktop skeleton ─────────────────────────────────────────────────────
function FpSkeleton() {
  return (
    <div className="fp-card fp-skeleton">
      <div className="fp-card-top">
        <div className="fp-meta" style={{ flex: 1 }}>
          <div className="fp-sk-line fp-sk-line--long" />
          <div className="fp-sk-line fp-sk-line--mid" style={{ marginTop: 10 }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="fp-sk-circle" />
          <div className="fp-sk-circle" />
        </div>
      </div>
      <div className="fp-img-wrap">
        <div className="fp-sk-img" />
      </div>
    </div>
  )
}

// ── Main section ─────────────────────────────────────────────────────────
export default function FeaturedProducts() {
  const [quickViewProduct, setQuickViewProduct] = useState<IProduct | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [allProducts, setAllProducts] = useState<IProduct[]>([])
  const [error, setError] = useState(false)

  // Slider
  const [current, setCurrent] = useState(0)
  const [visibleCount, setVisibleCount] = useState(3)
  const [enableTransition, setEnableTransition] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  // Responsive
  const [isMobile, setIsMobile] = useState(false)
  const GAP = isMobile ? 0 : 24
  const [containerW, setContainerW] = useState(0)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      const mobile = w <= 640
      setIsMobile(mobile)
      if (w <= 640) setVisibleCount(1)
      else if (w < 900) setVisibleCount(2)
      else if (w < 1400) setVisibleCount(3)
      else setVisibleCount(4)
      if (containerRef.current) setContainerW(containerRef.current.offsetWidth)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    fetch('/api/products?featured=true&limit=8')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => {
        const normalized: IProduct[] = (data.products ?? []).map(
          (p: Record<string, unknown>) => normalizeProduct(p)
        )
        setAllProducts(normalized)
      })
      .catch(() => setError(true))
      .finally(() => setIsLoading(false))
  }, [])

  const maxIndex = Math.max(0, allProducts.length - visibleCount)

  const goNext = () => setCurrent((c) => Math.min(c + 1, maxIndex))
  const goPrev = () => setCurrent((c) => Math.max(c - 1, 0))

  // Drag / swipe
  const startX = useRef(0)
  const isDragging = useRef(false)
  const [dragOffset, setDragOffset] = useState(0)

  const onDragStart = (x: number) => {
    isDragging.current = true
    startX.current = x
  }
  const onDragMove = (x: number) => {
    if (isDragging.current) setDragOffset(x - startX.current)
  }
  const onDragEnd = (x: number) => {
    if (!isDragging.current) return
    isDragging.current = false
    const dist = startX.current - x
    setDragOffset(0)
    if (dist > 50) goNext()
    else if (dist < -50) goPrev()
  }

  const cardWidth =
    containerW > 0 ? (containerW - GAP * (visibleCount - 1)) / visibleCount : 0
  const moveSize = cardWidth + GAP

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        /* ── SECTION ── */
        .fp-section {
          padding: 60px 0 80px;
          background: #ffffff;
          overflow: hidden;
        }

        .fp-container {
          position: relative;
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 clamp(4.6rem, 4vw, 4rem);
          box-sizing: border-box;
        }

        /* ── HEADER ── */
        .fp-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 40px;
          gap: 24px;
        }

        .fp-title {
          margin: 0 0 6px;
          font-family: 'Poppins', sans-serif;
          font-size: clamp(1.6rem, 3vw, 2.6rem);
          font-weight: 600;
          color: #17172f;
          line-height: 1.1;
          letter-spacing: -0.03em;
        }

        .fp-subtitle {
          margin: 0;
          font-family: 'Poppins', sans-serif;
          font-size: 0.9rem;
          color: #d08a60;
          font-weight: 400;
        }

        /* ── NAV ARROWS (desktop/tablet) ── */
        .fp-nav {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
          padding-top: 4px;
        }

        /* Bottom nav — mobile only */
        .fp-nav-bottom {
          display: none;
        }

        .fp-nav-btn {
          width: 52px;
          height: 52px;
          border-radius: 999px;
          border: 1.5px solid #d08a60;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #d08a60;
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .fp-nav-btn:hover:not(:disabled) {
          background: #d08a60;
          color: #ffffff;
          transform: translateY(-2px);
        }

        .fp-nav-btn:disabled {
          background: #f0ece8;
          border-color: #e7e1da;
          color: #c5bdb5;
          cursor: default;
        }

        /* ── SLIDER ── */
        .fp-slider {
          overflow: hidden;
          width: 100%;
          cursor: grab;
        }
        .fp-slider:active {
          cursor: grabbing;
        }

        .fp-track {
          display: flex;
          gap: 24px;
          will-change: transform;
          user-select: none;
        }

        /* ════════════════════════════════
           DESKTOP CARD
        ════════════════════════════════ */
        .fp-card {
          flex-shrink: 0;
          background: #f4f2ef;
          border-radius: 6px;
          padding: 22px 22px 0;
          display: flex;
          flex-direction: column;
          position: relative;
          height: 420px;
          box-sizing: border-box;
          overflow: hidden;
          transition: box-shadow 0.3s ease;
        }

        .fp-card:hover {
          box-shadow: 0 10px 36px rgba(23, 23, 47, 0.09);
        }

        .fp-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
          flex-shrink: 0;
        }

        .fp-meta {
          flex: 1;
          min-width: 0;
        }

        .fp-name {
          margin: 0 0 8px;
          font-family: 'Poppins', sans-serif;
          font-size: clamp(0.88rem, 1.1vw, 1rem);
          font-weight: 500;
          color: #17172f;
          line-height: 1.35;
          letter-spacing: -0.01em;
          word-break: break-word;
        }

        .fp-pricing {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .fp-price {
          font-family: 'Poppins', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #d08a60;
        }

        .fp-original {
          font-family: 'Poppins', sans-serif;
          font-size: 0.85rem;
          font-weight: 400;
          color: #bbb;
          text-decoration: line-through;
        }

        .fp-badge {
          font-family: 'Poppins', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          color: #ffffff;
          background: #17172f;
          border-radius: 999px;
          padding: 2px 8px;
        }

        .fp-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .fp-icon-btn {
          width: 38px;
          height: 38px;
          border-radius: 999px;
          border: none;
          background: #d08a60;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #ffffff;
          transition: background 0.25s ease, transform 0.25s ease;
        }

        .fp-icon-btn:hover {
          background: #17172f;
          transform: scale(1.08);
        }

        .fp-icon-btn--wished {
          background: #17172f;
        }

        .fp-img-wrap {
          flex: 1;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          overflow: hidden;
          min-height: 0;
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .fp-card:hover .fp-img-wrap {
          transform: translateY(-8px);
        }

        .fp-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center bottom;
          transition: transform 1s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
        }

        .fp-card:hover .fp-img {
          transform: scale(1.05) translateY(-4px);
        }

        .fp-img-placeholder {
          width: 100%;
          height: 100%;
          background: #e8e4df;
          border-radius: 4px;
        }

        .fp-cart-hover {
          position: absolute;
          left: 16px;
          right: 16px;
          bottom: 16px;
          z-index: 4;
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.42s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .fp-card:hover .fp-cart-hover {
          opacity: 1;
          transform: translateY(0);
        }

        .fp-add-to-cart-btn {
          width: 100%;
          height: 54px;
          border: none;
          border-radius: 999px;
          background: #d08a60;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          cursor: pointer;
          transition: background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
        }

        .fp-add-to-cart-btn:disabled {
          opacity: 0.7;
          cursor: default;
        }

        .fp-add-to-cart-btn span {
          font-family: 'Poppins', sans-serif;
          font-size: 0.88rem;
          font-weight: 600;
          letter-spacing: 0.07em;
          color: #ffffff;
        }

        .fp-add-to-cart-btn svg {
          color: #ffffff;
          flex-shrink: 0;
        }

        .fp-add-to-cart-btn:hover:not(:disabled) {
          background: #bf7a50;
          transform: scale(1.015);
          box-shadow: 0 6px 20px rgba(208, 138, 96, 0.4);
        }

        .fp-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-top-color: #ffffff;
          border-radius: 50%;
          display: inline-block;
          animation: fp-spin 0.7s linear infinite;
        }

        @keyframes fp-spin {
          to { transform: rotate(360deg); }
        }

        /* ── Desktop skeleton ── */
        .fp-skeleton {
          pointer-events: none;
        }

        .fp-sk-line {
          height: 14px;
          background: linear-gradient(90deg, #e8e4df 25%, #dedad4 50%, #e8e4df 75%);
          background-size: 200% 100%;
          border-radius: 4px;
          animation: fp-shimmer 1.4s infinite;
        }
        .fp-sk-line--long { width: 78%; height: 16px; }
        .fp-sk-line--mid  { width: 52%; }

        .fp-sk-circle {
          width: 38px;
          height: 38px;
          border-radius: 999px;
          background: linear-gradient(90deg, #e8e4df 25%, #dedad4 50%, #e8e4df 75%);
          background-size: 200% 100%;
          animation: fp-shimmer 1.4s infinite;
          flex-shrink: 0;
        }

        .fp-sk-img {
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, #e8e4df 25%, #dedad4 50%, #e8e4df 75%);
          background-size: 200% 100%;
          border-radius: 4px;
          animation: fp-shimmer 1.4s infinite;
        }

        @keyframes fp-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── CTA ── */
        .fp-cta-wrap {
          text-align: center;
          margin-top: 48px;
        }

        .fp-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 0 48px;
          height: 58px;
          border-radius: 999px;
          border: none;
          background: #d08a60;
          font-family: 'Poppins', sans-serif;
          font-size: 0.88rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #ffffff;
          text-decoration: none;
          transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .fp-cta-btn:hover {
          background: #bf7a50;
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(208, 138, 96, 0.35);
        }

        /* ── Error / empty ── */
        .fp-message {
          text-align: center;
          padding: 4rem 0;
          font-family: 'Poppins', sans-serif;
          color: #aaa;
          font-size: 0.95rem;
        }

        .fp-retry-btn {
          margin-top: 1rem;
          padding: 10px 28px;
          border-radius: 999px;
          border: 1.5px solid #d08a60;
          background: transparent;
          color: #d08a60;
          font-family: 'Poppins', sans-serif;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.28s ease;
        }

        .fp-retry-btn:hover {
          background: #d08a60;
          color: #fff;
        }

        /* ════════════════════════════════
           MOBILE CARD  (fpm-*)
           Matches reference: centered title,
           price, 3 icon buttons, then image
        ════════════════════════════════ */
        .fpm-card {
          flex-shrink: 0;
          background: #f4f2ef;
          border-radius: 0;
          padding: 22px 16px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          height: 360px;
          box-sizing: border-box;
          overflow: hidden;
        }

        /* Centered product name */
        .fpm-name {
          margin: 0 0 10px;
          font-family: 'Poppins', sans-serif;
          font-size: 1rem;
          font-weight: 500;
          color: #17172f;
          line-height: 1.3;
          letter-spacing: -0.01em;
          text-align: center;
          word-break: break-word;
          width: 100%;
        }

        /* Centered price row */
        .fpm-pricing {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }

        .fpm-price {
          font-family: 'Poppins', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #d08a60;
        }

        .fpm-original {
          font-family: 'Poppins', sans-serif;
          font-size: 0.85rem;
          font-weight: 400;
          color: #bbb;
          text-decoration: line-through;
        }

        .fpm-badge {
          font-family: 'Poppins', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          color: #ffffff;
          background: #17172f;
          border-radius: 999px;
          padding: 2px 8px;
        }

        /* Centered 3-icon row */
        .fpm-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 18px;
          flex-shrink: 0;
        }

        .fpm-icon-btn {
          width: 44px;
          height: 44px;
          border-radius: 999px;
          border: none;
          background: #d08a60;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #ffffff;
          transition: background 0.25s ease, transform 0.25s ease;
          flex-shrink: 0;
        }

        .fpm-icon-btn:hover {
          background: #17172f;
        }

        .fpm-icon-btn:active {
          transform: scale(0.94);
        }

        .fpm-icon-btn--wished {
          background: #17172f;
        }

        .fpm-icon-btn--disabled {
          opacity: 0.55;
          cursor: default;
        }

        /* Product image area — fills remaining space */
        .fpm-img-wrap {
          flex: 1;
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          overflow: hidden;
          min-height: 0;
        }

        .fpm-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center bottom;
          pointer-events: none;
        }

        .fpm-img-placeholder {
          width: 100%;
          height: 100%;
          background: #e8e4df;
          border-radius: 4px;
        }

        /* Mobile spinner */
        .fpm-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-top-color: #ffffff;
          border-radius: 50%;
          display: inline-block;
          animation: fp-spin 0.7s linear infinite;
        }

        /* Mobile skeleton */
        .fpm-skeleton {
          pointer-events: none;
        }

        .fpm-sk-line {
          background: linear-gradient(90deg, #e8e4df 25%, #dedad4 50%, #e8e4df 75%);
          background-size: 200% 100%;
          border-radius: 4px;
          animation: fp-shimmer 1.4s infinite;
          margin-bottom: 10px;
        }
        .fpm-sk-line--name  { width: 70%; height: 16px; }
        .fpm-sk-line--price { width: 40%; height: 14px; }

        .fpm-sk-icons {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-bottom: 16px;
        }

        .fpm-sk-circle {
          width: 44px;
          height: 44px;
          border-radius: 999px;
          background: linear-gradient(90deg, #e8e4df 25%, #dedad4 50%, #e8e4df 75%);
          background-size: 200% 100%;
          animation: fp-shimmer 1.4s infinite;
          flex-shrink: 0;
        }

        .fpm-sk-img {
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, #e8e4df 25%, #dedad4 50%, #e8e4df 75%);
          background-size: 200% 100%;
          border-radius: 4px;
          animation: fp-shimmer 1.4s infinite;
        }

        /* ══════════════════════════════
           TABLET (max 1024px)
        ══════════════════════════════ */
        @media (max-width: 1024px) {
          .fp-section { padding: 48px 0 64px; }
          /* NOTE: no padding override here — fp-container keeps the same
             clamp(4.6rem, 4vw, 4rem) padding as CategoryStrip (.cs-container)
             so both sections stay perfectly aligned across all tablet widths */
          .fp-card { height: 380px; border-radius: 6px; }
          .fp-track { gap: 20px; }
          .fp-cta-wrap { margin-top: 36px; }
          .fp-add-to-cart-btn { height: 50px; }
        }

        /* ══════════════════════════════
           MOBILE (max 640px)
        ══════════════════════════════ */
        @media (max-width: 640px) {
          .fp-section { padding: 40px 0 52px; }

          .fp-container { padding: 0 1rem; }

          .fp-header {
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            gap: 14px;
            margin-bottom: 24px;
          }

          .fp-title { font-size: clamp(1.5rem, 7vw, 2rem); }
          .fp-subtitle { font-size: 0.82rem; }

          /* Hide desktop nav arrows on mobile */
          .fp-nav { display: none; }

          .fp-nav-bottom {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 14px;
            margin-top: 24px;
          }

          .fp-nav-btn { width: 42px; height: 42px; }

          .fp-track { gap: 0; }

          .fp-cta-wrap { margin-top: 32px; }

          .fp-cta-btn {
            padding: 0 32px;
            height: 52px;
            font-size: 0.82rem;
          }
        }

        /* ══════════════════════════════
           SMALL MOBILE (max 420px)
        ══════════════════════════════ */
        @media (max-width: 420px) {
          .fp-section { padding: 32px 0 44px; }
          .fp-container { padding: 0 0.85rem; }

          .fpm-card { height: 320px; padding: 16px 12px 0; }
          .fpm-name { font-size: 0.92rem; }
          .fpm-price { font-size: 0.92rem; }
          .fpm-icon-btn { width: 40px; height: 40px; }
          .fpm-actions { gap: 10px; margin-bottom: 14px; }

          .fp-title { font-size: 1.4rem; }
          .fp-subtitle { font-size: 0.78rem; }

          .fp-nav-btn { width: 38px; height: 38px; }
          .fp-nav-bottom { gap: 10px; margin-top: 18px; }

          .fp-cta-btn {
            padding: 0 24px;
            height: 48px;
            font-size: 0.78rem;
          }
        }
      `}</style>

      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

      <section className="fp-section">
        <div className="fp-container">
          {/* Header */}
          <div className="fp-header">
            <div>
              <h2 className="fp-title">Best selling bags</h2>
              <p className="fp-subtitle">Limited space, unlimited style</p>
            </div>

            {/* Top nav: desktop/tablet only */}
            <div className="fp-nav">
              <button
                className="fp-nav-btn"
                onClick={goPrev}
                disabled={current === 0}
                aria-label="Previous"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="fp-nav-btn"
                onClick={goNext}
                disabled={current >= maxIndex}
                aria-label="Next"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Slider */}
          <div
            className="fp-slider"
            ref={containerRef}
            onMouseDown={(e) => onDragStart(e.clientX)}
            onMouseMove={(e) => onDragMove(e.clientX)}
            onMouseUp={(e) => onDragEnd(e.clientX)}
            onMouseLeave={(e) => onDragEnd(e.clientX)}
            onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
            onTouchMove={(e) => onDragMove(e.touches[0].clientX)}
            onTouchEnd={(e) => onDragEnd(e.changedTouches[0].clientX)}
          >
            <div
              className="fp-track"
              style={{
                transform: `translate3d(calc(-${current * moveSize}px + ${dragOffset}px), 0, 0)`,
                transition: enableTransition
                  ? 'transform 0.7s cubic-bezier(0.25,1,0.35,1)'
                  : 'none',
              }}
            >
              {isLoading ? (
                Array.from({ length: visibleCount }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: cardWidth || 280,
                      minWidth: cardWidth || 280,
                      maxWidth: cardWidth || 280,
                    }}
                  >
                    {isMobile ? <FpSkeletonMobile /> : <FpSkeleton />}
                  </div>
                ))
              ) : error ? (
                <div className="fp-message" style={{ width: '100%' }}>
                  <p>Could not load products.</p>
                  <button
                    className="fp-retry-btn"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </button>
                </div>
              ) : allProducts.length === 0 ? (
                <div className="fp-message" style={{ width: '100%' }}>
                  No products found.
                </div>
              ) : (
                allProducts.map((product) => (
                  <div
                    key={product._id}
                    style={{
                      width: cardWidth || 280,
                      minWidth: cardWidth || 280,
                      maxWidth: cardWidth || 280,
                    }}
                  >
                    {/* Render mobile card on mobile, desktop card otherwise */}
                    {isMobile ? (
                      <FpCardMobile product={product} onQuickView={setQuickViewProduct} />
                    ) : (
                      <FpCard product={product} onQuickView={setQuickViewProduct} />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bottom nav: mobile only */}
          <div className="fp-nav-bottom">
            <button
              className="fp-nav-btn"
              onClick={goPrev}
              disabled={current === 0}
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className="fp-nav-btn"
              onClick={goNext}
              disabled={current >= maxIndex}
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Bottom CTA */}
          {!isLoading && !error && allProducts.length > 0 && (
            <div className="fp-cta-wrap">
              <Link href="/shop" className="fp-cta-btn">
                See More
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}