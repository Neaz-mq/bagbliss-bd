// ── Single source of truth for shop category labels ↔ DB category values ──
//
// These MUST match the `category` field actually stored on Product docs
// (see scripts/seed-products.ts and src/app/api/admin/categories/route.ts's
// DEFAULT_CATEGORIES). Previously ShopClient derived the DB slug from the
// label algorithmically (slugifyCategory()), which silently broke for
// "Party & Evening" — it produced "party-evening" while every seeded
// product actually has category: "party". That mismatch meant clicking the
// "Party & Evening" pill (or any link pointing at it) always returned zero
// results. Keeping an explicit label→value map here removes that whole
// class of bug and gives every page/component one place to import from.

export interface ShopCategory {
  label: string
  value: string
}

export const SHOP_CATEGORIES: ShopCategory[] = [
  { label: 'Mini Crossbody', value: 'mini-crossbody' },
  { label: 'Chain Strap', value: 'chain-strap' },
  { label: 'Leather', value: 'leather' },
  { label: 'Canvas', value: 'canvas' },
  { label: 'Party & Evening', value: 'party' },
]

export function categoryLabelToValue(label: string): string {
  return (
    SHOP_CATEGORIES.find((c) => c.label === label)?.value ??
    label
      .toLowerCase()
      .replace(/&/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\s+/g, '-')
  )
}

export function categoryValueToLabel(value: string): string | undefined {
  return SHOP_CATEGORIES.find((c) => c.value === value)?.label
}