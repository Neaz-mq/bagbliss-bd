'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Heart,
  ShoppingBag,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Share2,
  ChevronRight,
  Minus,
  Plus,
  Check,
  Zap,
} from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { CURRENCY_SYMBOL } from '@/constants'
import { IProduct } from '@/types'
import ProductGallery from '@/components/product/ProductGallery'
import ProductCard from '@/components/product/ProductCard'
import toast from 'react-hot-toast'

// ── Normalized image type ─────────────────────
type NormalizedImage = {
  url: string
  cloudinaryId: string
  alt: string
}

// ── Extended IProduct with images array ───────
type IProductWithImages = IProduct & {
  images?: NormalizedImage[]
}

// ── Star Rating Display ───────────────────────
function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          fill={star <= Math.round(rating) ? '#C9A84C' : 'none'}
          color={star <= Math.round(rating) ? '#C9A84C' : '#d1d5db'}
        />
      ))}
    </div>
  )
}

// ── Helper: normalize a single raw image object ──────────────────────────
function normalizeImage(img: unknown, altText: string): NormalizedImage {
  if (typeof img === 'string') {
    return { url: img, cloudinaryId: '', alt: altText }
  }
  if (img && typeof img === 'object') {
    const o = img as Record<string, unknown>
    return {
      url: (o.url as string) ?? (o.secure_url as string) ?? '',
      cloudinaryId: (o.cloudinaryId as string) ?? (o.public_id as string) ?? '',
      alt: altText,
    }
  }
  return { url: '', cloudinaryId: '', alt: altText }
}

// ── Normalize raw DB document → IProduct shape ────────────────────────────
function normalizeProduct(raw: Record<string, unknown>): IProductWithImages {
  const hasDiscount =
    raw.originalPrice &&
    typeof raw.originalPrice === 'number' &&
    typeof raw.price === 'number' &&
    raw.originalPrice > (raw.price as number)

  const rawColors = (raw.colors as Record<string, unknown>[]) ?? []
  const colors = rawColors.map((c) => ({
    name: (c.name as string) ?? 'Default',
    hex: (c.hex as string) ?? (c.colorHex as string) ?? '#E91E8C',
    images: ((c.images as Record<string, unknown>[]) ?? [])
      .map((img) => normalizeImage(img, (c.name as string) ?? 'Product'))
      .filter((img) => !!img.url),
    stock: typeof c.stock === 'number' ? c.stock : 0,
  }))

  const rawImages = (raw.images as unknown[]) ?? []
  const normalizedImages = rawImages
    .map((img) => normalizeImage(img, (raw.name as string) ?? 'Product'))
    .filter((img) => !!img.url)

  const mainImage: NormalizedImage =
    normalizedImages.length > 0
      ? normalizedImages[0]
      : { url: '', cloudinaryId: '', alt: (raw.name as string) ?? 'Product' }

  return {
    _id: String(raw._id ?? ''),
    name: (raw.name as string) ?? '',
    slug: (raw.slug as string) ?? '',
    description: (raw.description as string) ?? '',
    shortDescription: (raw.shortDescription as string) ?? '',

    price: hasDiscount ? (raw.originalPrice as number) : (raw.price as number),
    discountPrice: hasDiscount ? (raw.price as number) : undefined,

    category: (raw.category as string) ?? '',
    tags: (raw.tags as string[]) ?? [],
    colors,
    mainImage,
    images: normalizedImages,

    status: raw.isActive ? 'active' : 'inactive',
    isFeatured: (raw.isFeatured as boolean) ?? false,
    isFlashSale: (raw.isFlashSale as boolean) ?? false,
    flashSalePrice: raw.flashSalePrice as number | undefined,
    soldCount: (raw.soldCount as number) ?? 0,
    stock: (raw.totalStock as number) ?? 0,
    weight: raw.weight as number | undefined,
    dimensions: raw.dimensions as IProduct['dimensions'] | undefined,
    ratings: {
      average: (raw.rating as number) ?? 0,
      count: (raw.reviewCount as number) ?? 0,
    },
    createdAt: (raw.createdAt as string) ?? new Date().toISOString(),
    updatedAt: (raw.updatedAt as string) ?? new Date().toISOString(),
  }
}

// ── দামের একক উৎস ────────────────────────────
function getPricing(product: IProductWithImages) {
  const listPrice = product.price

  const currentPrice =
    product.isFlashSale && product.flashSalePrice
      ? product.flashSalePrice
      : (product.discountPrice ?? product.price)

  const discountPercent =
    listPrice > currentPrice
      ? Math.round(((listPrice - currentPrice) / listPrice) * 100)
      : 0

  return { listPrice, currentPrice, discountPercent }
}

// ── Main Product Detail Page ──────────────────
export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()

  const [product, setProduct] = useState<IProductWithImages | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<IProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [selectedColor, setSelectedColor] = useState<IProduct['colors'][0] | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'shipping'>('description')
  const [isAdding, setIsAdding] = useState(false)

  const { addItem, openCart } = useCartStore()
  const { toggleItem, isWishlisted } = useWishlistStore()

  // ── Fetch product by slug ─────────────────
  useEffect(() => {
    if (!slug) return

    const controller = new AbortController()

    window.scrollTo({ top: 0, behavior: 'instant' })
    setLoading(true)
    setNotFound(false)

    async function load() {
      try {
        const res = await fetch(`/api/products/slug/${slug}`, {
          signal: controller.signal,
        })

        if (res.status === 404) {
          setNotFound(true)
          return
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const json = await res.json()
        const raw = json.data ?? json
        if (!raw?.slug) throw new Error('Empty payload')

        const normalized = normalizeProduct(raw)
        setProduct(normalized)
        setSelectedColor(normalized.colors[0] ?? null)

        // Related — ব্যর্থ হলেও মূল পেজ নষ্ট হবে না
        try {
          const relRes = await fetch(
            `/api/products?category=${encodeURIComponent(normalized.category)}&limit=5`,
            { signal: controller.signal }
          )
          const relJson = await relRes.json()
          const list = relJson.data ?? relJson.products ?? []
          setRelatedProducts(
            list
              .filter((p: Record<string, unknown>) => p.slug !== slug)
              .slice(0, 4)
              .map(normalizeProduct)
          )
        } catch {
          /* non-critical */
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        console.error('[product page]', err)
        setNotFound(true)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [slug])

  // ── Loading state ─────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
        <span
          className="spinner"
          style={{ width: 44, height: 44, borderTopColor: '#E91E8C' }}
        />
        <p style={{ color: '#888', fontSize: 14 }}>Loading product…</p>
      </div>
    )
  }

  // ── Not found state ───────────────────────
  if (notFound || !product || !selectedColor) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Product not found</h2>
        <p style={{ color: '#888', marginBottom: 24 }}>
          This product may have been removed or the link is incorrect.
        </p>
        <Link href="/shop" className="btn-primary">
          ← Back to Shop
        </Link>
      </div>
    )
  }

  const wishlisted = isWishlisted(product._id)
  const { listPrice, currentPrice, discountPercent } = getPricing(product)

  const productLevelImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.mainImage]

  const colorImages = (selectedColor.images ?? []).filter((img) => !!img.url)

  const productImageUrls = new Set(productLevelImages.map((i) => i.url))
  const uniqueColorImages = colorImages.filter(
    (img) => !productImageUrls.has(img.url)
  )

  const allImages = [...productLevelImages, ...uniqueColorImages].filter(
    (img) => !!img?.url
  )

  const handleAddToCart = async () => {
    setIsAdding(true)
    addItem({
      product,
      quantity,
      selectedColor: selectedColor.name,
      price: currentPrice,
    })
    toast.success('🛍️ Added to cart!')
    openCart()
    setTimeout(() => setIsAdding(false), 600)
  }

  const handleWishlist = () => {
    toggleItem(product._id)
    toast.success(wishlisted ? 'Removed from wishlist' : '❤️ Added to wishlist!')
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        text: product.shortDescription,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied!')
    }
  }

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <div className="breadcrumb-bar">
        <div className="container-bagbliss">
          <nav className="breadcrumb">
            <Link href="/" className="breadcrumb-link">Home</Link>
            <ChevronRight size={14} />
            <Link href="/shop" className="breadcrumb-link">Shop</Link>
            <ChevronRight size={14} />
            <Link
              href={`/shop?category=${encodeURIComponent(product.category)}`}
              className="breadcrumb-link"
            >
              {product.category}
            </Link>
            <ChevronRight size={14} />
            <span className="breadcrumb-current">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-bagbliss">
        {/* ── Main Product Section ──────────── */}
        <div className="product-detail-grid">
          {/* Left — Gallery */}
          <div className="product-detail-gallery">
            <ProductGallery images={allImages} productName={product.name} />
          </div>

          {/* Right — Product Info */}
          <div className="product-detail-info">
            {/* Badges */}
            <div className="product-detail-badges">
              {product.isFeatured && (
                <span className="badge badge-accent">✨ Featured</span>
              )}
              {product.isFlashSale && (
                <span className="badge badge-gold">⚡ Flash Sale</span>
              )}
              {product.stock <= 10 && product.stock > 0 && (
                <span className="detail-stock-badge">
                  Only {product.stock} left!
                </span>
              )}
              {product.stock === 0 && (
                <span className="detail-stock-badge" style={{ background: '#ef4444' }}>
                  Out of Stock
                </span>
              )}
            </div>

            {/* Category */}
            <p className="product-detail-category">{product.category}</p>

            {/* Name */}
            <h1 className="product-detail-name">{product.name}</h1>

            {/* Rating Row */}
            <div className="product-detail-rating">
              <StarRating rating={product.ratings.average} />
              <span className="detail-rating-avg">{product.ratings.average}</span>
              <span className="detail-rating-count">
                ({product.ratings.count} reviews)
              </span>
              <span className="detail-sold">· {product.soldCount} sold</span>
            </div>

            {/* Price — single source of truth */}
            <div className="product-detail-price">
              <span className="detail-price-current">
                {CURRENCY_SYMBOL}{currentPrice.toLocaleString()}
              </span>
              {discountPercent > 0 && (
                <>
                  <span className="detail-price-original">
                    {CURRENCY_SYMBOL}{listPrice.toLocaleString()}
                  </span>
                  <span className="detail-price-discount">
                    Save {discountPercent}%
                  </span>
                </>
              )}
            </div>

            {/* Short Description */}
            <p className="product-detail-short-desc">
              {product.shortDescription}
            </p>

            <div className="product-detail-divider" />

            {/* Color Selector */}
            <div className="detail-option-group">
              <div className="detail-option-header">
                <span className="detail-option-label">Color:</span>
                <span className="detail-option-value">{selectedColor.name}</span>
              </div>
              <div className="detail-colors">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => {
                      setSelectedColor(color)
                      setQuantity(1)
                    }}
                    className={`detail-color-btn ${
                      selectedColor.name === color.name
                        ? 'detail-color-btn-active'
                        : ''
                    }`}
                    title={color.name}
                    aria-label={color.name}
                  >
                    <span
                      className="detail-color-swatch"
                      style={{
                        background: color.hex,
                        border:
                          color.hex === '#ffffff' || color.hex === '#f8f4f0'
                            ? '1px solid #e5e7eb'
                            : 'none',
                      }}
                    />
                    {selectedColor.name === color.name && (
                      <Check
                        size={12}
                        className="detail-color-check"
                        color={
                          color.hex === '#ffffff' || color.hex === '#f8f4f0'
                            ? '#1A1A2E'
                            : 'white'
                        }
                      />
                    )}
                  </button>
                ))}
              </div>
              <p className="detail-color-stock">
                {selectedColor.stock > 0
                  ? `${selectedColor.stock} in stock for ${selectedColor.name}`
                  : `${selectedColor.name} is out of stock`}
              </p>
            </div>

            {/* Quantity */}
            <div className="detail-option-group">
              <span className="detail-option-label">Quantity:</span>
              <div className="detail-quantity">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="detail-qty-btn"
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="detail-qty-value">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(selectedColor.stock, q + 1))
                  }
                  className="detail-qty-btn"
                  disabled={quantity >= selectedColor.stock}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="product-detail-divider" />

            {/* Action Buttons */}
            <div className="detail-actions">
              <button
                onClick={handleAddToCart}
                disabled={isAdding || product.stock === 0 || selectedColor.stock === 0}
                className="detail-add-cart-btn"
              >
                {isAdding ? (
                  <>
                    <span className="spinner" style={{ width: '18px', height: '18px' }} />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingBag size={20} />
                    {selectedColor.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </>
                )}
              </button>

              <button
                onClick={handleWishlist}
                className={`detail-wishlist-btn ${wishlisted ? 'detail-wishlist-active' : ''}`}
                aria-label="Add to wishlist"
              >
                <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>

              <button
                onClick={handleShare}
                className="detail-share-btn"
                aria-label="Share product"
              >
                <Share2 size={20} />
              </button>
            </div>

            {/* Buy Now */}
            <button
              onClick={handleAddToCart}
              className="detail-buy-now-btn"
              disabled={isAdding || product.stock === 0 || selectedColor.stock === 0}
            >
              <Zap size={18} />
              Buy Now — Instant Checkout
            </button>

            {/* Trust Badges */}
            <div className="detail-trust">
              <div className="detail-trust-item">
                <Truck size={18} />
                <div>
                  <p className="detail-trust-title">Fast Delivery</p>
                  <p className="detail-trust-sub">2-4 days across BD</p>
                </div>
              </div>
              <div className="detail-trust-item">
                <Shield size={18} />
                <div>
                  <p className="detail-trust-title">Secure Payment</p>
                  <p className="detail-trust-sub">100% safe checkout</p>
                </div>
              </div>
              <div className="detail-trust-item">
                <RotateCcw size={18} />
                <div>
                  <p className="detail-trust-title">Easy Returns</p>
                  <p className="detail-trust-sub">7-day return policy</p>
                </div>
              </div>
            </div>

            {/* Product Meta */}
            <div className="detail-meta">
              {product.dimensions && (
                <div className="detail-meta-item">
                  <span className="detail-meta-label">Dimensions:</span>
                  <span className="detail-meta-value">
                    {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
                  </span>
                </div>
              )}
              {product.weight && (
                <div className="detail-meta-item">
                  <span className="detail-meta-label">Weight:</span>
                  <span className="detail-meta-value">{product.weight} kg</span>
                </div>
              )}
              <div className="detail-meta-item">
                <span className="detail-meta-label">Category:</span>
                <span className="detail-meta-value">{product.category}</span>
              </div>
              {product.tags.length > 0 && (
                <div className="detail-meta-item">
                  <span className="detail-meta-label">Tags:</span>
                  <div className="detail-tags">
                    {product.tags.map((tag) => (
                      <span key={tag} className="detail-tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs Section ──────────────────── */}
        <div className="detail-tabs-section">
          <div className="detail-tabs">
            {(['description', 'reviews', 'shipping'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`detail-tab ${activeTab === tab ? 'detail-tab-active' : ''}`}
              >
                {tab === 'description' && 'Description'}
                {tab === 'reviews' && `Reviews (${product.ratings.count})`}
                {tab === 'shipping' && 'Shipping & Returns'}
              </button>
            ))}
          </div>

          <div className="detail-tab-content">
            {/* Description */}
            {activeTab === 'description' && (
              <div className="detail-description">
                <div className="detail-description-text">
                  {product.description.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
                <div className="detail-features">
                  <h4>What&apos;s Included:</h4>
                  <ul>
                    <li>✅ 1x {product.name}</li>
                    <li>✅ Adjustable shoulder strap</li>
                    <li>✅ Dust bag for storage</li>
                    <li>✅ BagBliss authenticity card</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Reviews */}
            {activeTab === 'reviews' && (
              <div className="detail-reviews">
                <div className="reviews-summary">
                  <div className="reviews-avg">
                    <span className="reviews-avg-number">
                      {product.ratings.average}
                    </span>
                    <StarRating rating={product.ratings.average} size={24} />
                    <span className="reviews-avg-count">
                      {product.ratings.count} reviews
                    </span>
                  </div>
                </div>

                <div className="reviews-empty" style={{ textAlign: 'center', padding: '48px 20px' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                  <p style={{ fontWeight: 600, marginBottom: 6 }}>
                    Customer reviews coming soon
                  </p>
                  <p style={{ color: '#888', fontSize: 14 }}>
                    Be the first to review this product after your purchase.
                  </p>
                </div>
              </div>
            )}

            {/* Shipping */}
            {activeTab === 'shipping' && (
              <div className="detail-shipping">
                <div className="shipping-grid">
                  <div className="shipping-card">
                    <Truck size={28} color="#E91E8C" />
                    <h4>Delivery Information</h4>
                    <ul>
                      <li>Inside Dhaka: 1-2 business days (৳60)</li>
                      <li>Outside Dhaka: 3-5 business days (৳120)</li>
                      <li>Free delivery on orders above ৳1500</li>
                      <li>Express delivery available (+৳100)</li>
                    </ul>
                  </div>
                  <div className="shipping-card">
                    <RotateCcw size={28} color="#E91E8C" />
                    <h4>Return Policy</h4>
                    <ul>
                      <li>7-day hassle-free returns</li>
                      <li>Item must be unused with tags</li>
                      <li>Original packaging required</li>
                      <li>Refund processed in 3-5 days</li>
                    </ul>
                  </div>
                  <div className="shipping-card">
                    <Shield size={28} color="#E91E8C" />
                    <h4>Quality Guarantee</h4>
                    <ul>
                      <li>100% authentic imported products</li>
                      <li>Quality checked before dispatch</li>
                      <li>Secure packaging guaranteed</li>
                      <li>Customer satisfaction priority</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Related Products ──────────────── */}
        {relatedProducts.length > 0 && (
          <div className="detail-related">
            <div className="detail-related-header">
              <h2 className="section-title" style={{ textAlign: 'left' }}>
                You Might Also Like
              </h2>
              <Link href="/shop" className="featured-view-all">
                View All
                <ChevronRight size={16} />
              </Link>
            </div>
            <div className="products-grid">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}