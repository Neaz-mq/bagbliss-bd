// ============================================
// BAGBLISS BD — TypeScript Interfaces v1.0
// ============================================

// ── User Types ──────────────────────────────

export type UserRole = 'user' | 'admin'

export interface IUser {
  _id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: UserRole
  isVerified: boolean
  addresses: IAddress[]
  wishlist: string[]
  createdAt: string
  updatedAt: string
}

export interface IAddress {
  _id?: string
  fullName: string
  phone: string
  addressLine: string
  area: string
  city: string
  isDefault: boolean
}

// ── Product Types ────────────────────────────

export type ProductStatus = 'active' | 'draft' | 'out_of_stock'

export interface IProductColor {
  name: string
  hex: string
  images: IProductImage[]
  stock: number
}

export interface IProductImage {
  url: string
  cloudinaryId: string
  alt: string
}

export interface IProductVideo {
  url: string
  cloudinaryId: string
  thumbnail: string
}

export interface IProduct {
  _id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  price: number
  discountPrice?: number
  discountPercent?: number
  category: string
  tags: string[]
  colors: IProductColor[]
  mainImage: IProductImage
  video?: IProductVideo
  status: ProductStatus
  isFeatured: boolean
  isFlashSale: boolean
  flashSaleEnd?: string
  flashSalePrice?: number
  soldCount: number
  stock: number
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  ratings: {
    average: number
    count: number
  }
  createdAt: string
  updatedAt: string
}

// ── Cart Types ───────────────────────────────

export interface ICartItem {
  _id?: string
  product: IProduct
  quantity: number
  selectedColor: string
  price: number
}

export interface ICart {
  items: ICartItem[]
  subtotal: number
  itemCount: number
}

// ── Order Types ──────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentMethod = 'sslcommerz' | 'cod'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface IOrderItem {
  product: string | IProduct
  name: string
  image: string
  quantity: number
  selectedColor: string
  price: number
}

export interface IOrderStatusHistory {
  status: OrderStatus
  timestamp: string
  note?: string
}

export interface IOrder {
  _id: string
  orderNumber: string
  user: string | IUser
  items: IOrderItem[]
  shippingAddress: IAddress
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  transactionId?: string
  status: OrderStatus
  statusHistory: IOrderStatusHistory[]
  subtotal: number
  shippingFee: number
  discount: number
  total: number
  couponCode?: string
  deliveryEstimate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// ── Review Types ─────────────────────────────

export interface IReview {
  _id: string
  product: string
  user: IUser
  rating: number
  comment: string
  images: IProductImage[]
  isVerifiedPurchase: boolean
  createdAt: string
}

// ── Coupon Types ─────────────────────────────

export type DiscountType = 'percentage' | 'fixed'

export interface ICoupon {
  _id: string
  code: string
  discountType: DiscountType
  discountValue: number
  minOrderAmount: number
  maxUses: number
  usedCount: number
  expiresAt: string
  isActive: boolean
}

// ── Chat Types ───────────────────────────────

export interface IChatMessage {
  _id: string
  sessionId: string
  sender: 'user' | 'admin'
  message: string
  timestamp: string
  isRead: boolean
}

export interface IChatSession {
  _id: string
  sessionId: string
  user?: IUser
  guestName?: string
  guestEmail?: string
  messages: IChatMessage[]
  status: 'active' | 'resolved'
  createdAt: string
}

// ── API Response Types ───────────────────────

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// ── Filter & Sort Types ──────────────────────

export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  colors?: string[]
  tags?: string[]
  inStock?: boolean
  isFlashSale?: boolean
  search?: string
}

export type SortOption =
  | 'newest'
  | 'oldest'
  | 'price_asc'
  | 'price_desc'
  | 'popular'
  | 'rating'



export interface ToastType {
  type: 'success' | 'error' | 'loading'
  message: string
}
