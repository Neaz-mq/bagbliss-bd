'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, TrendingUp, ShoppingBag } from 'lucide-react'
import ProductCard from '@/components/product/ProductCard'
import ProductSkeleton from '@/components/product/ProductSkeleton'
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
    hex: (c.hex as string) ?? '#E91E8C',
    images: [],
    stock: typeof c.stock === 'number' ? c.stock : 0,
  }))

  // ✅ raw.images is string[] in DB — handle plain strings
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

const TABS = [
  { label: 'All',             value: 'all'      },
  { label: '🔥 Trending',     value: 'trending' },
  { label: '✨ New Arrivals', value: 'new'      },
  { label: '⚡ Flash Sale',   value: 'sale'     },
]

export default function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [allProducts, setAllProducts] = useState<IProduct[]>([])
  const [error, setError] = useState(false)

  // ── Fetch real products from API on mount ──────────────────────────────
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

  // ── Tab filtering ──────────────────────────────────────────────────────
  const filteredProducts = allProducts.filter((p) => {
    if (activeTab === 'all')      return true
    if (activeTab === 'trending') return p.soldCount > 50
    if (activeTab === 'new')      return p.tags.includes('new')
    if (activeTab === 'sale')     return p.isFlashSale
    return true
  })

  const handleTabClick = (value: string) => {
    setActiveTab(value)
  }

  return (
    <section className="section featured-section">
      <div className="container-bagbliss">

        {/* Header */}
        <div className="featured-header">
          <div className="featured-header-left">
            <div className="section-badge">
              <TrendingUp size={12} />
              <span>Featured Collection</span>
            </div>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '0' }}>
              Trending Right Now
            </h2>
          </div>
          <Link href="/shop" className="featured-view-all">
            View All
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Tab Filter */}
        <div className="featured-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleTabClick(tab.value)}
              className={`featured-tab ${activeTab === tab.value ? 'featured-tab-active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
          ) : error ? (
            // Error state
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#888', marginBottom: '1rem' }}>
                Could not load products. Please try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Retry
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            // Empty state for tab
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#888' }}>No products found for this filter.</p>
            </div>
          ) : (
            filteredProducts.map((product, i) => (
              <ProductCard
                key={product._id}
                product={product}
                index={i}
              />
            ))
          )}
        </div>

        {/* Bottom CTA */}
        {!isLoading && !error && filteredProducts.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/shop" className="btn-primary">
              <ShoppingBag size={18} />
              Explore Full Collection
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}