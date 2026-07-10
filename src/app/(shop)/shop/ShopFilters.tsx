'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { FilterState } from './ShopClient'
import { COLOR_PALETTE } from './colorPalette'

interface Props {
  filters: FilterState
  onChange: (f: FilterState) => void
  totalCount: number
}

const CATEGORIES = [
  { label: 'Mini Crossbody', count: 3 },
  { label: 'Chain Strap', count: 2 },
  { label: 'Leather', count: 2 },
  { label: 'Canvas', count: 3 },
  { label: 'Party & Evening', count: 2 },
]

const PRICE_RANGES = [
  { label: 'Under ৳999', min: null, max: 999 },
  { label: '৳999 – ৳1,499', min: 999, max: 1499 },
  { label: '৳1,500 – ৳1,999', min: 1500, max: 1999 },
  { label: '৳2,000 & Above', min: 2000, max: null },
]

// ✅ FIX: local COLORS array removed — it was a second, independent copy of
// the swatch palette. ShopClient's matching logic and this render list now
// both import from the same COLOR_PALETTE (see ./colorPalette.ts), so they
// can never drift out of sync.

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className="shop-filter-section">
      {/* ✅ FIX: type="button" + suppressHydrationWarning
          Browser extensions inject fdprocessedid into buttons,
          causing SSR/client mismatch on Chrome & Firefox */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="shop-filter-section-header"
        suppressHydrationWarning
      >
        <span className="shop-filter-section-title">{title}</span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isOpen && <div className="shop-filter-section-body">{children}</div>}
    </div>
  )
}

export default function ShopFilters({ filters, onChange }: Props) {
  // ✅ FIX: single-select category, matching ShopClient's URL/API which
  // only supports one active category (`?category=slug`). Previously this
  // pushed into an array, so selecting a 2nd category made
  // `categories.length !== 1`, which silently dropped the filter from the
  // URL entirely — showing all products with no checkbox/pill highlighted.
  const toggleCategory = (cat: string) => {
    const has = filters.categories.includes(cat)
    onChange({
      ...filters,
      categories: has ? [] : [cat],
    })
  }

  const setPriceRange = (min: number | null, max: number | null) => {
    const alreadySet = filters.priceMin === min && filters.priceMax === max
    onChange({
      ...filters,
      priceMin: alreadySet ? null : min,
      priceMax: alreadySet ? null : max,
    })
  }

  const toggleColor = (hex: string) => {
    const has = filters.colors.includes(hex)
    onChange({
      ...filters,
      colors: has ? filters.colors.filter((c) => c !== hex) : [...filters.colors, hex],
    })
  }

  return (
    <div className="shop-filters">

      {/* Category */}
      <FilterSection title="Category">
        <div className="shop-filter-list">
          {CATEGORIES.map(({ label, count }) => (
            <label key={label} className="shop-filter-checkbox">
              <input
                type="checkbox"
                checked={filters.categories.includes(label)}
                onChange={() => toggleCategory(label)}
                className="shop-filter-check-input"
                suppressHydrationWarning
              />
              <span className="shop-filter-check-label">{label}</span>
              <span className="shop-filter-count">{count}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="shop-filter-list">
          {PRICE_RANGES.map(({ label, min, max }) => (
            <label key={label} className="shop-filter-checkbox">
              <input
                type="radio"
                name="price"
                checked={filters.priceMin === min && filters.priceMax === max}
                onChange={() => setPriceRange(min, max)}
                className="shop-filter-check-input"
                suppressHydrationWarning
              />
              <span className="shop-filter-check-label">{label}</span>
            </label>
          ))}
        </div>

        {/* Custom Range */}
        <div className="shop-price-inputs">
          <input
            type="number"
            placeholder="Min ৳"
            value={filters.priceMin ?? ''}
            onChange={(e) =>
              onChange({ ...filters, priceMin: e.target.value ? Number(e.target.value) : null })
            }
            className="shop-price-input"
            suppressHydrationWarning
          />
          <span className="shop-price-dash">—</span>
          <input
            type="number"
            placeholder="Max ৳"
            value={filters.priceMax ?? ''}
            onChange={(e) =>
              onChange({ ...filters, priceMax: e.target.value ? Number(e.target.value) : null })
            }
            className="shop-price-input"
            suppressHydrationWarning
          />
        </div>
      </FilterSection>

      {/* Colors */}
      <FilterSection title="Color">
        <div className="shop-color-grid">
          {COLOR_PALETTE.map(({ hex, name }) => (
            <button
              key={hex}
              type="button"
              onClick={() => toggleColor(hex)}
              title={name}
              className={`shop-color-btn ${filters.colors.includes(hex) ? 'shop-color-btn-active' : ''}`}
              style={{ backgroundColor: hex }}
              aria-label={name}
              suppressHydrationWarning
            />
          ))}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability" defaultOpen={false}>
        <div className="shop-filter-list">
          <label className="shop-filter-checkbox">
            <input
              type="checkbox"
              checked={filters.onSaleOnly}
              onChange={() => onChange({ ...filters, onSaleOnly: !filters.onSaleOnly })}
              className="shop-filter-check-input"
              suppressHydrationWarning
            />
            <span className="shop-filter-check-label">On Sale Only</span>
          </label>
          <label className="shop-filter-checkbox">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={() => onChange({ ...filters, inStockOnly: !filters.inStockOnly })}
              className="shop-filter-check-input"
              suppressHydrationWarning
            />
            <span className="shop-filter-check-label">In Stock Only</span>
          </label>
        </div>
      </FilterSection>

    </div>
  )
}