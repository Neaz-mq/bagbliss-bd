'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  SlidersHorizontal, X, ChevronDown,
  Grid2X2, LayoutList, Search, ShoppingBag, ArrowUpDown, Tag,
} from 'lucide-react'
import ShopFilters from './ShopFilters'
import ShopActiveFilters from './ShopActiveFilters'
import ShopProductCard from './ShopProductCard'
import { getColorFamily } from './colorPalette'

// ── Types ─────────────────────────────────────────────────────────────────
export interface Product {
  _id:             string
  name:            string
  slug:            string
  price:           number
  originalPrice?:  number
  images:          string[]
  category:        string
  colors?:         any[]
  rating?:         number
  reviewCount?:    number
  stock:           number
  isFeatured?:     boolean
  isOnSale?:       boolean
  discountPercent?: number
  tags?:           string[]
  createdAt:       string
}

export interface FilterState {
  categories:  string[]
  priceMin:    number | null
  priceMax:    number | null
  colors:      string[]
  onSaleOnly:  boolean
  inStockOnly: boolean
}

interface ApiResponse {
  products: any[]
  total:    number
  pages:    number
  page:     number
}

// ── Constants ─────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First'        },
  { value: 'price_asc',  label: 'Price: Low to High'  },
  { value: 'price_desc', label: 'Price: High to Low'  },
  { value: 'popular',    label: 'Most Popular'         },
  { value: 'rating',     label: 'Top Rated'            },
]

const CATEGORIES = ['All', 'Mini Crossbody', 'Chain Strap', 'Leather', 'Canvas', 'Party & Evening']

const ITEMS_PER_PAGE = 12

// ── Helper: slugify a category label the same way pushUrl() does ──────────
function slugifyCategory(label: string): string {
  return label
    .toLowerCase()
    .replace(/&/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
}

// ── Helper: normalize DB product → UI Product ─────────────────────────────
function normalizeProduct(p: any): Product {
  const normalizedCategory = (p.category || '')
    .split('-')
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  const discountPercent =
    p.discountPercent ??
    (p.originalPrice && p.price
      ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
      : undefined)

  return {
    _id:            String(p._id),
    name:           p.name,
    slug:           p.slug,
    price:          p.price,
    originalPrice:  p.originalPrice,
    images:         p.images || [],
    category:       normalizedCategory,
    colors:         p.colors || [],
    rating:         p.rating,
    reviewCount:    p.reviewCount,
    stock:          p.totalStock ?? p.stock ?? 0,
    isFeatured:     p.isFeatured ?? false,
    isOnSale:       p.isFlashSale ?? p.isOnSale ?? false,
    discountPercent,
    tags:           p.tags || [],
    createdAt:      p.createdAt,
  }
}

// ── Color matching helper ──────────────────────────────────────────────────
function extractHex(c: unknown): string {
  if (c && typeof c === 'object') {
    return (c as { hex?: unknown }).hex as string ?? ''
  }
  return c as string
}

function normalizeColorToken(c: unknown): string {
  return String(extractHex(c) ?? '').trim().toLowerCase()
}

function productMatchesColors(product: Product, selectedColors: string[]): boolean {
  if (selectedColors.length === 0) return true
  if (!product.colors || product.colors.length === 0) return false

  const productFamilies = new Set(
    product.colors
      .filter((c) => c != null)
      .map((c) => getColorFamily(normalizeColorToken(c)))
      .filter((f): f is string => f !== null)
  )

  return selectedColors.some((c) => {
    const family = getColorFamily(normalizeColorToken(c))
    return family !== null && productFamilies.has(family)
  })
}

// ── Stock matching helper ───────────────────────────────────────────────────
// ✅ NEW: mirrors productMatchesColors() pattern — simple, explicit, and easy
// to reason about. A product is "in stock" if its total stock count is > 0.
function productMatchesStock(product: Product, inStockOnly: boolean): boolean {
  if (!inStockOnly) return true
  return product.stock > 0
}

// ── Build API query string ─────────────────────────────────────────────────
function buildApiUrl(
  page: number,
  sort: string,
  searchQuery: string,
  filters: FilterState,
): string {
  const params = new URLSearchParams()
  params.set('page',  String(page))
  params.set('limit', String(ITEMS_PER_PAGE))

  if (sort)               params.set('sort',      sort)
  if (searchQuery.trim()) params.set('search',    searchQuery.trim())

  if (filters.categories.length === 1) {
    params.set('category', slugifyCategory(filters.categories[0]))
  }

  if (filters.onSaleOnly)  params.set('flashSale', 'true')
  if (filters.inStockOnly) params.set('inStock',   'true') // ✅ NEW — passed through if/when API supports it

  if (filters.priceMin !== null) params.set('priceMin', String(filters.priceMin))
  if (filters.priceMax !== null) params.set('priceMax', String(filters.priceMax))

  // ⚠️ NOTE: intentionally NOT sending `colors` to the API — see
  // productMatchesColors() comment above. Same caution applies to
  // `inStock`: if the API route doesn't understand it yet, the client-side
  // filter below (productMatchesStock) still makes it work correctly.

  return `/api/products?${params.toString()}`
}

export default function ShopClient() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  // ── State ──────────────────────────────────────────────────────────────
  const [products,      setProducts]      = useState<Product[]>([])
  const [totalCount,    setTotalCount]    = useState(0)
  const [totalPages,    setTotalPages]    = useState(0)
  const [isLoading,     setIsLoading]     = useState(true)
  const [error,         setError]         = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [viewMode,      setViewMode]      = useState<'grid' | 'list'>('grid')
  const [isSortOpen,    setIsSortOpen]    = useState(false)
  const [currentPage,   setCurrentPage]   = useState(1)

  const [sort,        setSort]        = useState('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [localSearch,  setLocalSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [onSaleOnly,  setOnSaleOnly]  = useState(false)
  const [inStockOnly, setInStockOnly] = useState(false) // ✅ NEW
  const [priceMin,    setPriceMin]    = useState<number | null>(null)
  const [priceMax,    setPriceMax]    = useState<number | null>(null)

  const filters = useMemo<FilterState>(() => ({
    categories:  selectedCategories,
    priceMin,
    priceMax,
    colors:      selectedColors,
    onSaleOnly,
    inStockOnly, // ✅ FIX: was hardcoded to false, so the checkbox always snapped back
  }), [selectedCategories, priceMin, priceMax, selectedColors, onSaleOnly, inStockOnly])

  // ── On mount: wipe any stale query params left over from before a
  // refresh, so the address bar always matches the clean local state above.
  useEffect(() => {
    if (searchParams.toString()) {
      router.replace('/shop', { scroll: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Fetch ──────────────────────────────────────────────────────────────
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    abortRef.current?.abort()
    const controller  = new AbortController()
    abortRef.current  = controller

    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const url = buildApiUrl(currentPage, sort, searchQuery, filters)
        const res = await fetch(url, { signal: controller.signal })

        if (!res.ok) throw new Error(`Server error: ${res.status}`)

        const data: ApiResponse = await res.json()
        let normalized = data.products.map(normalizeProduct)
        let total = data.total
        let pages = data.pages

        // ✅ Client-side safety net for colors (unchanged)
        if (filters.colors.length > 0) {
          normalized = normalized.filter((p) => productMatchesColors(p, filters.colors))
          total = normalized.length
          pages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE))
        }

        // ✅ NEW: client-side safety net for "In Stock Only". Same reasoning
        // as colors — if /api/products doesn't (yet) honor `inStock=true`,
        // this filters the already-fetched page client-side so the
        // checkbox visibly works immediately, no backend changes required.
        if (filters.inStockOnly) {
          normalized = normalized.filter((p) => productMatchesStock(p, true))
          total = normalized.length
          pages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE))
        }

        setProducts(normalized)
        setTotalCount(total)
        setTotalPages(pages)
      } catch (err: any) {
        if (err.name === 'AbortError') return
        console.error('Fetch error:', err)
        setError(err.message || 'Failed to load products')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
    return () => controller.abort()
  }, [currentPage, sort, searchQuery, filters])

  // ── URL writer ─────────────────────────────────────────────────────────
  const syncUrl = useCallback(
    (newSort: string, newFilters: FilterState, newSearch: string) => {
      const params = new URLSearchParams()
      if (newSort && newSort !== 'newest') params.set('sort', newSort)
      if (newFilters.categories.length === 1) {
        params.set('category', slugifyCategory(newFilters.categories[0]))
      }
      if (newFilters.colors.length > 0) params.set('colors', newFilters.colors.join(','))
      if (newFilters.onSaleOnly)  params.set('filter', 'flash-sale')
      if (newFilters.inStockOnly) params.set('stock', 'in-stock') // ✅ NEW
      if (newSearch.trim())       params.set('search', newSearch.trim())
      const query = params.toString()
      router.replace(`/shop${query ? `?${query}` : ''}`, { scroll: false })
    },
    [router]
  )

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleFilterChange = (newFilters: FilterState) => {
    setSelectedCategories(newFilters.categories)
    setPriceMin(newFilters.priceMin)
    setPriceMax(newFilters.priceMax)
    setSelectedColors(newFilters.colors)
    setOnSaleOnly(newFilters.onSaleOnly)
    setInStockOnly(newFilters.inStockOnly) // ✅ FIX: was never persisted before
    syncUrl(sort, newFilters, searchQuery)
    setCurrentPage(1)
  }

  const handleSortChange = (newSort: string) => {
    setIsSortOpen(false)
    setSort(newSort)
    syncUrl(newSort, filters, searchQuery)
    setCurrentPage(1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(localSearch)
    syncUrl(sort, filters, localSearch)
    setCurrentPage(1)
  }

  const handleSearchClear = () => {
    setLocalSearch('')
    setSearchQuery('')
    syncUrl(sort, filters, '')
    setCurrentPage(1)
  }

  const clearAllFilters = () => {
    setLocalSearch('')
    setSearchQuery('')
    setSelectedCategories([])
    setSelectedColors([])
    setOnSaleOnly(false)
    setInStockOnly(false) // ✅ NEW
    setPriceMin(null)
    setPriceMax(null)
    setSort('newest')
    router.replace('/shop', { scroll: false })
    setCurrentPage(1)
  }

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.priceMin    !== null   ||
    filters.priceMax    !== null   ||
    filters.colors.length > 0     ||
    filters.onSaleOnly             ||
    filters.inStockOnly            ||
    searchQuery.trim() !== ''

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label || 'Sort'

  return (
    <div className="shop-page mobile-nav-spacing">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div
        className="shop-hero"
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #16151f 0%, #2c2118 55%, #6b3f28 100%)',
          padding: '4rem 1.5rem 3.5rem',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: '760px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.375rem 1rem',
              background: 'rgba(202, 134, 93, 0.16)',
              border: '1px solid rgba(202, 134, 93, 0.4)',
              borderRadius: '9999px',
              color: '#EBC29F',
              fontFamily: 'var(--font-body)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}
          >
            <Tag size={12} />
            Our Collection
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.08,
              margin: '0 0 0.75rem',
              letterSpacing: '-0.01em',
            }}
          >
            Find your{' '}
            <span style={{ color: '#F3B98B', fontStyle: 'italic' }}>perfect</span> bag
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              color: 'rgba(255, 255, 255, 0.68)',
              margin: 0,
            }}
          >
            {isLoading
              ? 'Counting the bags…'
              : `${totalCount} styles in stock · delivered across Bangladesh in 2–4 days`}
          </p>
        </div>
      </div>

      {/* ── Floating Search — centered, overlaps the hero/category seam ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 5,
          marginTop: '-2.5rem',
          padding: '0 1.5rem',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <form
          onSubmit={handleSearch}
          className="shop-search-form"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'white',
            borderRadius: '9999px',
            padding: '0.5rem 0.5rem 0.5rem 1.25rem',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.28)',
            width: '100%',
            maxWidth: '600px',
          }}
          suppressHydrationWarning
        >
          <Search size={18} className="shop-search-icon" />
          <input
            type="text"
            placeholder="Search bags, colors, styles..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="shop-search-input"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.95rem' }}
            suppressHydrationWarning
          />
          {localSearch && (
            <button
              type="button"
              onClick={handleSearchClear}
              className="shop-search-clear"
              suppressHydrationWarning
            >
              <X size={16} />
            </button>
          )}
          <button
            type="submit"
            className="shop-search-btn"
            style={{
              padding: '0.625rem 1.5rem',
              background: 'var(--color-accent, #CA865D)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.875rem',
              border: 'none',
              borderRadius: '9999px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            suppressHydrationWarning
          >
            Search
          </button>
        </form>
      </div>

      {/* ── Category Pills — fixed height, so nothing overlaps on scroll ── */}
      <div className="shop-category-bar" style={{ marginTop: '1.75rem' }}>
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
                  type="button"
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
                  suppressHydrationWarning
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="container-bagbliss">

        {/* ── Toolbar ───────────────────────────────────────────────── */}
        <div className="shop-toolbar">
          <div className="shop-toolbar-left">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="shop-filter-toggle"
              suppressHydrationWarning
            >
              <SlidersHorizontal size={16} />
              Filters
              {hasActiveFilters && (
                <span className="shop-filter-badge">
                  {[
                    filters.categories.length,
                    filters.colors.length,
                    filters.priceMin    !== null ? 1 : 0,
                    filters.priceMax    !== null ? 1 : 0,
                    filters.onSaleOnly  ? 1 : 0,
                    filters.inStockOnly ? 1 : 0,
                  ].reduce((a, b) => a + b, 0)}
                </span>
              )}
            </button>
            <p className="shop-results-count">
              {isLoading
                ? <span>Loading...</span>
                : <><strong>{totalCount}</strong> products found</>}
            </p>
          </div>

          <div className="shop-toolbar-right">
            {/* Sort */}
            <div className="shop-sort-wrapper">
              <button
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="shop-sort-btn"
                suppressHydrationWarning
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
                        type="button"
                        onClick={() => handleSortChange(opt.value)}
                        className={`shop-sort-option ${sort === opt.value ? 'shop-sort-option-active' : ''}`}
                        suppressHydrationWarning
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* View mode */}
            <div className="shop-view-toggle">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`shop-view-btn ${viewMode === 'grid' ? 'shop-view-btn-active' : ''}`}
                aria-label="Grid view"
                suppressHydrationWarning
              >
                <Grid2X2 size={17} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`shop-view-btn ${viewMode === 'list' ? 'shop-view-btn-active' : ''}`}
                aria-label="List view"
                suppressHydrationWarning
              >
                <LayoutList size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Active Filters ────────────────────────────────────────── */}
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
            onRemovePrice={()  => handleFilterChange({ ...filters, priceMin: null, priceMax: null })}
            onRemoveSale={()   => handleFilterChange({ ...filters, onSaleOnly: false })}
            onRemoveStock={()  => handleFilterChange({ ...filters, inStockOnly: false })}
            onRemoveSearch={()  => { setLocalSearch(''); handleSearchClear() }}
            onClearAll={clearAllFilters}
          />
        )}

        {/* ── Layout ────────────────────────────────────────────────── */}
        <div className="shop-layout">
          <aside className="shop-sidebar">
            <ShopFilters
              filters={filters}
              onChange={handleFilterChange}
              totalCount={totalCount}
            />
          </aside>

          <main className="shop-main">

            {/* Error */}
            {error && !isLoading && (
              <div className="shop-empty">
                <div className="shop-empty-icon"><ShoppingBag size={40} strokeWidth={1.5} /></div>
                <h3 className="shop-empty-title">Couldn't load the shop</h3>
                <p className="shop-empty-subtitle">{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="btn-primary"
                  suppressHydrationWarning
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Skeletons */}
            {isLoading && (
              <div className={viewMode === 'grid' ? 'products-grid' : 'shop-list'}>
                {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
                  <div
                    key={i}
                    className="skeleton product-skeleton-card"
                    style={{ height: '360px', borderRadius: '1.25rem' }}
                  />
                ))}
              </div>
            )}

            {/* Empty */}
            {!isLoading && !error && products.length === 0 && (
              <div className="shop-empty">
                <div className="shop-empty-icon"><ShoppingBag size={40} strokeWidth={1.5} /></div>
                <h3 className="shop-empty-title">No bags match those filters</h3>
                <p className="shop-empty-subtitle">Clear a filter or try a different search term.</p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="btn-primary"
                  suppressHydrationWarning
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Products */}
            {!isLoading && !error && products.length > 0 && (
              <>
                <div className={viewMode === 'grid' ? 'products-grid' : 'shop-list'}>
                  {products.map((product, idx) => (
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
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="shop-page-btn"
                      suppressHydrationWarning
                    >
                      Previous
                    </button>
                    <div className="shop-page-numbers">
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1
                        if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
                          return (
                            <button
                              key={page}
                              type="button"
                              onClick={() => setCurrentPage(page)}
                              className={`shop-page-number ${currentPage === page ? 'shop-page-number-active' : ''}`}
                              suppressHydrationWarning
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
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="shop-page-btn"
                      suppressHydrationWarning
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

      {/* ── Mobile Filter Drawer ──────────────────────────────────────── */}
      {isSidebarOpen && (
        <>
          <div className="shop-drawer-backdrop" onClick={() => setIsSidebarOpen(false)} />
          <div className="shop-filter-drawer">
            <div className="shop-drawer-header">
              <h3 className="shop-drawer-title">
                <SlidersHorizontal size={18} /> Filters
              </h3>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="shop-drawer-close"
                suppressHydrationWarning
              >
                <X size={20} />
              </button>
            </div>
            <div className="shop-drawer-body">
              <ShopFilters
                filters={filters}
                onChange={(f) => { handleFilterChange(f); setIsSidebarOpen(false) }}
                totalCount={totalCount}
              />
            </div>
            <div className="shop-drawer-footer">
              <button
                type="button"
                onClick={clearAllFilters}
                className="btn-secondary"
                style={{ flex: 1 }}
                suppressHydrationWarning
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="btn-primary"
                style={{ flex: 1 }}
                suppressHydrationWarning
              >
                Show {totalCount} Results
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}