'use client'

import { X } from 'lucide-react'
import type { FilterState } from './ShopClient'
import { COLOR_PALETTE } from './colorPalette'

interface Props {
  filters: FilterState
  searchQuery: string
  onRemoveCategory: (cat: string) => void
  onRemoveColor: (color: string) => void
  onRemovePrice: () => void
  onRemoveSale: () => void
  onRemoveStock: () => void
  onRemoveSearch: () => void
  onClearAll: () => void
}

// ✅ FIX: local COLOR_NAMES lookup removed — it was a third independent
// copy of the swatch palette (ShopFilters had one, ShopClient's matching
// logic effectively had one too). Now derived from the single shared
// COLOR_PALETTE in ./colorPalette.ts, so a new color added there
// automatically shows up here too instead of falling back to raw hex.
const COLOR_NAMES: Record<string, string> = Object.fromEntries(
  COLOR_PALETTE.map(({ hex, name }) => [hex, name])
)

export default function ShopActiveFilters({
  filters,
  searchQuery,
  onRemoveCategory,
  onRemoveColor,
  onRemovePrice,
  onRemoveSale,
  onRemoveStock,
  onRemoveSearch,
  onClearAll,
}: Props) {
  const hasPriceFilter = filters.priceMin !== null || filters.priceMax !== null

  return (
    <div className="shop-active-filters">
      <span className="shop-active-filters-label">Active:</span>
      <div className="shop-active-filter-pills">

        {searchQuery.trim() && (
          <button
            type="button"
            onClick={onRemoveSearch}
            className="shop-active-pill"
            suppressHydrationWarning
          >
            {`Search: "${searchQuery}"`}
            <X size={13} />
          </button>
        )}

        {filters.categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onRemoveCategory(cat)}
            className="shop-active-pill"
            suppressHydrationWarning
          >
            {cat}
            <X size={13} />
          </button>
        ))}

        {hasPriceFilter && (
          <button
            type="button"
            onClick={onRemovePrice}
            className="shop-active-pill"
            suppressHydrationWarning
          >
            {filters.priceMin !== null ? `৳${filters.priceMin}` : ''}
            {filters.priceMin !== null && filters.priceMax !== null ? ' – ' : ''}
            {filters.priceMax !== null ? `৳${filters.priceMax}` : ''}
            <X size={13} />
          </button>
        )}

        {filters.colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onRemoveColor(color)}
            className="shop-active-pill"
            suppressHydrationWarning
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: color,
                border: '1px solid rgba(0,0,0,0.1)',
                display: 'inline-block',
              }}
            />
            {COLOR_NAMES[color] || color}
            <X size={13} />
          </button>
        ))}

        {filters.onSaleOnly && (
          <button
            type="button"
            onClick={onRemoveSale}
            className="shop-active-pill shop-active-pill-sale"
            suppressHydrationWarning
          >
            On Sale
            <X size={13} />
          </button>
        )}

        {filters.inStockOnly && (
          <button
            type="button"
            onClick={onRemoveStock}
            className="shop-active-pill"
            suppressHydrationWarning
          >
            In Stock
            <X size={13} />
          </button>
        )}

        <button
          type="button"
          onClick={onClearAll}
          className="shop-clear-all-btn"
          suppressHydrationWarning
        >
          Clear All
        </button>

      </div>
    </div>
  )
}