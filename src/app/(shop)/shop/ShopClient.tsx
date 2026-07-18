'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
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
import { getColorFamily } from './colorPalette'

// ── Types ─────────────────────────────────────────────────────────────────
export interface Product {
  _id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  colors?: any[]
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

interface ApiResponse {
  products: any[]
  total: number
  pages: number
  page: number
}

// ── Constants ─────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
]

// Exported so /new-arrivals can reuse the same category list & slugging
// instead of re-declaring it and risking drift between the two pages.
export const CATEGORIES = [
  'All',
  'Mini Crossbody',
  'Chain Strap',
  'Leather',
  'Canvas',
  'Party & Evening',
]

const ITEMS_PER_PAGE = 12

// ── Helper: slugify a category label the same way pushUrl() does ──────────
export function slugifyCategory(label: string): string {
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
    _id: String(p._id),
    name: p.name,
    slug: p.slug,
    price: p.price,
    originalPrice: p.originalPrice,
    images: p.images || [],
    category: normalizedCategory,
    colors: p.colors || [],
    rating: p.rating,
    reviewCount: p.reviewCount,
    stock: p.totalStock ?? p.stock ?? 0,
    isFeatured: p.isFeatured ?? false,
    isOnSale: p.isFlashSale ?? p.isOnSale ?? false,
    discountPercent,
    tags: p.tags || [],
    createdAt: p.createdAt,
  }
}

// ── Color matching helper ──────────────────────────────────────────────────
function extractHex(c: unknown): string {
  if (c && typeof c === 'object') {
    return ((c as { hex?: unknown }).hex as string) ?? ''
  }
  return c as string
}

function normalizeColorToken(c: unknown): string {
  return String(extractHex(c) ?? '')
    .trim()
    .toLowerCase()
}

function productMatchesColors(
  product: Product,
  selectedColors: string[]
): boolean {
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
// A product is "in stock" if its total stock count is > 0.
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
  newOnly: boolean // ✅ NEW — powers "New Arrivals"
): string {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('limit', String(ITEMS_PER_PAGE))

  if (sort) params.set('sort', sort)
  if (searchQuery.trim()) params.set('search', searchQuery.trim())

  if (filters.categories.length === 1) {
    params.set('category', slugifyCategory(filters.categories[0]))
  }

  if (filters.onSaleOnly) params.set('flashSale', 'true')
  if (filters.inStockOnly) params.set('inStock', 'true') // ✅ passed through if/when API supports it
  if (newOnly) params.set('new', 'true') // ✅ NEW — tells /api/products to only return recent products

  if (filters.priceMin !== null)
    params.set('priceMin', String(filters.priceMin))
  if (filters.priceMax !== null)
    params.set('priceMax', String(filters.priceMax))

  // ⚠️ NOTE: intentionally NOT sending `colors` to the API — see
  // productMatchesColors() comment above. Same caution applies to
  // `inStock`: if the API route doesn't understand it yet, the client-side
  // filter below (productMatchesStock) still makes it work correctly.

  return `/api/products?${params.toString()}`
}

// ✅ NEW — one component, three distinct pages. `mode` tells ShopClient which
// route it's rendering as, so /new-arrivals and /flash-sale get their own
// URL, hero copy, and default filter — instead of everything collapsing back
// onto /shop?... query params (which is what caused Shop / New Arrivals /
// Flash Sale to render identically before).
export type ShopMode = 'shop' | 'new-arrivals' | 'flash-sale'

interface ShopClientProps {
  mode?: ShopMode
}

const BASE_PATH: Record<ShopMode, string> = {
  shop: '/shop',
  'new-arrivals': '/new-arrivals',
  'flash-sale': '/flash-sale',
}

export default function ShopClient({ mode = 'shop' }: ShopClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const basePath = BASE_PATH[mode]

  // ── State ──────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const [sort, setSort] = useState('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [localSearch, setLocalSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [onSaleOnly, setOnSaleOnly] = useState(mode === 'flash-sale')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [priceMin, setPriceMin] = useState<number | null>(null)
  const [priceMax, setPriceMax] = useState<number | null>(null)
  // ✅ true whenever this instance IS the /new-arrivals page — no longer
  // dependent on a ?new=true query param that could silently get dropped.
  const [newOnly, setNewOnly] = useState(mode === 'new-arrivals')

  const filters = useMemo<FilterState>(
    () => ({
      categories: selectedCategories,
      priceMin,
      priceMax,
      colors: selectedColors,
      onSaleOnly,
      inStockOnly,
    }),
    [
      selectedCategories,
      priceMin,
      priceMax,
      selectedColors,
      onSaleOnly,
      inStockOnly,
    ]
  )

  // ── On mount: read EVERY incoming query param (from nav/footer links)
  // into state BEFORE clearing the URL. Previously only `?new=true` was
  // read here — `?filter=flash-sale` (Flash Sale nav link) and
  // `?category=...` (Footer links) were silently dropped because the URL
  // was wiped on the very next line before anything could apply them.
  // That's why Shop / New Arrivals / Flash Sale all rendered identically.
  useEffect(() => {
    // /new-arrivals and /flash-sale are dedicated routes now — they don't
    // read filter state from query params at all, so there's nothing here
    // for them to do. Running this only for 'shop' also means it can never
    // stomp on the newOnly/onSaleOnly defaults those two modes are seeded
    // with above.
    if (mode !== 'shop') return

    // Old bookmarked/shared links still using the query-param style —
    // send them to the dedicated route instead of trying to fake it on /shop.
    if (searchParams.get('new') === 'true') {
      router.replace('/new-arrivals', { scroll: false })
      return
    }
    if (searchParams.get('filter') === 'flash-sale') {
      router.replace('/flash-sale', { scroll: false })
      return
    }

    // In-stock links → /shop?stock=in-stock
    if (searchParams.get('stock') === 'in-stock') {
      setInStockOnly(true)
    }

    // Footer category links → /shop?category=leather etc.
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      const match = CATEGORIES.find(
        (c) => c !== 'All' && slugifyCategory(c) === categoryParam
      )
      if (match) setSelectedCategories([match])
    }

    // Color filter links → /shop?colors=red,blue
    const colorsParam = searchParams.get('colors')
    if (colorsParam) {
      setSelectedColors(colorsParam.split(',').filter(Boolean))
    }

    // Navbar search → /shop?search=...
    const searchParam = searchParams.get('search')
    if (searchParam) {
      setSearchQuery(searchParam)
      setLocalSearch(searchParam)
    }

    // Any other ?sort=... links into /shop (Footer now links straight to
    // /new-arrivals instead of /shop?sort=newest, but keep this generic)
    const sortParam = searchParams.get('sort')
    if (sortParam && SORT_OPTIONS.some((o) => o.value === sortParam)) {
      setSort(sortParam)
    }

    if (searchParams.toString()) {
      router.replace('/shop', { scroll: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  // ── Fetch ──────────────────────────────────────────────────────────────
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const url = buildApiUrl(currentPage, sort, searchQuery, filters, newOnly)
        const res = await fetch(url, { signal: controller.signal })

        if (!res.ok) throw new Error(`Server error: ${res.status}`)

        const data: ApiResponse = await res.json()
        let normalized = data.products.map(normalizeProduct)
        let total = data.total
        let pages = data.pages

        // Client-side safety net for colors (unchanged)
        if (filters.colors.length > 0) {
          normalized = normalized.filter((p) =>
            productMatchesColors(p, filters.colors)
          )
          total = normalized.length
          pages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE))
        }

        // Client-side safety net for "In Stock Only".
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
  }, [currentPage, sort, searchQuery, filters, newOnly]) // ✅ newOnly added

  // ── URL writer ─────────────────────────────────────────────────────────
  const syncUrl = useCallback(
    (newSort: string, newFilters: FilterState, newSearch: string) => {
      const params = new URLSearchParams()
      if (newSort && newSort !== 'newest') params.set('sort', newSort)
      if (newFilters.categories.length === 1) {
        params.set('category', slugifyCategory(newFilters.categories[0]))
      }
      if (newFilters.colors.length > 0)
        params.set('colors', newFilters.colors.join(','))
      if (newFilters.onSaleOnly && mode !== 'flash-sale')
        params.set('filter', 'flash-sale')
      if (newFilters.inStockOnly) params.set('stock', 'in-stock')
      if (newSearch.trim()) params.set('search', newSearch.trim())
      const query = params.toString()
      router.replace(`${basePath}${query ? `?${query}` : ''}`, { scroll: false })
    },
    [router, basePath]
  )

  // ── Handlers ───────────────────────────────────────────────────────────
  // ✅ NEW: once someone touches a filter/sort/search while viewing "New
  // Arrivals", drop out of that mode — they're browsing the full shop now.
  const handleFilterChange = (newFilters: FilterState) => {
    setSelectedCategories(newFilters.categories)
    setPriceMin(newFilters.priceMin)
    setPriceMax(newFilters.priceMax)
    setSelectedColors(newFilters.colors)
    // On /flash-sale, "on sale" is the whole point of the page — never let
    // the sidebar checkbox turn it off. Everywhere else, respect it normally.
    setOnSaleOnly(mode === 'flash-sale' ? true : newFilters.onSaleOnly)
    setInStockOnly(newFilters.inStockOnly)
    // Only /shop's generic filtering ever needs to "exit" new-arrivals mode —
    // /new-arrivals itself keeps showing new stock even while narrowed further.
    if (mode === 'shop') setNewOnly(false)
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
    if (mode === 'shop') setNewOnly(false)
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
    setOnSaleOnly(mode === 'flash-sale')
    setInStockOnly(false)
    setPriceMin(null)
    setPriceMax(null)
    setSort('newest')
    setNewOnly(mode === 'new-arrivals')
    router.replace(basePath, { scroll: false })
    setCurrentPage(1)
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
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div
        className="shop-hero"
        style={{
          position: 'relative',
          background:
            'linear-gradient(135deg, #16151f 0%, #2c2118 55%, #6b3f28 100%)',
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
            {newOnly ? 'Just Landed' : filters.onSaleOnly ? 'Flash Sale' : 'Our Collection'}
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
            {newOnly ? (
              <>
                Fresh in — our{' '}
                <span style={{ color: '#F3B98B', fontStyle: 'italic' }}>
                  new arrivals
                </span>
              </>
            ) : filters.onSaleOnly ? (
              <>
                Grab it before it's{' '}
                <span style={{ color: '#F3B98B', fontStyle: 'italic' }}>
                  gone
                </span>
              </>
            ) : (
              <>
                Find your{' '}
                <span style={{ color: '#F3B98B', fontStyle: 'italic' }}>
                  perfect
                </span>{' '}
                bag
              </>
            )}
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
              : newOnly
                ? `${totalCount} new styles added recently`
                : filters.onSaleOnly
                  ? `${totalCount} bags on flash sale right now`
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
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.95rem',
            }}
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
                    filters.priceMin !== null ? 1 : 0,
                    filters.priceMax !== null ? 1 : 0,
                    filters.onSaleOnly ? 1 : 0,
                    filters.inStockOnly ? 1 : 0,
                  ].reduce((a, b) => a + b, 0)}
                </span>
              )}
            </button>
            <p className="shop-results-count">
              {isLoading ? (
                <span>Loading...</span>
              ) : (
                <>
                  <strong>{totalCount}</strong> products found
                </>
              )}
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
                <ChevronDown
                  size={14}
                  className={isSortOpen ? 'rotate-180' : ''}
                />
              </button>
              {isSortOpen && (
                <>
                  <div
                    className="shop-sort-backdrop"
                    onClick={() => setIsSortOpen(false)}
                  />
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
              handleFilterChange({
                ...filters,
                categories: filters.categories.filter((c) => c !== cat),
              })
            }
            onRemoveColor={(color) =>
              handleFilterChange({
                ...filters,
                colors: filters.colors.filter((c) => c !== color),
              })
            }
            onRemovePrice={() =>
              handleFilterChange({ ...filters, priceMin: null, priceMax: null })
            }
            onRemoveSale={() =>
              handleFilterChange({ ...filters, onSaleOnly: false })
            }
            onRemoveStock={() =>
              handleFilterChange({ ...filters, inStockOnly: false })
            }
            onRemoveSearch={() => {
              setLocalSearch('')
              handleSearchClear()
            }}
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
              hideOnSaleFilter={mode === 'flash-sale'}
            />
          </aside>

          <main className="shop-main">
            {/* Error */}
            {error && !isLoading && (
              <div className="shop-empty">
                <div className="shop-empty-icon">
                  <ShoppingBag size={40} strokeWidth={1.5} />
                </div>
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
              <div
                className={viewMode === 'grid' ? 'products-grid' : 'shop-list'}
              >
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
                <div className="shop-empty-icon">
                  <ShoppingBag size={40} strokeWidth={1.5} />
                </div>
                <h3 className="shop-empty-title">
                  {newOnly
                    ? 'No new arrivals just yet'
                    : filters.onSaleOnly
                      ? 'No flash sale items match those filters'
                      : 'No bags match those filters'}
                </h3>
                <p className="shop-empty-subtitle">
                  {newOnly
                    ? 'Check back soon, or browse the full collection.'
                    : filters.onSaleOnly
                      ? 'Try loosening a filter, or browse the full collection.'
                      : 'Clear a filter or try a different search term.'}
                </p>
                <button
                  type="button"
                  onClick={
                    mode === 'shop' ? clearAllFilters : () => router.push('/shop')
                  }
                  className="btn-primary"
                  suppressHydrationWarning
                >
                  {mode !== 'shop' ? 'Browse All Bags' : 'Clear All Filters'}
                </button>
              </div>
            )}

            {/* Products */}
            {!isLoading && !error && products.length > 0 && (
              <>
                <div
                  className={
                    viewMode === 'grid' ? 'products-grid' : 'shop-list'
                  }
                >
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
                        if (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        ) {
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
                          return (
                            <span key={page} className="shop-page-ellipsis">
                              …
                            </span>
                          )
                        }
                        return null
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
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
          <div
            className="shop-drawer-backdrop"
            onClick={() => setIsSidebarOpen(false)}
          />
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
                onChange={(f) => {
                  handleFilterChange(f)
                  setIsSidebarOpen(false)
                }}
                totalCount={totalCount}
                hideOnSaleFilter={mode === 'flash-sale'}
              />
            </div>
            <div className="shop-drawer-footer">
              <button
                type="button"
                onClick={clearAllFilters}
                className="btn-secondary shop-drawer-btn-clear"
                suppressHydrationWarning
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="btn-primary shop-drawer-btn-show"
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