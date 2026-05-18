'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState, useEffect, useMemo } from 'react'

import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

interface Category {
  label: string
  value: string
  count: string
  image: string
}

const UNSPLASH: Record<string, string> = {
  sling:
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=80',
  wristlet:
    'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=1200&q=80',
  party:
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=80',
  clutch:
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=80',
  leather:
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1200&q=80',
  crossbody:
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=80',
  canvas:
    'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=1200&q=80',
  default:
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=80',
}

function getFallback(slug: string) {
  const lower = slug.toLowerCase()
  for (const key of Object.keys(UNSPLASH)) {
    if (lower.includes(key)) return UNSPLASH[key]
  }
  return UNSPLASH.default
}

function extractImageUrl(product: Record<string, unknown>): string {
  const images = product.images
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0]
    if (typeof first === 'string') return first
    if (typeof first === 'object' && first !== null) {
      const obj = first as Record<string, unknown>
      return (obj.url || obj.secure_url || '') as string
    }
  }
  return ''
}

function useVisibleCount() {
  const [count, setCount] = useState(3)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      // On mobile (≤640) always show 1 full card
      if (w <= 640) setCount(1)
      else if (w < 900) setCount(2)
      else setCount(3)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return count
}

// On mobile the GAP between cards should be 0 so each card is exactly 100% wide
function useGap() {
  const [gap, setGap] = useState(24)
  useEffect(() => {
    const update = () => setGap(window.innerWidth <= 640 ? 0 : 24)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return gap
}

function CategoryCard({
  category,
  cardWidth,
  onShop,
}: {
  category: Category
  cardWidth: number
  onShop: () => void
}) {
  return (
    <div
      className="cs-card"
      style={{
        width: `${cardWidth}px`,
        minWidth: `${cardWidth}px`,
        maxWidth: `${cardWidth}px`,
      }}
    >
      <img
        src={category.image}
        alt={category.label}
        className="cs-img"
        draggable={false}
      />
      <div className="cs-overlay" />
      <div className="cs-content">
        <h3>{category.label}</h3>
        <p>{category.count}</p>
      </div>
      <div className="cs-hover">
        <button className="cs-shop-btn" onClick={onShop}>
          <span>SHOP NOW</span>
          <ArrowRight size={22} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

export default function CategoryStrip() {
  const router = useRouter()
  const visibleCount = useVisibleCount()
  const GAP = useGap()

  const [categories, setCategories] = useState<Category[]>([])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    fetch('/api/products?limit=300')
      .then((r) => r.json())
      .then((data) => {
        const products: Array<Record<string, unknown>> | [] =
          data.products ?? []

        if (!products.length) {
          setCategories(demoCategories())
          return
        }

        const map = new Map<string, { count: number; image: string }>()

        for (const p of products) {
          const cat = ((p.category as string) || '').trim()
          if (!cat) continue
          const img = extractImageUrl(p)
          if (map.has(cat)) {
            map.get(cat)!.count += 1
          } else {
            map.set(cat, { count: 1, image: img || getFallback(cat) })
          }
        }

        const result: Category[] = Array.from(map.entries()).map(
          ([label, value]) => ({
            label,
            value: label,
            count: `${value.count}+ Items`,
            image: value.image || getFallback(label),
          })
        )

        setCategories(result)
      })
      .catch(() => setCategories(demoCategories()))
  }, [])

  const extendedCategories = useMemo(() => {
    if (!categories.length) return []
    return [...categories, ...categories.slice(0, visibleCount)]
  }, [categories, visibleCount])

  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const update = () => {
      if (containerRef.current)
        setContainerWidth(containerRef.current.offsetWidth)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const cardWidth =
    containerWidth > 0
      ? (containerWidth - GAP * (visibleCount - 1)) / visibleCount
      : 0

  // Each slide step = one card width + gap
  const moveSize = cardWidth + GAP

  const [enableTransition, setEnableTransition] = useState(true)

  useEffect(() => {
    if (current >= categories.length) {
      const id = setTimeout(() => {
        setEnableTransition(false)
        setCurrent(0)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setEnableTransition(true))
        })
      }, 700)
      return () => clearTimeout(id)
    }
  }, [current, categories.length])

  useEffect(() => {
    if (categories.length <= visibleCount) return
    const timer = setInterval(() => setCurrent((prev) => prev + 1), 4500)
    return () => clearInterval(timer)
  }, [categories.length, visibleCount])

  const goNext = () => setCurrent((prev) => prev + 1)

  const goPrev = () => {
    if (current === 0) {
      setEnableTransition(false)
      setCurrent(categories.length - 1)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setEnableTransition(true))
      })
    } else {
      setCurrent((prev) => prev - 1)
    }
  }

  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const startX = useRef(0)
  const isDraggingRef = useRef(false)

  const handleDragStart = (clientX: number) => {
    isDraggingRef.current = true
    setIsDragging(true)
    startX.current = clientX
    setDragOffset(0)
  }

  const handleDragMove = (clientX: number) => {
    if (!isDraggingRef.current) return
    setDragOffset(clientX - startX.current)
  }

  const handleDragEnd = (clientX: number) => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    const distance = startX.current - clientX
    setDragOffset(0)
    setIsDragging(false)
    if (distance > 40) goNext()
    else if (distance < -40) goPrev()
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

        * {
          box-sizing: border-box;
        }

        /* ─── SECTION ─── */
        .cs-section {
          padding: 110px 0;
          overflow: hidden;
          background: #ffffff;
        }

        /* ─── CONTAINER ─── */
        .cs-container {
          position: relative;
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 clamp(4.6rem, 4vw, 4rem);
          box-sizing: border-box;
        }

        /* ─── HEADER ─── */
        .cs-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          width: 100%;
          margin-bottom: 54px;
          gap: 30px;
        }

        .cs-title {
          margin: 0;
          font-family: 'Poppins', sans-serif;
          font-size: clamp(2.2rem, 4vw, 4.6rem);
          line-height: 0.95;
          font-weight: 500;
          color: #17172f;
          letter-spacing: -0.055em;
        }

        .cs-subtitle {
          margin-top: 14px;
          font-family: 'Poppins', sans-serif;
          font-size: clamp(0.9rem, 1vw, 1.08rem);
          color: #d08a60;
          font-weight: 500;
          line-height: 1.7;
        }

        /* ─── NAV BUTTONS ─── */
        .cs-nav {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
        }

        .cs-btn {
          width: 60px;
          height: 60px;
          border-radius: 999px;
          border: 1.5px solid #d08a60;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #d08a60;
          transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .cs-btn:hover {
          background: #d08a60;
          color: white;
          transform: translateY(-2px);
        }

        /* ─── SLIDER ─── */
        .cs-slider {
          overflow: hidden;
          width: 100%;
          cursor: grab;
        }

        .cs-slider:active {
          cursor: grabbing;
        }

        .cs-track {
          display: flex;
          gap: 24px;
          will-change: transform;
          user-select: none;
        }

        /* ─── CARD ─── */
        .cs-card {
          position: relative;
          flex-shrink: 0;
          aspect-ratio: 1.06 / 1;
          border-radius: 0;
          overflow: hidden;
          background: #f7f7f7;
          transform: translateZ(0);
        }

        .cs-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 1.2s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
        }

        .cs-card:hover .cs-img {
          transform: scale(1.08);
        }

        /* ─── OVERLAY ─── */
        .cs-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.92) 0%,
            rgba(0, 0, 0, 0.45) 45%,
            rgba(0, 0, 0, 0.08) 100%
          );
          z-index: 1;
        }

        /* ─── CONTENT (default visible) ─── */
        .cs-content {
          position: absolute;
          left: 0; /* was 34px */
          right: 0; /* was 34px */
          bottom: 38px;
          z-index: 2;
          transition: all 0.45s cubic-bezier(0.22, 1, 0.36, 1);
          text-align: center; /* ← ADD */
        }
        .cs-content h3 {
          margin: 0;
          font-family: 'Poppins', sans-serif;
          font-size: clamp(1.2rem, 2vw, 2rem);
          line-height: 1.08;
          font-weight: 500;
          color: white;
          letter-spacing: -0.04em;
          text-transform: capitalize;
        }

        .cs-content p {
          margin-top: 10px;
          font-family: 'Poppins', sans-serif;
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.88);
          font-weight: 400;
        }

        .cs-card:hover .cs-content {
          opacity: 0;
          transform: translateY(24px);
        }

        /* ─── HOVER BUTTON ─── */
        .cs-hover {
          position: absolute;
          left: 28px;
          right: 28px;
          bottom: 28px;
          z-index: 3;
          opacity: 0;
          transform: translateY(36px);
          transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
          display: flex; /* ← ADD */
          justify-content: center; /* ← ADD */
        }

        .cs-card:hover .cs-hover {
          opacity: 1;
          transform: translateY(0);
        }

        .cs-shop-btn {
          width: 100%;
          height: 68px;
          border: none;
          border-radius: 999px;
          background: #d08a60;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 30px;
          cursor: pointer;
          transition: all 0.45s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .cs-shop-btn span {
          font-family: 'Poppins', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: white;
        }

        .cs-shop-btn svg {
          color: white;
        }

        .cs-shop-btn:hover {
          background: white;
          transform: scale(1.015);
        }
        .cs-shop-btn:hover span {
          color: #17172f;
        }
        .cs-shop-btn:hover svg {
          color: #17172f;
        }

        /* ══════════════════════════════
           TABLET  (max 1024px)
        ══════════════════════════════ */
        @media (max-width: 1024px) {
          .cs-section {
            padding: 80px 0;
          }

          .cs-header {
            margin-bottom: 38px;
          }

          .cs-track {
            gap: 20px;
          }

          .cs-content {
            left: 26px;
            right: 26px;
            bottom: 30px;
          }

          .cs-hover {
            left: 22px;
            right: 22px;
            bottom: 22px;
          }

          .cs-shop-btn {
            height: 62px;
            padding: 0 26px;
          }
        }

        /* ══════════════════════════════
           MOBILE  (max 640px)
           — 1 full card per slide, no cut-off
           — shorter card height
        ══════════════════════════════ */
        @media (max-width: 640px) {
          .cs-section {
            padding: 56px 0 60px;
          }

          /* Side padding gives the card gap from screen edges */
          .cs-container {
            padding: 0 1rem;
          }

          .cs-header {
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            gap: 20px;
            margin-bottom: 28px;
            padding: 0;
          }

          .cs-title {
            font-size: clamp(1.6rem, 7.5vw, 2.2rem);
            letter-spacing: -0.04em;
          }

          .cs-subtitle {
            margin-top: 6px;
            font-size: 0.82rem;
            line-height: 1.5;
          }

          .cs-nav {
            gap: 10px;
            justify-content: center;
          }

          .cs-btn {
            width: 42px;
            height: 42px;
          }

          /* Slider full viewport width */
          .cs-slider {
            width: 100%;
            overflow: hidden;
          }

          /* Gap = 0 so each card snaps fully into view */
          .cs-track {
            gap: 0;
          }

          /* Card: sharp corners, shorter 4:3 ratio */
          .cs-card {
            border-radius: 0;
            aspect-ratio: 4 / 3;
          }

          .cs-content {
            left: 0; /* was 20px */
            right: 0; /* was 20px */
            bottom: 22px;
            text-align: center;
          }
          .cs-content h3 {
            font-size: clamp(1.35rem, 5.5vw, 1.7rem);
            letter-spacing: -0.03em;
          }

          .cs-content p {
            margin-top: 7px;
            font-size: 0.85rem;
          }

          .cs-hover {
            left: 14px;
            right: 14px;
            bottom: 14px;
          }

          .cs-card:active .cs-hover {
            opacity: 1;
            transform: translateY(0);
          }

          .cs-card:active .cs-content {
            opacity: 0;
            transform: translateY(24px);
          }

          .cs-shop-btn {
            height: 54px;
            padding: 0 20px;
            border-radius: 14px;
          }

          .cs-shop-btn span {
            font-size: 0.88rem;
          }
        }

        /* ══════════════════════════════
           SMALL MOBILE  (max 420px)
        ══════════════════════════════ */
        @media (max-width: 420px) {
          .cs-section {
            padding: 48px 0 52px;
          }

          .cs-container {
            padding: 0 0.85rem;
          }

          .cs-title {
            font-size: 1.5rem;
          }

          .cs-subtitle {
            font-size: 0.78rem;
          }

          .cs-btn {
            width: 38px;
            height: 38px;
          }

          .cs-track {
            gap: 0;
          }

          .cs-card {
            border-radius: 0;
            aspect-ratio: 4 / 3;
          }

          .cs-content {
            left: 16px;
            right: 16px;
            bottom: 18px;
          }

          .cs-content h3 {
            font-size: 1.25rem;
          }

          .cs-shop-btn {
            height: 50px;
            padding: 0 18px;
          }
        }
      `}</style>

      <section className="cs-section">
        <div className="cs-container">
          <div className="cs-header">
            <div>
              <h2 className="cs-title">Collection list</h2>
              <p className="cs-subtitle">
                Elevate your everyday aesthetic on the move
              </p>
            </div>

            <div className="cs-nav">
              <button className="cs-btn" onClick={goPrev}>
                <ChevronLeft size={22} />
              </button>
              <button className="cs-btn" onClick={goNext}>
                <ChevronRight size={22} />
              </button>
            </div>
          </div>

          <div
            className="cs-slider"
            ref={containerRef}
            onMouseDown={(e) => handleDragStart(e.clientX)}
            onMouseMove={(e) => handleDragMove(e.clientX)}
            onMouseUp={(e) => handleDragEnd(e.clientX)}
            onMouseLeave={(e) => handleDragEnd(e.clientX)}
            onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
            onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
            onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientX)}
          >
            <div
              className="cs-track"
              style={{
                transform: `translate3d(calc(-${current * moveSize}px + ${dragOffset}px),0,0)`,
                transition: isDragging
                  ? 'transform 0.05s linear'
                  : enableTransition
                    ? 'transform 0.7s cubic-bezier(0.25,1,0.35,1)'
                    : 'none',
              }}
            >
              {extendedCategories.map((cat, i) => (
                <CategoryCard
                  key={i}
                  category={cat}
                  cardWidth={cardWidth}
                  onShop={() =>
                    router.push(
                      `/shop?category=${encodeURIComponent(cat.value)}`
                    )
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function demoCategories(): Category[] {
  return [
    {
      label: 'crossbody bag',
      value: 'crossbody',
      count: '12+ Items',
      image:
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=80',
    },
    {
      label: 'clutch bag',
      value: 'clutch',
      count: '10+ Items',
      image:
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=80',
    },
    {
      label: 'canvas bag',
      value: 'canvas',
      count: '2+ Items',
      image:
        'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=1200&q=80',
    },
  ]
}
