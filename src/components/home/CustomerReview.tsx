'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// ── Static reviewer data (avatars, names, ratings, comments) ─────────────
const REVIEWERS = [
  {
    name: 'Emily Wilson',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 4,
    comment: "Soft leather and solid stitching. I get compliments every time!",
  },
  {
    name: 'Audie Dewey',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    rating: 3,
    comment: "Exactly like the photos. Sturdy zipper and a perfect fit!",
  },
  {
    name: 'David Williams',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 5,
    comment: "She absolutely loves it! Premium feel and beautiful color.",
  },
  {
    name: 'Brittany Jones',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    rating: 4,
    comment: "Fits everything I need. The color is even better in person!",
  },
  {
    name: 'Sarah Chen',
    avatar: 'https://randomuser.me/api/portraits/women/21.jpg',
    rating: 5,
    comment: "Totally exceeded my expectations. Love the gold hardware!",
  },
  {
    name: 'Marcus Lee',
    avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
    rating: 4,
    comment: "Great quality for the price. Arrived earlier than expected!",
  },
]

interface Review {
  id: number
  name: string
  avatar: string
  rating: number
  productImage: string
  productName: string
  productSlug: string
  comment: string
}

// ── Normalize raw API product → what we need ─────────────────────────────
function extractProductInfo(raw: Record<string, unknown>): {
  image: string
  name: string
  slug: string
} {
  const rawImages = (raw.images as unknown[]) ?? []
  const firstImage =
    rawImages.length > 0 && typeof rawImages[0] === 'string'
      ? (rawImages[0] as string)
      : ''
  return {
    image: firstImage,
    name: (raw.name as string) ?? '',
    slug: (raw.slug as string) ?? '',
  }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="cr-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className="cr-star"
          viewBox="0 0 24 24"
          fill={i <= rating ? '#d08a60' : 'none'}
          stroke={i <= rating ? '#d08a60' : '#d0c8bf'}
          strokeWidth="1.8"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="cr-card">
      {/* Top: avatar + name + stars */}
      <div className="cr-card-top">
        <img
          src={review.avatar}
          alt={review.name}
          className="cr-avatar"
          draggable={false}
        />
        <div className="cr-card-meta">
          <span className="cr-name">{review.name}</span>
          <StarRating rating={review.rating} />
        </div>
      </div>

      {/* Product image */}
      <div className="cr-product-img-wrap">
        {review.productImage ? (
          <img
            src={review.productImage}
            alt={review.productName}
            className="cr-product-img"
            draggable={false}
          />
        ) : (
          <div className="cr-product-img-placeholder" />
        )}
      </div>

      {/* Comment */}
      <p className="cr-comment">{review.comment}</p>
    </div>
  )
}

function ReviewSkeleton() {
  return (
    <div className="cr-card cr-skeleton">
      <div className="cr-card-top">
        <div className="cr-sk-circle" />
        <div style={{ flex: 1 }}>
          <div className="cr-sk-line cr-sk-line--name" />
          <div className="cr-sk-line cr-sk-line--stars" style={{ marginTop: 8 }} />
        </div>
      </div>
      <div className="cr-product-img-wrap">
        <div className="cr-sk-img" />
      </div>
      <div className="cr-sk-line cr-sk-line--text" />
      <div className="cr-sk-line cr-sk-line--text" style={{ width: '70%', marginTop: 6 }} />
    </div>
  )
}

export default function CustomerReview() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [current, setCurrent] = useState(0)
  const [visibleCount, setVisibleCount] = useState(4)
  const [enableTransition] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [containerW, setContainerW] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const GAP = isMobile ? 0 : 24

  // ── Fetch real products from your API ──────────────────────────────────
  useEffect(() => {
    fetch('/api/products?limit=8')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => {
        const products: Record<string, unknown>[] = data.products ?? []

        // Map each reviewer to a DIFFERENT product image
        const built: Review[] = REVIEWERS.map((reviewer, i) => {
          const product = products[i % products.length] ?? {}
          const { image, name, slug } = extractProductInfo(product)
          return {
            id: i + 1,
            ...reviewer,
            productImage: image,
            productName: name,
            productSlug: slug,
          }
        })

        setReviews(built)
      })
      .catch(() => {
        // Fallback: reviewers without product images
        setReviews(
          REVIEWERS.map((r, i) => ({
            id: i + 1,
            ...r,
            productImage: '',
            productName: '',
            productSlug: '',
          }))
        )
      })
      .finally(() => setIsLoading(false))
  }, [])

  // ── Responsive ────────────────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setIsMobile(w <= 640)
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
    if (containerRef.current) setContainerW(containerRef.current.offsetWidth)
  }, [])

  const items = isLoading
    ? Array.from({ length: visibleCount })
    : reviews

  const maxIndex = Math.max(0, items.length - visibleCount)
  const goNext = () => setCurrent((c) => Math.min(c + 1, maxIndex))
  const goPrev = () => setCurrent((c) => Math.max(c - 1, 0))

  // ── Drag / swipe ──────────────────────────────────────────────────────
  const startX = useRef(0)
  const isDragging = useRef(false)
  const [dragOffset, setDragOffset] = useState(0)

  const onDragStart = (x: number) => { isDragging.current = true; startX.current = x }
  const onDragMove  = (x: number) => { if (isDragging.current) setDragOffset(x - startX.current) }
  const onDragEnd   = (x: number) => {
    if (!isDragging.current) return
    isDragging.current = false
    const dist = startX.current - x
    setDragOffset(0)
    if (dist > 50) goNext()
    else if (dist < -50) goPrev()
  }

  const cardWidth = containerW > 0
    ? (containerW - GAP * (visibleCount - 1)) / visibleCount
    : 0
  const moveSize = cardWidth + GAP

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        /* ── SECTION ── */
        .cr-section {
          padding: 60px 0 80px;
          background: #ffffff;
          overflow: hidden;
        }

        .cr-container {
          position: relative;
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 clamp(4.6rem, 4vw, 4rem);
          box-sizing: border-box;
        }

        /* ── HEADER ── */
        .cr-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 40px;
          gap: 24px;
        }

        .cr-title {
          margin: 0 0 6px;
          font-family: 'Poppins', sans-serif;
          font-size: clamp(1.6rem, 3vw, 2.6rem);
          font-weight: 600;
          color: #17172f;
          line-height: 1.1;
          letter-spacing: -0.03em;
        }

        .cr-subtitle {
          margin: 0;
          font-family: 'Poppins', sans-serif;
          font-size: 0.9rem;
          color: #d08a60;
          font-weight: 400;
        }

        /* ── NAV ── */
        .cr-nav {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
          padding-top: 4px;
        }

        .cr-nav-bottom { display: none; }

        .cr-nav-btn {
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

        .cr-nav-btn:hover:not(:disabled) {
          background: #d08a60;
          color: #ffffff;
          transform: translateY(-2px);
        }

        .cr-nav-btn:disabled {
          background: #f0ece8;
          border-color: #e7e1da;
          color: #c5bdb5;
          cursor: default;
        }

        /* ── SLIDER ── */
        .cr-slider {
          overflow: hidden;
          width: 100%;
          cursor: grab;
        }
        .cr-slider:active { cursor: grabbing; }

        .cr-track {
          display: flex;
          gap: 24px;
          will-change: transform;
          user-select: none;
        }

        /* ── CARD ── */
        .cr-card {
          flex-shrink: 0;
          background: #f4f2ef;
          border-radius: 6px;
          padding: 24px 20px 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-sizing: border-box;
          transition: box-shadow 0.3s ease;
          height: 420px;
        }

        .cr-card:hover {
          box-shadow: 0 10px 36px rgba(23, 23, 47, 0.09);
        }

        /* Top row: avatar + name/stars */
        .cr-card-top {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          margin-bottom: 22px;
        }

        .cr-avatar {
          width: 52px;
          height: 52px;
          border-radius: 999px;
          object-fit: cover;
          flex-shrink: 0;
          border: 2px solid #e8e4df;
        }

        .cr-card-meta {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .cr-name {
          font-family: 'Poppins', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          color: #17172f;
          line-height: 1.2;
        }

        .cr-stars {
          display: flex;
          gap: 3px;
        }

        .cr-star {
          width: 16px;
          height: 16px;
        }

        /* Product image — fixed height so all cards stay equal */
        .cr-product-img-wrap {
          width: 100%;
          height: 200px;
          flex-shrink: 0;
          margin-bottom: 20px;
          overflow: hidden;
          border-radius: 4px;
          background: #e8e4df;
        }

        .cr-product-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          pointer-events: none;
          display: block;
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .cr-card:hover .cr-product-img {
          transform: scale(1.04);
        }

        .cr-product-img-placeholder {
          width: 100%;
          height: 100%;
          background: #e8e4df;
        }

        /* Comment */
        .cr-comment {
          margin: 0;
          font-family: 'Poppins', sans-serif;
          font-size: 0.85rem;
          font-weight: 400;
          color: #888;
          line-height: 1.65;
          text-align: center;
          width: 100%;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          flex-shrink: 0;
        }

        /* ── SKELETON ── */
        .cr-skeleton { pointer-events: none; }

        .cr-sk-circle {
          width: 52px;
          height: 52px;
          border-radius: 999px;
          flex-shrink: 0;
          background: linear-gradient(90deg, #e8e4df 25%, #dedad4 50%, #e8e4df 75%);
          background-size: 200% 100%;
          animation: cr-shimmer 1.4s infinite;
        }

        .cr-sk-line {
          height: 13px;
          border-radius: 4px;
          background: linear-gradient(90deg, #e8e4df 25%, #dedad4 50%, #e8e4df 75%);
          background-size: 200% 100%;
          animation: cr-shimmer 1.4s infinite;
        }

        .cr-sk-line--name  { width: 120px; height: 15px; }
        .cr-sk-line--stars { width: 90px; }
        .cr-sk-line--text  { width: 90%; }

        .cr-sk-img {
          width: 100%;
          height: 200px;
          border-radius: 4px;
          background: linear-gradient(90deg, #e8e4df 25%, #dedad4 50%, #e8e4df 75%);
          background-size: 200% 100%;
          animation: cr-shimmer 1.4s infinite;
        }

        @keyframes cr-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ══ TABLET ══ */
        @media (max-width: 1024px) {
          .cr-section { padding: 48px 0 64px; }
          .cr-track { gap: 20px; }
          .cr-card { height: 380px; }
        }

        /* ══ MOBILE ══ */
        @media (max-width: 640px) {
          .cr-section { padding: 40px 0 52px; }
          .cr-container { padding: 0 1rem; }

          .cr-header {
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            gap: 14px;
            margin-bottom: 24px;
          }

          .cr-title { font-size: clamp(1.5rem, 7vw, 2rem); }
          .cr-subtitle { font-size: 0.82rem; }
          .cr-nav { display: none; }

          .cr-nav-bottom {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 14px;
            margin-top: 24px;
          }

          .cr-nav-btn { width: 42px; height: 42px; }
          .cr-track { gap: 0; }

          .cr-card {
            border-radius: 0;
            height: 360px;
            padding: 20px 16px 24px;
          }
        }

        /* ══ SMALL MOBILE ══ */
        @media (max-width: 420px) {
          .cr-section { padding: 32px 0 44px; }
          .cr-container { padding: 0 0.85rem; }
          .cr-title { font-size: 1.4rem; }
          .cr-subtitle { font-size: 0.78rem; }
          .cr-nav-btn { width: 38px; height: 38px; }
          .cr-nav-bottom { gap: 10px; margin-top: 18px; }
          .cr-card { height: 320px; padding: 16px 12px 20px; }
          .cr-name { font-size: 0.88rem; }
          .cr-product-img-wrap { height: 140px; }
          .cr-sk-img { height: 140px; }
        }
      `}</style>

      <section className="cr-section">
        <div className="cr-container">

          {/* Header */}
          <div className="cr-header">
            <div>
              <h2 className="cr-title">Our customer review</h2>
              <p className="cr-subtitle">Client say</p>
            </div>
            <div className="cr-nav">
              <button className="cr-nav-btn" onClick={goPrev} disabled={current === 0} aria-label="Previous">
                <ChevronLeft size={20} />
              </button>
              <button className="cr-nav-btn" onClick={goNext} disabled={current >= maxIndex} aria-label="Next">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Slider */}
          <div
            className="cr-slider"
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
              className="cr-track"
              style={{
                transform: `translate3d(calc(-${current * moveSize}px + ${dragOffset}px), 0, 0)`,
                transition: enableTransition ? 'transform 0.7s cubic-bezier(0.25,1,0.35,1)' : 'none',
              }}
            >
              {isLoading
                ? Array.from({ length: visibleCount }).map((_, i) => (
                    <div key={i} style={{ width: cardWidth || 280, minWidth: cardWidth || 280, maxWidth: cardWidth || 280 }}>
                      <ReviewSkeleton />
                    </div>
                  ))
                : reviews.map((review) => (
                    <div key={review.id} style={{ width: cardWidth || 280, minWidth: cardWidth || 280, maxWidth: cardWidth || 280 }}>
                      <ReviewCard review={review} />
                    </div>
                  ))}
            </div>
          </div>

          {/* Bottom nav: mobile only */}
          <div className="cr-nav-bottom">
            <button className="cr-nav-btn" onClick={goPrev} disabled={current === 0} aria-label="Previous">
              <ChevronLeft size={20} />
            </button>
            <button className="cr-nav-btn" onClick={goNext} disabled={current >= maxIndex} aria-label="Next">
              <ChevronRight size={20} />
            </button>
          </div>

        </div>
      </section>
    </>
  )
}