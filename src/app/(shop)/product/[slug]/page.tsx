'use client'

import { useState } from 'react'
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

// ── Mock product data (will be replaced with real API) ──
const MOCK_PRODUCT: IProduct = {
  _id: 'p1',
  name: 'Pearl Mini Crossbody Bag',
  slug: 'pearl-mini-crossbody',
  description: `This stunning Pearl Mini Crossbody Bag is the perfect accessory for the modern Bangladeshi woman. Crafted with premium PU leather and featuring an elegant pearl-finish exterior, this bag combines luxury with everyday functionality.

The adjustable strap allows you to wear it across the body or on the shoulder, making it versatile for any occasion — from college to casual outings to evening events.`,
  shortDescription:
    'Premium pearl-finish mini crossbody bag — perfect for daily use.',
  price: 1200,
  discountPrice: 950,
  category: 'Mini Crossbody',
  tags: ['trending', 'new', 'premium'],
  colors: [
    { name: 'Pearl White', hex: '#f8f4f0', images: [], stock: 15 },
    { name: 'Blush Pink', hex: '#E91E8C', images: [], stock: 10 },
    { name: 'Midnight Navy', hex: '#1A1A2E', images: [], stock: 8 },
    { name: 'Champagne Gold', hex: '#C9A84C', images: [], stock: 5 },
  ],
  mainImage: { url: '', cloudinaryId: '', alt: 'Pearl Mini Crossbody' },
  status: 'active',
  isFeatured: true,
  isFlashSale: false,
  soldCount: 234,
  stock: 38,
  weight: 0.3,
  dimensions: { length: 22, width: 8, height: 16 },
  ratings: { average: 4.8, count: 127 },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const MOCK_REVIEWS = [
  {
    id: '1',
    name: 'Fatima Rahman',
    avatar: 'F',
    rating: 5,
    comment:
      'Absolutely love this bag! The quality is amazing for the price. Got so many compliments at college.',
    date: '2 days ago',
    verified: true,
  },
  {
    id: '2',
    name: 'Nadia Islam',
    avatar: 'N',
    rating: 5,
    comment:
      'Super cute and spacious enough for my essentials. Fast delivery too! Will order again.',
    date: '1 week ago',
    verified: true,
  },
  {
    id: '3',
    name: 'Sadia Akter',
    avatar: 'S',
    rating: 4,
    comment:
      'Beautiful bag, exactly as shown. The strap is adjustable which is great. Slightly smaller than expected.',
    date: '2 weeks ago',
    verified: true,
  },
]

const RELATED_PRODUCTS: IProduct[] = [
  {
    _id: 'r1',
    name: 'Gold Chain Sling',
    slug: 'gold-chain-sling',
    description: 'Luxury gold chain strap',
    shortDescription: 'Statement piece',
    price: 1800,
    discountPrice: 1400,
    category: 'Chain Strap',
    tags: ['luxury'],
    colors: [{ name: 'Champagne', hex: '#C9A84C', images: [], stock: 12 }],
    mainImage: { url: '', cloudinaryId: '', alt: 'Gold Chain Sling' },
    status: 'active',
    isFeatured: true,
    isFlashSale: true,
    soldCount: 189,
    stock: 19,
    ratings: { average: 4.9, count: 89 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'r2',
    name: 'Candy Quilted Bag',
    slug: 'candy-quilted-bag',
    description: 'Cute quilted mini bag',
    shortDescription: 'Sweet and stylish',
    price: 950,
    discountPrice: 750,
    category: 'Mini Crossbody',
    tags: ['cute'],
    colors: [{ name: 'Hot Pink', hex: '#E91E8C', images: [], stock: 20 }],
    mainImage: { url: '', cloudinaryId: '', alt: 'Candy Quilted Bag' },
    status: 'active',
    isFeatured: true,
    isFlashSale: false,
    soldCount: 312,
    stock: 53,
    ratings: { average: 4.7, count: 203 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'r3',
    name: 'Minimalist Crossbody',
    slug: 'minimalist-crossbody',
    description: 'Clean lines pure style',
    shortDescription: 'Less is more',
    price: 1100,
    category: 'Mini Crossbody',
    tags: ['minimal'],
    colors: [{ name: 'White', hex: '#ffffff', images: [], stock: 20 }],
    mainImage: { url: '', cloudinaryId: '', alt: 'Minimalist Crossbody' },
    status: 'active',
    isFeatured: true,
    isFlashSale: false,
    soldCount: 445,
    stock: 55,
    ratings: { average: 4.9, count: 312 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'r4',
    name: 'Party Glitter Clutch',
    slug: 'party-glitter-clutch',
    description: 'Glamorous glitter evening bag',
    shortDescription: 'Shine at every party',
    price: 1500,
    discountPrice: 1200,
    category: 'Party & Evening',
    tags: ['party'],
    colors: [{ name: 'Gold Glitter', hex: '#C9A84C', images: [], stock: 12 }],
    mainImage: { url: '', cloudinaryId: '', alt: 'Party Glitter Clutch' },
    status: 'active',
    isFeatured: true,
    isFlashSale: true,
    soldCount: 267,
    stock: 30,
    ratings: { average: 4.8, count: 156 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

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

// ── Main Product Detail Page ──────────────────
export default function ProductDetailPage() {
  const product = MOCK_PRODUCT
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<
    'description' | 'reviews' | 'shipping'
  >('description')
  const [isAdding, setIsAdding] = useState(false)

  const { addItem, openCart } = useCartStore()
  const { toggleItem, isWishlisted } = useWishlistStore()
  const wishlisted = isWishlisted(product._id)

  const currentPrice = product.discountPrice || product.price
  const discountPercent = product.discountPrice
    ? Math.round(
        ((product.price - product.discountPrice) / product.price) * 100
      )
    : 0

  // All images for gallery
  const allImages = [product.mainImage, ...(selectedColor.images || [])].filter(
    Boolean
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
    toast.success(
      wishlisted ? 'Removed from wishlist' : '❤️ Added to wishlist!'
    )
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
            <Link href="/" className="breadcrumb-link">
              Home
            </Link>
            <ChevronRight size={14} />
            <Link href="/shop" className="breadcrumb-link">
              Shop
            </Link>
            <ChevronRight size={14} />
            <Link
              href={`/shop?category=${product.category}`}
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
              {product.stock <= 10 && (
                <span className="detail-stock-badge">
                  Only {product.stock} left!
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
              <span className="detail-rating-avg">
                {product.ratings.average}
              </span>
              <span className="detail-rating-count">
                ({product.ratings.count} reviews)
              </span>
              <span className="detail-sold">· {product.soldCount} sold</span>
            </div>

            {/* Price */}
            <div className="product-detail-price">
              <span className="detail-price-current">
                {CURRENCY_SYMBOL}
                {currentPrice.toLocaleString()}
              </span>
              {product.discountPrice && (
                <>
                  <span className="detail-price-original">
                    {CURRENCY_SYMBOL}
                    {product.price.toLocaleString()}
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
                <span className="detail-option-value">
                  {selectedColor.name}
                </span>
              </div>
              <div className="detail-colors">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
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
                {selectedColor.stock} in stock for {selectedColor.name}
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
                disabled={isAdding || product.stock === 0}
                className="detail-add-cart-btn"
              >
                {isAdding ? (
                  <>
                    <span
                      className="spinner"
                      style={{ width: '18px', height: '18px' }}
                    />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingBag size={20} />
                    Add to Cart
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
            <button className="detail-buy-now-btn">
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
            {product.dimensions && (
              <div className="detail-meta">
                <div className="detail-meta-item">
                  <span className="detail-meta-label">Dimensions:</span>
                  <span className="detail-meta-value">
                    {product.dimensions.length} × {product.dimensions.width} ×{' '}
                    {product.dimensions.height} cm
                  </span>
                </div>
                {product.weight && (
                  <div className="detail-meta-item">
                    <span className="detail-meta-label">Weight:</span>
                    <span className="detail-meta-value">
                      {product.weight} kg
                    </span>
                  </div>
                )}
                <div className="detail-meta-item">
                  <span className="detail-meta-label">Category:</span>
                  <span className="detail-meta-value">{product.category}</span>
                </div>
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
              </div>
            )}
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
                    <li>✅ 1x Mini Crossbody Bag</li>
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
                {/* Rating Summary */}
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
                  <div className="reviews-bars">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="reviews-bar-row">
                        <span className="reviews-bar-label">{star}★</span>
                        <div className="reviews-bar">
                          <div
                            className="reviews-bar-fill"
                            style={{
                              width:
                                star === 5
                                  ? '70%'
                                  : star === 4
                                    ? '20%'
                                    : star === 3
                                      ? '7%'
                                      : '3%',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review Cards */}
                <div className="reviews-list">
                  {MOCK_REVIEWS.map((review) => (
                    <div key={review.id} className="review-card">
                      <div className="review-header">
                        <div className="review-avatar">{review.avatar}</div>
                        <div className="review-meta">
                          <div className="review-name-row">
                            <span className="review-name">{review.name}</span>
                            {review.verified && (
                              <span className="review-verified">
                                <Check size={11} /> Verified
                              </span>
                            )}
                          </div>
                          <StarRating rating={review.rating} size={13} />
                        </div>
                        <span className="review-date">{review.date}</span>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  ))}
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
            {RELATED_PRODUCTS.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
