'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, Eye, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { IProduct } from '@/types'

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

// ── Single product card ──────────────────────────────────────────────────
function FpCard({
  product,
  router,
}: {
  product: IProduct
  router: ReturnType<typeof useRouter>
}) {
  const [wished, setWished] = useState(false)

  const displayPrice = product.discountPrice ?? product.price
  const originalPrice = product.discountPrice ? product.price : null
  const discountPct = originalPrice
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : null

  return (
    <div className="fp-card">
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
            className={`fp-icon-btn${wished ? ' fp-icon-btn--wished' : ''}`}
            onClick={() => setWished((w) => !w)}
            aria-label="Wishlist"
          >
            <Heart size={15} fill={wished ? '#ffffff' : 'none'} strokeWidth={2} />
          </button>
          <button
            className="fp-icon-btn"
            onClick={() => router.push(`/product/${product.slug}`)}
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
    </div>
  )
}

// ── Skeleton card ────────────────────────────────────────────────────────
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
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [allProducts, setAllProducts] = useState<IProduct[]>([])
  const [error, setError] = useState(false)

  // Slider
  const [current, setCurrent] = useState(0)
  const [visibleCount, setVisibleCount] = useState(4)
  const [enableTransition, setEnableTransition] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w <= 640) setVisibleCount(1)
      else if (w < 900) setVisibleCount(2)
      else if (w < 1200) setVisibleCount(3)
      else setVisibleCount(4)
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

  // Card width
  const [isMobile, setIsMobile] = useState(false)
  const GAP = isMobile ? 0 : 24
  const [containerW, setContainerW] = useState(0)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setIsMobile(w <= 640)
      if (containerRef.current) setContainerW(containerRef.current.offsetWidth)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

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

        /* ── NAV ARROWS (desktop/tablet — inside header) ── */
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

        /* ── CARD ── */
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
          transition: box-shadow 0.3s ease;
        }

        .fp-card:hover {
          box-shadow: 0 10px 36px rgba(23, 23, 47, 0.09);
        }

        /* ── CARD TOP ROW ── */
        .fp-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
          flex-shrink: 0;
        }

        /* ── META ── */
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

        /* ── ACTION ICONS ── */
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
          background: #bf7a50;
          transform: scale(1.08);
        }

        .fp-icon-btn--wished {
          background: #17172f;
        }

        /* ── IMAGE AREA ── */
        .fp-img-wrap {
          flex: 1;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          overflow: hidden;
          min-height: 0;
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

        /* ── SKELETON ── */
        .fp-skeleton {
          pointer-events: none;
        }

        .fp-sk-line {
          height: 14px;
          background: linear-gradient(
            90deg,
            #e8e4df 25%,
            #dedad4 50%,
            #e8e4df 75%
          );
          background-size: 200% 100%;
          border-radius: 4px;
          animation: fp-shimmer 1.4s infinite;
        }
        .fp-sk-line--long {
          width: 78%;
          height: 16px;
        }
        .fp-sk-line--mid {
          width: 52%;
        }

        .fp-sk-circle {
          width: 38px;
          height: 38px;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            #e8e4df 25%,
            #dedad4 50%,
            #e8e4df 75%
          );
          background-size: 200% 100%;
          animation: fp-shimmer 1.4s infinite;
          flex-shrink: 0;
        }

        .fp-sk-img {
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            #e8e4df 25%,
            #dedad4 50%,
            #e8e4df 75%
          );
          background-size: 200% 100%;
          border-radius: 4px;
          animation: fp-shimmer 1.4s infinite;
        }

        @keyframes fp-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── BOTTOM CTA ── */
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

        /* ── ERROR / EMPTY ── */
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

        /* ══════════════════════════════
           TABLET (max 1024px)
        ══════════════════════════════ */
        @media (max-width: 1024px) {
          .fp-section {
            padding: 48px 0 64px;
          }

          .fp-container {
            padding: 0 2rem;
          }

          .fp-card {
            height: 380px;
            border-radius: 6px;
          }

          .fp-track {
            gap: 20px;
          }

          .fp-cta-wrap {
            margin-top: 36px;
          }
        }

        /* ══════════════════════════════
           MOBILE (max 640px)
        ══════════════════════════════ */
        @media (max-width: 640px) {
          .fp-section {
            padding: 40px 0 52px;
          }

          .fp-container {
            padding: 0 1rem;
          }

          /* Header: centered, no inline nav */
          .fp-header {
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            gap: 14px;
            margin-bottom: 24px;
          }

          .fp-title {
            font-size: clamp(1.5rem, 7vw, 2rem);
          }

          .fp-subtitle {
            font-size: 0.82rem;
          }

          /* Hide top nav on mobile */
          .fp-nav {
            display: none;
          }

          /* Show bottom nav on mobile */
          .fp-nav-bottom {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 14px;
            margin-top: 24px;
          }

          .fp-nav-btn {
            width: 42px;
            height: 42px;
          }

          /* Slider: no gap, full width card */
          .fp-track {
            gap: 0;
          }

          .fp-card {
            height: 360px;
            border-radius: 0;
            padding: 18px 18px 0;
          }

          .fp-name {
            font-size: 0.9rem;
          }

          .fp-price {
            font-size: 0.95rem;
          }

          .fp-icon-btn {
            width: 34px;
            height: 34px;
          }

          .fp-cta-wrap {
            margin-top: 32px;
          }

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
          .fp-section {
            padding: 32px 0 44px;
          }

          .fp-container {
            padding: 0 0.85rem;
          }

          .fp-card {
            height: 320px;
            padding: 14px 14px 0;
          }

          .fp-title {
            font-size: 1.4rem;
          }

          .fp-subtitle {
            font-size: 0.78rem;
          }

          .fp-nav-btn {
            width: 38px;
            height: 38px;
          }

          .fp-nav-bottom {
            gap: 10px;
            margin-top: 18px;
          }

          .fp-cta-btn {
            padding: 0 24px;
            height: 48px;
            font-size: 0.78rem;
          }
        }
      `}</style>

      <section className="fp-section">
        <div className="fp-container">
          {/* Header — top nav hidden on mobile via CSS */}
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
                    <FpSkeleton />
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
                    <FpCard product={product} router={router} />
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