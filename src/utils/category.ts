const CATEGORY_LABELS: Record<string, string> = {
  'mini-crossbody': 'Mini Crossbody',
  'chain-strap': 'Chain Strap',
  leather: 'Leather',
  canvas: 'Canvas',
  party: 'Party & Evening',
}

export function categoryLabel(slug: string): string {
  return (
    CATEGORY_LABELS[slug] ??
    slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  )
}