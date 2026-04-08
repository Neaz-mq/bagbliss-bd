'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import {
  SlidersHorizontal,
  X,
  ChevronDown,
  Grid2X2,
  LayoutList,
  Search,
  ShoppingBag,
  ArrowUpDown,
  Tag,

} from 'lucide-react'

import ShopFilters from './ShopFilters'
import ShopActiveFilters from './ShopActiveFilters'
import ShopProductCard from './ShopProductCard'

// ── Types ─────────────────────────────────────
export interface Product {
  _id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  colors?: string[]
  rating?: number
  reviewCount?: number
  stock: number
  isFeatured?: boolean
  isOnSale?: boolean
  discountPercent?: number
  tags?: string[]
  createdAt: string
}

export interface FilterState {
  categories: string[]
  priceMin: number | null
  priceMax: number | null
  colors: string[]
  onSaleOnly: boolean
  inStockOnly: boolean
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
]

const CATEGORIES = [
  'All',
  'Mini Crossbody',
  'Chain Strap',
  'Leather',
  'Canvas',
  'Party & Evening',
]

const MOCK_PRODUCTS: Product[] = [
  {
    _id: '1', name: 'Pearl Mini Crossbody', slug: 'pearl-mini-crossbody',
    price: 1199, originalPrice: 1599, images: [], category: 'Mini Crossbody',
    colors: ['#f5f5f0', '#e91e8c', '#1a1a2e'], rating: 4.8, reviewCount: 128,
    stock: 12, isFeatured: true, isOnSale: true, discountPercent: 25, createdAt: new Date().toISOString(),
  },
  {
    _id: '2', name: 'Gold Chain Sling', slug: 'gold-chain-sling',
    price: 1599, originalPrice: 1999, images: [], category: 'Chain Strap',
    colors: ['#c9a84c', '#1a1a2e', '#e91e8c'], rating: 4.9, reviewCount: 89,
    stock: 7, isFeatured: true, isOnSale: true, discountPercent: 20, createdAt: new Date().toISOString(),
  },
  {
    _id: '3', name: 'Candy Quilted Bag', slug: 'candy-quilted-bag',
    price: 999, images: [], category: 'Mini Crossbody',
    colors: ['#e91e8c', '#9b59b6', '#ffffff'], rating: 4.7, reviewCount: 64,
    stock: 20, isFeatured: true, createdAt: new Date().toISOString(),
  },
  {
    _id: '4', name: 'Vintage Leather Satchel', slug: 'vintage-leather-satchel',
    price: 2199, originalPrice: 2799, images: [], category: 'Leather',
    colors: ['#8B4513', '#1a1a2e', '#c9a84c'], rating: 4.6, reviewCount: 42,
    stock: 5, isFeatured: true, isOnSale: true, discountPercent: 21, createdAt: new Date().toISOString(),
  },
  {
    _id: '5', name: 'Boho Canvas Tote', slug: 'boho-canvas-tote',
    price: 799, images: [], category: 'Canvas',
    colors: ['#d2b48c', '#228B22', '#e91e8c'], rating: 4.5, reviewCount: 33,
    stock: 18, createdAt: new Date().toISOString(),
  },
  {
    _id: '6', name: 'Party Glitter Clutch', slug: 'party-glitter-clutch',
    price: 1299, originalPrice: 1699, images: [], category: 'Party & Evening',
    colors: ['#c9a84c', '#e91e8c', '#9b59b6'], rating: 4.8, reviewCount: 56,
    stock: 9, isOnSale: true, discountPercent: 24, createdAt: new Date().toISOString(),
  },
  {
    _id: '7', name: 'Minimalist Crossbody', slug: 'minimalist-crossbody',
    price: 1099, images: [], category: 'Mini Crossbody',
    colors: ['#1a1a2e', '#f5f5f0', '#6b7280'], rating: 4.7, reviewCount: 71,
    stock: 15, isFeatured: true, createdAt: new Date().toISOString(),
  },
  {
    _id: '8', name: 'Floral Summer Bag', slug: 'floral-summer-bag',
    price: 899, originalPrice: 1199, images: [], category: 'Canvas',
    colors: ['#e91e8c', '#f5f5f0', '#228B22'], rating: 4.4, reviewCount: 28,
    stock: 22, isOnSale: true, discountPercent: 25, createdAt: new Date().toISOString(),
  },
  {
    _id: '9', name: 'Luxe Chain Mini', slug: 'luxe-chain-mini',
    price: 1799, images: [], category: 'Chain Strap',
    colors: ['#c9a84c', '#e91e8c'], rating: 4.9, reviewCount: 45,
    stock: 6, isFeatured: true, createdAt: new Date().toISOString(),
  },
  {
    _id: '10', name: 'Classic Leather Flap', slug: 'classic-leather-flap',
    price: 2499, originalPrice: 2999, images: [], category: 'Leather',
    colors: ['#8B4513', '#1a1a2e'], rating: 4.8, reviewCount: 38,
    stock: 4, isOnSale: true, discountPercent: 17, createdAt: new Date().toISOString(),
  },
  {
    _id: '11', name: 'Neon Evening Clutch', slug: 'neon-evening-clutch',
    price: 999, images: [], category: 'Party & Evening',
    colors: ['#e91e8c', '#9b59b6', '#c9a84c'], rating: 4.6, reviewCount: 19,
    stock: 11, createdAt: new Date().toISOString(),
  },
  {
    _id: '12', name: 'Woven Rattan Bag', slug: 'woven-rattan-bag',
    price: 1399, images: [], category: 'Canvas',
    colors: ['#d2b48c', '#8B4513'], rating: 4.5, reviewCount: 24,
    stock: 8, createdAt: new Date().toISOString(),
  },
]

const ITEMS_PER_PAGE = 12

export default function ShopClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // ── State ──────────────────────────────────
  const [products] = useState<Product[]>(MOCK_PRODUCTS)
  const [isLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // ── Read from URL ──────────────────────────
  const sortFromUrl = searchParams.get('sort') || 'newest'
  const categoryFromUrl = searchParams.get('category') || ''
  const searchFromUrl = searchParams.get('search') || ''
  const filterFromUrl = searchParams.get('filter') || ''

  const [sort, setSort] = useState(sortFromUrl)
  const [searchQuery, setSearchQuery] = useState(searchFromUrl)
  const [filters, setFilters] = useState<FilterState>({
    categories: categoryFromUrl ? [categoryFromUrl.replace(/-/g, ' ')] : [],
    priceMin: null,
    priceMax: null,
    colors: [],
    onSaleOnly: filterFromUrl === 'flash-sale',
    inStockOnly: false,
  })

  // ── Sync URL on filter/sort change ────────
  const updateUrl = useCallback((newSort: string, newFilters: FilterState, newSearch: string) => {
    const params = new URLSearchParams()
    if (newSort && newSort !== 'newest') params.set('sort', newSort)
    if (newFilters.categories.length === 1) {
      params.set('category', newFilters.categories[0].toLowerCase().replace(/\s+/g, '-'))
    }
    if (newFilters.onSaleOnly) params.set('filter', 'flash-sale')
    if (newSearch) params.set('search', newSearch)
    const query = params.toString()
    router.replace(`/shop${query ? `?${query}` : ''}`, { scroll: false })
  }, [router])

  // ── Filter & Sort Products ─────────────────
  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      )
    }

    // Categories
    if (filters.categories.length > 0) {
      result = result.filter((p) =>
        filters.categories.some(
          (c) => c.toLowerCase() === p.category.toLowerCase()
        )
      )
    }

    // Price
    if (filters.priceMin !== null) {
      result = result.filter((p) => p.price >= filters.priceMin!)
    }
    if (filters.priceMax !== null) {
      result = result.filter((p) => p.price <= filters.priceMax!)
    }

    // Colors
    if (filters.colors.length > 0) {
      result = result.filter((p) =>
        p.colors?.some((c) => filters.colors.includes(c))
      )
    }

    // Sale only
    if (filters.onSaleOnly) {
      result = result.filter((p) => p.isOnSale)
    }

    // In stock
    if (filters.inStockOnly) {
      result = result.filter((p) => p.stock > 0)
    }

    // Sort
    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'popular':
        result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
        break
      default:
        result.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    }

    return result
  }, [products, searchQuery, filters, sort])

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setCurrentPage(1)
    updateUrl(sort, newFilters, searchQuery)
  }

  const handleSortChange = (newSort: string) => {
    setSort(newSort)
    setIsSortOpen(false)
    setCurrentPage(1)
    updateUrl(newSort, filters, searchQuery)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    updateUrl(sort, filters, searchQuery)
  }

  const clearAllFilters = () => {
    const empty: FilterState = {
      categories: [],
      priceMin: null,
      priceMax: null,
      colors: [],
      onSaleOnly: false,
      inStockOnly: false,
    }
    setFilters(empty)
    setSearchQuery('')
    setSort('newest')
    setCurrentPage(1)
    router.replace('/shop', { scroll: false })
  }

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.priceMin !== null ||
    filters.priceMax !== null ||
    filters.colors.length > 0 ||
    filters.onSaleOnly ||
    filters.inStockOnly ||
    searchQuery.trim() !== ''

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label || 'Sort'

  return (
    <div className="shop-page mobile-nav-spacing">
      {/* ── Shop Hero ──────────────────────── */}
      <div className="shop-hero">
        <div className="container-bagbliss">
          <div className="shop-hero-content">
            <div className="section-badge">
              <Tag size={12} />
              Our Collection
            </div>
            <h1 className="shop-hero-title">
              Find Your Perfect <span className="text-gradient">Bag</span>
            </h1>
            <p className="shop-hero-subtitle">
              {filteredProducts.length} styles available · Fast delivery across Bangladesh
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="shop-search-form">
            <Search size={18} className="shop-search-icon" />
            <input
              type="text"
              placeholder="Search bags, colors, styles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="shop-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setCurrentPage(1) }}
                className="shop-search-clear"
              >
                <X size={16} />
              </button>
            )}
            <button type="submit" className="shop-search-btn">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* ── Category Pills ────────────────── */}
      <div className="shop-category-bar">
        <div className="container-bagbliss">
          <div className="shop-category-pills">
            {CATEGORIES.map((cat) => {
              const isActive =
                cat === 'All'
                  ? filters.categories.length === 0
                  : filters.categories.includes(cat)
              return (
                <button
                  key={cat}
                  onClick={() => {
                    const newCats =
                      cat === 'All'
                        ? []
                        : isActive
                          ? filters.categories.filter((c) => c !== cat)
                          : [cat]
                    handleFilterChange({ ...filters, categories: newCats })
                  }}
                  className={`shop-category-pill ${isActive ? 'shop-category-pill-active' : ''}`}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="container-bagbliss">
        {/* ── Toolbar ───────────────────────── */}
        <div className="shop-toolbar">
          <div className="shop-toolbar-left">
            {/* Filter toggle (mobile) */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="shop-filter-toggle"
            >
              <SlidersHorizontal size={16} />
              Filters
              {hasActiveFilters && (
                <span className="shop-filter-badge">
                  {[
                    filters.categories.length,
                    filters.colors.length,
                    filters.priceMin !== null ? 1 : 0,
                    filters.priceMax !== null ? 1 : 0,
                    filters.onSaleOnly ? 1 : 0,
                    filters.inStockOnly ? 1 : 0,
                  ].reduce((a, b) => a + b, 0)}
                </span>
              )}
            </button>

            <p className="shop-results-count">
              <strong>{filteredProducts.length}</strong> products found
            </p>
          </div>

          <div className="shop-toolbar-right">
            {/* Sort */}
            <div className="shop-sort-wrapper">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="shop-sort-btn"
              >
                <ArrowUpDown size={15} />
                {currentSortLabel}
                <ChevronDown size={14} className={isSortOpen ? 'rotate-180' : ''} />
              </button>
              {isSortOpen && (
                <>
                  <div className="shop-sort-backdrop" onClick={() => setIsSortOpen(false)} />
                  <div className="shop-sort-dropdown">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleSortChange(opt.value)}
                        className={`shop-sort-option ${sort === opt.value ? 'shop-sort-option-active' : ''}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* View Mode */}
            <div className="shop-view-toggle">
              <button
                onClick={() => setViewMode('grid')}
                className={`shop-view-btn ${viewMode === 'grid' ? 'shop-view-btn-active' : ''}`}
                aria-label="Grid view"
              >
                <Grid2X2 size={17} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`shop-view-btn ${viewMode === 'list' ? 'shop-view-btn-active' : ''}`}
                aria-label="List view"
              >
                <LayoutList size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Active Filters ─────────────────── */}
        {hasActiveFilters && (
          <ShopActiveFilters
            filters={filters}
            searchQuery={searchQuery}
            onRemoveCategory={(cat) =>
              handleFilterChange({ ...filters, categories: filters.categories.filter((c) => c !== cat) })
            }
            onRemoveColor={(color) =>
              handleFilterChange({ ...filters, colors: filters.colors.filter((c) => c !== color) })
            }
            onRemovePrice={() =>
              handleFilterChange({ ...filters, priceMin: null, priceMax: null })
            }
            onRemoveSale={() => handleFilterChange({ ...filters, onSaleOnly: false })}
            onRemoveStock={() => handleFilterChange({ ...filters, inStockOnly: false })}
            onRemoveSearch={() => { setSearchQuery(''); updateUrl(sort, filters, '') }}
            onClearAll={clearAllFilters}
          />
        )}

        {/* ── Layout ────────────────────────── */}
        <div className="shop-layout">
          {/* Sidebar (desktop) */}
          <aside className="shop-sidebar">
            <ShopFilters
              filters={filters}
              onChange={handleFilterChange}
              totalCount={filteredProducts.length}
            />
          </aside>

          {/* Products */}
          <main className="shop-main">
            {isLoading ? (
              <div className={viewMode === 'grid' ? 'products-grid' : 'shop-list'}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="skeleton product-skeleton-card" style={{ height: '360px', borderRadius: '1.25rem' }} />
                ))}
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="shop-empty">
                <div className="shop-empty-icon">
                  <ShoppingBag size={40} strokeWidth={1.5} />
                </div>
                <h3 className="shop-empty-title">No bags found</h3>
                <p className="shop-empty-subtitle">
                  Try adjusting your filters or search query.
                </p>
                <button onClick={clearAllFilters} className="btn-primary">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' ? 'products-grid' : 'shop-list'}>
                  {paginatedProducts.map((product, idx) => (
                    <ShopProductCard
                      key={product._id}
                      product={product}
                      viewMode={viewMode}
                      index={idx}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="shop-pagination">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="shop-page-btn"
                    >
                      Previous
                    </button>
                    <div className="shop-page-numbers">
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1
                        if (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`shop-page-number ${currentPage === page ? 'shop-page-number-active' : ''}`}
                            >
                              {page}
                            </button>
                          )
                        } else if (Math.abs(page - currentPage) === 2) {
                          return <span key={page} className="shop-page-ellipsis">…</span>
                        }
                        return null
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="shop-page-btn"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ──────────── */}
      {isSidebarOpen && (
        <>
          <div
            className="shop-drawer-backdrop"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="shop-filter-drawer">
            <div className="shop-drawer-header">
              <h3 className="shop-drawer-title">
                <SlidersHorizontal size={18} />
                Filters
              </h3>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="shop-drawer-close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="shop-drawer-body">
              <ShopFilters
                filters={filters}
                onChange={(f) => { handleFilterChange(f); setIsSidebarOpen(false) }}
                totalCount={filteredProducts.length}
              />
            </div>
            <div className="shop-drawer-footer">
              <button onClick={clearAllFilters} className="btn-secondary" style={{ flex: 1 }}>
                Clear All
              </button>
              <button onClick={() => setIsSidebarOpen(false)} className="btn-primary" style={{ flex: 1 }}>
                Show {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}