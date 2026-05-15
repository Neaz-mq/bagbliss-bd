'use client'

import { useRouter } from 'next/navigation'
import {
  useRef,
  useState,
  useEffect,
  useMemo,
} from 'react'

import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface Category {
  label: string
  value: string
  count: string
  image: string
}

// ─────────────────────────────────────────────────────────────
// Fallback Images
// ─────────────────────────────────────────────────────────────
const UNSPLASH: Record<string, string> = {
  sling:
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=80',

  wristlet:
    'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=1200&q=80',

  clutch:
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=80',

  leather:
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1200&q=80',

  crossbody:
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=80',

  canvas:
    'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=1200&q=80',

  party:
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=80',

  default:
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=80',
}

function getFallback(slug: string) {
  const lower = slug.toLowerCase()

  for (const key of Object.keys(UNSPLASH)) {
    if (lower.includes(key)) {
      return UNSPLASH[key]
    }
  }

  return UNSPLASH.default
}

function extractImageUrl(
  product: Record<string, unknown>
): string {
  const images = product.images

  if (Array.isArray(images) && images.length > 0) {
    const first = images[0]

    if (typeof first === 'string') return first

    if (
      typeof first === 'object' &&
      first !== null
    ) {
      const obj = first as Record<
        string,
        unknown
      >

      return (obj.url ||
        obj.secure_url ||
        '') as string
    }
  }

  return ''
}

// ─────────────────────────────────────────────────────────────
// Responsive Card Count
// ─────────────────────────────────────────────────────────────
function useVisibleCount() {
  const [count, setCount] = useState(3)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth

      if (w < 640) {
        setCount(1)
      } else if (w < 1024) {
        setCount(2)
      } else {
        setCount(3)
      }
    }

    update()

    window.addEventListener('resize', update)

    return () =>
      window.removeEventListener(
        'resize',
        update
      )
  }, [])

  return count
}

// ─────────────────────────────────────────────────────────────
// Card
// ─────────────────────────────────────────────────────────────
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

      {/* CONTENT */}
      <div className="cs-content">
        <h3>{category.label}</h3>
        <p>{category.count}</p>
      </div>

      {/* HOVER BUTTON */}
      <div className="cs-hover">
        <button
          className="cs-shop-btn"
          onClick={onShop}
        >
          <span>SHOP NOW</span>

          <ArrowRight
            size={22}
            strokeWidth={2}
          />
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export default function CategoryStrip() {
  const router = useRouter()

  const visibleCount = useVisibleCount()

  const GAP = 24

  const [categories, setCategories] =
    useState<Category[]>([])

  const [current, setCurrent] = useState(0)

  // ───────────────────────────────────────────────────────────
  // Fetch Categories
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/products?limit=300')
      .then((r) => r.json())
      .then((data) => {
        const products:
          | Array<Record<string, unknown>>
          | [] = data.products ?? []

        if (!products.length) {
          setCategories(demoCategories())
          return
        }

        const map = new Map<
          string,
          {
            count: number
            image: string
          }
        >()

        for (const p of products) {
          const cat = (
            (p.category as string) || ''
          ).trim()

          if (!cat) continue

          const img = extractImageUrl(p)

          if (map.has(cat)) {
            map.get(cat)!.count += 1
          } else {
            map.set(cat, {
              count: 1,
              image:
                img || getFallback(cat),
            })
          }
        }

        const result: Category[] =
          Array.from(map.entries()).map(
            ([label, value]) => ({
              label,
              value: label,
              count: `${value.count}+ Items`,
              image:
                value.image ||
                getFallback(label),
            })
          )

        setCategories(result)
      })
      .catch(() => {
        setCategories(demoCategories())
      })
  }, [])

  // ───────────────────────────────────────────────────────────
  // Infinite Loop
  // ───────────────────────────────────────────────────────────
  const extendedCategories = useMemo(() => {
    if (!categories.length) return []

    return [
      ...categories,
      ...categories.slice(0, visibleCount),
    ]
  }, [categories, visibleCount])

  // ───────────────────────────────────────────────────────────
  // Width Calculation
  // ───────────────────────────────────────────────────────────
  const containerRef =
    useRef<HTMLDivElement>(null)

  const [containerWidth, setContainerWidth] =
    useState(0)

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setContainerWidth(
          containerRef.current.offsetWidth
        )
      }
    }

    update()

    window.addEventListener('resize', update)

    return () =>
      window.removeEventListener(
        'resize',
        update
      )
  }, [])

  const cardWidth =
    (containerWidth -
      GAP * (visibleCount - 1)) /
    visibleCount

  const moveSize = cardWidth + GAP

  // ───────────────────────────────────────────────────────────
  // Smooth Loop
  // ───────────────────────────────────────────────────────────
  const [enableTransition, setEnableTransition] =
    useState(true)

  useEffect(() => {
    if (current >= categories.length) {
      const id = setTimeout(() => {
        setEnableTransition(false)

        setCurrent(0)

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setEnableTransition(true)
          })
        })
      }, 700)

      return () => clearTimeout(id)
    }
  }, [current, categories.length])

  // ───────────────────────────────────────────────────────────
  // Auto Slide
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (
      categories.length <= visibleCount
    )
      return

    const timer = setInterval(() => {
      setCurrent((prev) => prev + 1)
    }, 4500)

    return () => clearInterval(timer)
  }, [categories.length, visibleCount])

  // ───────────────────────────────────────────────────────────
  // Navigation
  // ───────────────────────────────────────────────────────────
  const goNext = () => {
    setCurrent((prev) => prev + 1)
  }

  const goPrev = () => {
    if (current === 0) {
      setEnableTransition(false)

      setCurrent(categories.length - 1)

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setEnableTransition(true)
        })
      })
    } else {
      setCurrent((prev) => prev - 1)
    }
  }

  // ───────────────────────────────────────────────────────────
  // DRAG
  // ───────────────────────────────────────────────────────────
  const [isDragging, setIsDragging] =
    useState(false)

  const startX = useRef(0)

  const currentTranslate = useRef(0)

  const handleDragStart = (
    clientX: number
  ) => {
    setIsDragging(true)

    startX.current = clientX
  }

  const handleDragMove = (
    clientX: number
  ) => {
    if (!isDragging) return

    const walk =
      clientX - startX.current

    currentTranslate.current = walk
  }

  const handleDragEnd = (
    clientX: number
  ) => {
    if (!isDragging) return

    const distance =
      startX.current - clientX

    if (distance > 60) {
      goNext()
    }

    if (distance < -60) {
      goPrev()
    }

    currentTranslate.current = 0

    setIsDragging(false)
  }

  return (
    <>
      <style jsx global>{`
        .cs-section {
          padding: 90px 0;
          overflow: hidden;
          background: #ffffff;
        }

        .cs-container {
          width: 100%;
          max-width: 1440px;
          margin: auto;
          padding: 0 40px;
        }

        /* HEADER */
        .cs-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 42px;
          gap: 20px;
        }

        .cs-title {
          margin: 0;

          font-size: 56px;

          font-weight: 800;

          color: #17172f;

          letter-spacing: -2px;
        }

        .cs-subtitle {
          margin-top: 14px;

          font-size: 20px;

          color: #d08a60;

          font-weight: 500;
        }

        /* NAV */
        .cs-nav {
          display: flex;
          gap: 14px;
        }

        .cs-btn {
          width: 68px;
          height: 68px;

          border-radius: 999px;

          border: 1.5px solid #d08a60;

          background: transparent;

          display: flex;
          align-items: center;
          justify-content: center;

          cursor: pointer;

          color: #d08a60;

          transition: all 0.35s
            cubic-bezier(0.22, 1, 0.36, 1);
        }

        .cs-btn:hover {
          background: #d08a60;
          color: white;
          transform: translateY(-2px);
        }

        /* SLIDER */
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

        /* CARD */
        .cs-card {
          position: relative;

          flex-shrink: 0;

          aspect-ratio: 1.15 / 1;

          border-radius: 30px;

          overflow: hidden;

          transform: translateZ(0);
        }

        .cs-img {
          width: 100%;
          height: 100%;

          object-fit: cover;

          transition: transform 1s
            cubic-bezier(0.22, 1, 0.36, 1);

          pointer-events: none;
        }

        .cs-card:hover .cs-img {
          transform: scale(1.07);
        }

        /* OVERLAY */
        .cs-overlay {
          position: absolute;
          inset: 0;

          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.92) 0%,
            rgba(0, 0, 0, 0.35) 45%,
            rgba(0, 0, 0, 0.08) 100%
          );

          z-index: 1;
        }

        /* CONTENT */
        .cs-content {
          position: absolute;

          left: 32px;
          right: 32px;
          bottom: 36px;

          z-index: 2;

          text-align: center;

          transition: all 0.45s
            cubic-bezier(0.22, 1, 0.36, 1);
        }

        .cs-content h3 {
          margin: 0;

          font-size: 34px;

          font-weight: 800;

          color: white;

          letter-spacing: -1.4px;
        }

        .cs-content p {
          margin-top: 12px;

          font-size: 18px;

          color: rgba(
            255,
            255,
            255,
            0.92
          );
        }

        .cs-card:hover .cs-content {
          opacity: 0;
          transform: translateY(22px);
        }

        /* HOVER */
        .cs-hover {
          position: absolute;

          left: 28px;
          right: 28px;
          bottom: 28px;

          z-index: 3;

          opacity: 0;

          transform: translateY(34px);

          transition: all 0.5s
            cubic-bezier(0.22, 1, 0.36, 1);
        }

        .cs-card:hover .cs-hover {
          opacity: 1;
          transform: translateY(0);
        }

        /* BUTTON */
        .cs-shop-btn {
          width: 100%;
          height: 74px;

          border: none;

          border-radius: 999px;

          background: #d08a60;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 0 34px;

          cursor: pointer;

          transition: all 0.45s
            cubic-bezier(0.22, 1, 0.36, 1);
        }

        .cs-shop-btn span {
          font-size: 20px;

          font-weight: 800;

          color: white;

          transition: color 0.35s ease;
        }

        .cs-shop-btn svg {
          color: white;

          transition: color 0.35s ease;
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

        /* MOBILE */
        @media (max-width: 640px) {
          .cs-container {
            padding: 0 16px;
          }

          .cs-title {
            font-size: 34px;
          }

          .cs-subtitle {
            font-size: 15px;
          }

          .cs-card {
            border-radius: 24px;
          }

          .cs-content h3 {
            font-size: 28px;
          }

          .cs-content p {
            font-size: 15px;
          }

          .cs-hover {
            left: 16px;
            right: 16px;
            bottom: 16px;
          }

          .cs-shop-btn {
            height: 60px;
            padding: 0 24px;
          }

          .cs-shop-btn span {
            font-size: 16px;
          }
        }
      `}</style>

      <section className="cs-section">
        <div className="cs-container">
          <div className="cs-header">
            <div>
              <h2 className="cs-title">
                Collection list
              </h2>

              <p className="cs-subtitle">
                Discover timeless bags for
                every journey
              </p>
            </div>

            <div className="cs-nav">
              <button
                className="cs-btn"
                onClick={goPrev}
              >
                <ChevronLeft size={24} />
              </button>

              <button
                className="cs-btn"
                onClick={goNext}
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          <div
            className="cs-slider"
            ref={containerRef}
            onMouseDown={(e) =>
              handleDragStart(e.clientX)
            }
            onMouseMove={(e) =>
              handleDragMove(e.clientX)
            }
            onMouseUp={(e) =>
              handleDragEnd(e.clientX)
            }
            onMouseLeave={(e) =>
              handleDragEnd(e.clientX)
            }
            onTouchStart={(e) =>
              handleDragStart(
                e.touches[0].clientX
              )
            }
            onTouchMove={(e) =>
              handleDragMove(
                e.touches[0].clientX
              )
            }
            onTouchEnd={(e) =>
              handleDragEnd(
                e.changedTouches[0].clientX
              )
            }
          >
            <div
              className="cs-track"
              style={{
                transform: `translate3d(calc(-${
                  current * moveSize
                }px + ${
                  isDragging
                    ? currentTranslate.current
                    : 0
                }px),0,0)`,

                transition: isDragging
                  ? 'none'
                  : enableTransition
                  ? 'transform 0.85s cubic-bezier(0.22,1,0.36,1)'
                  : 'none',
              }}
            >
              {extendedCategories.map(
                (cat, i) => (
                  <CategoryCard
                    key={i}
                    category={cat}
                    cardWidth={cardWidth}
                    onShop={() =>
                      router.push(
                        `/shop?category=${encodeURIComponent(
                          cat.value
                        )}`
                      )
                    }
                  />
                )
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

// ─────────────────────────────────────────────────────────────
// Demo Categories
// ─────────────────────────────────────────────────────────────
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
      label: 'canvas',
      value: 'canvas',
      count: '2+ Items',
      image:
        'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=1200&q=80',
    },
  ]
}