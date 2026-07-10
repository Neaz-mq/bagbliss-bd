// colorPalette.ts
// Single source of truth for the filter color palette. Both ShopFilters
// (rendering swatches) and ShopClient (matching product colors) import
// from here, so they can never drift out of sync.

export interface PaletteColor {
  hex: string
  name: string
}

export const COLOR_PALETTE: PaletteColor[] = [
  { hex: '#e91e8c', name: 'Pink'   },
  { hex: '#1a1a2e', name: 'Navy'   },
  { hex: '#c9a84c', name: 'Gold'   },
  { hex: '#9b59b6', name: 'Purple' },
  { hex: '#f5f5f0', name: 'White'  },
  { hex: '#8B4513', name: 'Brown'  },
  { hex: '#228B22', name: 'Green'  },
  { hex: '#d2b48c', name: 'Beige'  },
]

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '').trim()
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  if (!/^[0-9a-f]{6}$/i.test(full)) return null
  const num = parseInt(full, 16)
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0, s = 0
  const d = max - min
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h *= 60
  }
  return { h, s: s * 100, l: l * 100 }
}

function hueDistance(h1: number, h2: number): number {
  const diff = Math.abs(h1 - h2)
  return Math.min(diff, 360 - diff)
}

// Weighted HSL distance. Hue is down-weighted for low-saturation colors
// (near-gray/white/black/brown) since hue is unstable/meaningless there —
// this is what correctly separates "White" from "pale Pink", and "Navy"
// from "Purple", instead of them bleeding into each other.
function hslDistance(
  a: { h: number; s: number; l: number },
  b: { h: number; s: number; l: number },
): number {
  const hueWeight = Math.min(a.s, b.s) / 100
  const hDist = hueDistance(a.h, b.h) * hueWeight
  const sDist = Math.abs(a.s - b.s)
  const lDist = Math.abs(a.l - b.l)
  return hDist * 1.0 + sDist * 0.5 + lDist * 0.8
}

// Snaps ANY arbitrary product hex (e.g. "Dusty Rose" #d4a0a0) to the
// closest family in COLOR_PALETTE. Returns null only for malformed hex.
export function getColorFamily(hex: string): string | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  const target = rgbToHsl(rgb.r, rgb.g, rgb.b)

  let bestName: string | null = null
  let bestDist = Infinity
  for (const { hex: pHex, name } of COLOR_PALETTE) {
    const pRgb = hexToRgb(pHex)!
    const dist = hslDistance(target, rgbToHsl(pRgb.r, pRgb.g, pRgb.b))
    if (dist < bestDist) {
      bestDist = dist
      bestName = name
    }
  }
  return bestName
}