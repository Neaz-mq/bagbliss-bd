// ============================================
// BAGBLISS BD — App Constants
// ============================================

export const APP_NAME = 'BagBliss BD'
export const APP_URL = 'https://bagbliss.com.bd'
export const APP_DESCRIPTION =
  "Bangladesh's most trendy mini crossbody bag store"

// ── Currency ─────────────────────────────────
export const CURRENCY = 'BDT'
export const CURRENCY_SYMBOL = '৳'

// ── Pagination ───────────────────────────────
export const DEFAULT_PAGE_SIZE = 12
export const ADMIN_PAGE_SIZE = 20

// ── Shipping ─────────────────────────────────
export const SHIPPING_INSIDE_DHAKA = 60
export const SHIPPING_OUTSIDE_DHAKA = 120
export const FREE_SHIPPING_THRESHOLD = 1500

// ── Order Status Labels ──────────────────────
export const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
} as const

// ── Order Status Colors ──────────────────────
export const ORDER_STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  processing: '#8b5cf6',
  shipped: '#06b6d4',
  delivered: '#22c55e',
  cancelled: '#ef4444',
  refunded: '#6b7280',
} as const

// ── Categories ───────────────────────────────
export const BAG_CATEGORIES = [
  { label: 'All Bags', value: 'all', emoji: '👜' },
  { label: 'Mini Crossbody', value: 'mini-crossbody', emoji: '👛' },
  { label: 'Chain Strap', value: 'chain-strap', emoji: '✨' },
  { label: 'Leather', value: 'leather', emoji: '💼' },
  { label: 'Canvas', value: 'canvas', emoji: '🎒' },
  { label: 'Party & Evening', value: 'party', emoji: '💖' },
] as const

// ── Sort Options ─────────────────────────────
export const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Top Rated', value: 'rating' },
] as const

// ── BD Cities ────────────────────────────────
export const BD_CITIES = [
  'Dhaka',
  'Chittagong',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Mymensingh',
  'Rangpur',
  'Comilla',
  'Narayanganj',
  'Gazipur',
] as const

// ── Routes ───────────────────────────────────
export const ROUTES = {
  home: '/',
  shop: '/shop',
  product: (slug: string) => `/product/${slug}`,
  cart: '/cart',
  checkout: '/checkout',
  orderSuccess: (id: string) => `/order-success/${id}`,
  trackOrder: '/track-order',
  wishlist: '/wishlist',
  login: '/login',
  register: '/register',
  account: '/account',
  orders: '/account/orders',
  profile: '/account/profile',
  admin: '/admin',
} as const
