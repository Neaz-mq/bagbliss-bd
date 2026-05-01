'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, TrendingUp, ShoppingBag } from 'lucide-react'
import ProductCard from '@/components/product/ProductCard'
import ProductSkeleton from '@/components/product/ProductSkeleton'
import { IProduct } from '@/types'

// ── Mock products ──────────────────────────────────────────────────────────
const MOCK_PRODUCTS: IProduct[] = [
  {
    _id: '1',
    name: 'Pearl Mini Crossbody',
    slug: 'pearl-mini-crossbody',
    description: 'Elegant pearl-finish mini crossbody bag',
    shortDescription: 'Perfect for daily use',
    price: 1200,
    discountPrice: 950,
    category: 'Mini Crossbody',
    tags: ['trending', 'new'],
    colors: [
      { name: 'Pearl White', hex: '#f8f4f0', images: [], stock: 15 },
      { name: 'Blush Pink',  hex: '#E91E8C', images: [], stock: 10 },
      { name: 'Midnight',    hex: '#1A1A2E', images: [], stock: 8  },
    ],
    mainImage: { url: '', cloudinaryId: '', alt: 'Pearl Mini Crossbody' },
    status: 'active',
    isFeatured: true,
    isFlashSale: false,
    soldCount: 234,
    stock: 33,
    ratings: { average: 4.8, count: 127 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    name: 'Gold Chain Sling',
    slug: 'gold-chain-sling',
    description: 'Luxury gold chain strap crossbody',
    shortDescription: 'Statement piece for any outfit',
    price: 1800,
    discountPrice: undefined,
    category: 'Chain Strap',
    tags: ['luxury', 'trending'],
    colors: [
      { name: 'Champagne', hex: '#C9A84C', images: [], stock: 12 },
      { name: 'Black',     hex: '#1A1A2E', images: [], stock: 7  },
    ],
    mainImage: { url: '', cloudinaryId: '', alt: 'Gold Chain Sling' },
    status: 'active',
    isFeatured: true,
    isFlashSale: true,
    flashSalePrice: 1400,
    soldCount: 189,
    stock: 19,
    ratings: { average: 4.9, count: 89 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '3',
    name: 'Candy Quilted Bag',
    slug: 'candy-quilted-bag',
    description: 'Cute quilted pattern mini bag',
    shortDescription: 'Sweet and stylish',
    price: 950,
    discountPrice: 750,
    category: 'Mini Crossbody',
    tags: ['cute', 'new'],
    colors: [
      { name: 'Hot Pink', hex: '#E91E8C', images: [], stock: 20 },
      { name: 'Sky Blue', hex: '#3b82f6', images: [], stock: 15 },
      { name: 'Mint',     hex: '#10b981', images: [], stock: 10 },
      { name: 'Lilac',    hex: '#8b5cf6', images: [], stock: 8  },
    ],
    mainImage: { url: '', cloudinaryId: '', alt: 'Candy Quilted Bag' },
    status: 'active',
    isFeatured: true,
    isFlashSale: false,
    soldCount: 312,
    stock: 53,
    ratings: { average: 4.7, count: 203 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '4',
    name: 'Vintage Leather Satchel',
    slug: 'vintage-leather-satchel',
    description: 'Classic vintage-inspired leather bag',
    shortDescription: 'Timeless elegance',
    price: 2200,
    discountPrice: 1800,
    category: 'Leather',
    tags: ['vintage', 'premium'],
    colors: [
      { name: 'Tan Brown',  hex: '#92400e', images: [], stock: 6 },
      { name: 'Dark Brown', hex: '#451a03', images: [], stock: 4 },
    ],
    mainImage: { url: '', cloudinaryId: '', alt: 'Vintage Leather Satchel' },
    status: 'active',
    isFeatured: true,
    isFlashSale: false,
    soldCount: 98,
    stock: 10,
    ratings: { average: 5.0, count: 45 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '5',
    name: 'Boho Canvas Tote',
    slug: 'boho-canvas-tote',
    description: 'Bohemian canvas crossbody bag',
    shortDescription: 'Free-spirited style',
    price: 850,
    discountPrice: undefined,
    category: 'Canvas',
    tags: ['boho', 'casual'],
    colors: [
      { name: 'Natural', hex: '#d4b896', images: [], stock: 25 },
      { name: 'Navy',    hex: '#1e3a5f', images: [], stock: 18 },
    ],
    mainImage: { url: '', cloudinaryId: '', alt: 'Boho Canvas Tote' },
    status: 'active',
    isFeatured: true,
    isFlashSale: false,
    soldCount: 156,
    stock: 43,
    ratings: { average: 4.6, count: 78 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '6',
    name: 'Party Glitter Clutch',
    slug: 'party-glitter-clutch',
    description: 'Glamorous glitter evening bag',
    shortDescription: 'Shine at every party',
    price: 1500,
    discountPrice: 1200,
    category: 'Party & Evening',
    tags: ['party', 'glam'],
    colors: [
      { name: 'Gold Glitter', hex: '#C9A84C', images: [], stock: 12 },
      { name: 'Silver',       hex: '#9ca3af', images: [], stock: 10 },
      { name: 'Rose Gold',    hex: '#f9a8d4', images: [], stock: 8  },
    ],
    mainImage: { url: '', cloudinaryId: '', alt: 'Party Glitter Clutch' },
    status: 'active',
    isFeatured: true,
    isFlashSale: true,
    flashSalePrice: 999,
    soldCount: 267,
    stock: 30,
    ratings: { average: 4.8, count: 156 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '7',
    name: 'Minimalist Crossbody',
    slug: 'minimalist-crossbody',
    description: 'Clean lines, pure style',
    shortDescription: 'Less is more',
    price: 1100,
    discountPrice: undefined,
    category: 'Mini Crossbody',
    tags: ['minimal', 'clean'],
    colors: [
      { name: 'White', hex: '#ffffff', images: [], stock: 20 },
      { name: 'Black', hex: '#1A1A2E', images: [], stock: 20 },
      { name: 'Beige', hex: '#f5f0eb', images: [], stock: 15 },
    ],
    mainImage: { url: '', cloudinaryId: '', alt: 'Minimalist Crossbody' },
    status: 'active',
    isFeatured: true,
    isFlashSale: false,
    soldCount: 445,
    stock: 55,
    ratings: { average: 4.9, count: 312 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '8',
    name: 'Floral Summer Bag',
    slug: 'floral-summer-bag',
    description: 'Vibrant floral print crossbody',
    shortDescription: 'Summer vibes only',
    price: 780,
    discountPrice: 650,
    category: 'Canvas',
    tags: ['floral', 'summer'],
    colors: [
      { name: 'Pink Floral', hex: '#E91E8C', images: [], stock: 18 },
      { name: 'Blue Floral', hex: '#3b82f6', images: [], stock: 14 },
    ],
    mainImage: { url: '', cloudinaryId: '', alt: 'Floral Summer Bag' },
    status: 'active',
    isFeatured: true,
    isFlashSale: false,
    soldCount: 178,
    stock: 32,
    ratings: { average: 4.7, count: 94 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// ── Tab Filter ─────────────────────────────────────────────────────────────
const TABS = [
  { label: 'All',          value: 'all'      },
  { label: '🔥 Trending',  value: 'trending' },
  { label: '✨ New Arrivals', value: 'new'   },
  { label: '⚡ Flash Sale', value: 'sale'    },
]

export default function FeaturedProducts() {
  const [activeTab,  setActiveTab]  = useState('all')
  const [isLoading,  setIsLoading]  = useState(true)
  const [products,   setProducts]   = useState<IProduct[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setProducts(MOCK_PRODUCTS)
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'all')      return true
    if (activeTab === 'trending') return p.soldCount > 150
    if (activeTab === 'new')      return p.tags.includes('new')
    if (activeTab === 'sale')     return p.isFlashSale
    return true
  })

  const handleTabClick = (value: string) => {
    setIsLoading(true)
    setActiveTab(value)
    setTimeout(() => setIsLoading(false), 300)
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
              type="button"                             // ✅ explicit type prevents form submit
              onClick={() => handleTabClick(tab.value)} // ✅ extracted handler, no inline object
              className={`featured-tab ${activeTab === tab.value ? 'featured-tab-active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            : filteredProducts.map((product, i) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  index={i}
                />
              ))}
        </div>

        {/* Bottom CTA */}
        {!isLoading && filteredProducts.length > 0 && (
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