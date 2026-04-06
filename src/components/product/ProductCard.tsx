'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react'
import { useWishlistStore } from '@/store/wishlistStore'
import { useCartStore } from '@/store/cartStore'
import { IProduct } from '@/types'
import { CURRENCY_SYMBOL } from '@/constants'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: IProduct
  index?: number
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)
  const { toggleItem, isWishlisted } = useWishlistStore()
  const { addItem, openCart } = useCartStore()
  const wishlisted = isWishlisted(product._id)

  const discountPercent =
    product.discountPrice && product.price
      ? Math.round(
          ((product.price - product.discountPrice) / product.price) * 100
        )
      : 0

  const currentPrice = product.discountPrice || product.price
  const hasDiscount = !!product.discountPrice

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    toggleItem(product._id)
    toast.success(
      wishlisted ? 'Removed from wishlist' : '❤️ Added to wishlist!'
    )
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      product,
      quantity: 1,
      selectedColor: product.colors[0]?.name || 'Default',
      price: currentPrice,
    })
    toast.success('🛍️ Added to cart!')
    openCart()
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (product.colors[0]?.images?.length > 0) {
      setImageIndex(1)
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setImageIndex(0)
  }

  return (
    <div
      className="product-card"
      style={{ animationDelay: `${index * 0.1}s` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={`/product/${product.slug}`} className="product-card-link">
        {/* Image Container */}
        <div className="product-image-container">
          {/* Badges */}
          <div className="product-badges">
            {product.isFlashSale && (
              <span className="product-badge product-badge-sale">🔥 Sale</span>
            )}
            {product.isFeatured && !product.isFlashSale && (
              <span className="product-badge product-badge-featured">
                ✨ Featured
              </span>
            )}
            {hasDiscount && (
              <span className="product-badge product-badge-discount">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Product Image / Placeholder */}
          <div className="product-image-wrapper">
            {product.mainImage?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={
                  imageIndex === 1 && product.colors[0]?.images?.[0]?.url
                    ? product.colors[0].images[0].url
                    : product.mainImage.url
                }
                alt={product.name}
                className="product-image"
                style={{
                  transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                  transition: 'transform 0.5s ease',
                }}
              />
            ) : (
              /* Placeholder when no image */
              <div className="product-image-placeholder">
                <div className="product-placeholder-bag">
                  <svg viewBox="0 0 120 140" fill="none">
                    <path
                      d="M40 50 Q40 25 60 25 Q80 25 80 50"
                      stroke="#C9A84C"
                      strokeWidth="5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <rect
                      x="15"
                      y="50"
                      width="90"
                      height="72"
                      rx="12"
                      fill="#E91E8C"
                    />
                    <path
                      d="M15 75 Q60 58 105 75 L105 50 Q60 35 15 50 Z"
                      fill="#b5156d"
                    />
                    <circle cx="60" cy="77" r="7" fill="#C9A84C" />
                    <circle cx="60" cy="77" r="3.5" fill="#1A1A2E" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Hover Actions */}
          <div
            className={`product-actions ${isHovered ? 'product-actions-visible' : ''}`}
          >
            <button
              onClick={handleWishlist}
              className={`product-action-btn ${wishlisted ? 'product-action-btn-active' : ''}`}
              aria-label="Add to wishlist"
            >
              <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleAddToCart}
              className="product-action-btn product-action-cart"
              aria-label="Add to cart"
            >
              <ShoppingBag size={18} />
            </button>
            <button
              className="product-action-btn"
              aria-label="Quick view"
              onClick={(e) => {
                e.preventDefault()
                window.location.href = `/product/${product.slug}`
              }}
            >
              <Eye size={18} />
            </button>
          </div>

          {/* Stock warning */}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="product-stock-warning">
              Only {product.stock} left!
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-info">
          {/* Category */}
          <span className="product-category">{product.category}</span>

          {/* Name */}
          <h3 className="product-name">{product.name}</h3>

          {/* Rating */}
          {product.ratings.count > 0 && (
            <div className="product-rating">
              <div className="product-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={12}
                    fill={
                      star <= Math.round(product.ratings.average)
                        ? '#C9A84C'
                        : 'none'
                    }
                    color={
                      star <= Math.round(product.ratings.average)
                        ? '#C9A84C'
                        : '#d1d5db'
                    }
                  />
                ))}
              </div>
              <span className="product-rating-count">
                ({product.ratings.count})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="product-price-row">
            <span className="product-price-current">
              {CURRENCY_SYMBOL}
              {currentPrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="product-price-original">
                {CURRENCY_SYMBOL}
                {product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Color dots */}
          {product.colors.length > 0 && (
            <div className="product-colors">
              {product.colors.slice(0, 5).map((color) => (
                <div
                  key={color.name}
                  className="product-color-dot"
                  style={{ background: color.hex }}
                  title={color.name}
                />
              ))}
              {product.colors.length > 5 && (
                <span className="product-colors-more">
                  +{product.colors.length - 5}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Add to Cart — Bottom */}
      <button onClick={handleAddToCart} className="product-add-to-cart">
        <ShoppingBag size={16} />
        Add to Cart
      </button>
    </div>
  )
}
