'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import toast from 'react-hot-toast'
import type { Product } from './ShopClient'
import type { MouseEvent } from 'react'

interface Props {
  product: Product
  viewMode: 'grid' | 'list'
  index: number
}

const BagPlaceholder = ({ product }: { product: Product }) => (
  <div className="product-image-placeholder">
    <div className="product-placeholder-bag">
      <svg viewBox="0 0 200 200" fill="none">
        <defs>
          <linearGradient id={`grad-${product._id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e91e8c" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#c9a84c" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <ellipse cx="100" cy="185" rx="60" ry="8" fill="rgba(0,0,0,0.06)" />
        <rect x="30" y="90" width="140" height="100" rx="16" fill={`url(#grad-${product._id})`} />
      </svg>
    </div>
  </div>
)

export default function ShopProductCard({ product, viewMode, index }: Props) {
  const [isHovered, setIsHovered] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const toggleWishlistItem = useWishlistStore((s) => s.toggleItem)

  const inWishlist = useWishlistStore((s) =>
    s.items.includes(product._id)
  )

  const handleAddToCart = async (e: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (isAdding || product.stock === 0) return
    setIsAdding(true)

    addItem({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
      color: product.colors?.[0],
      quantity: 1
    })

    toast.success(`${product.name} added to cart!`)

    setTimeout(() => {
      setIsAdding(false)
      openCart()
    }, 600)
  }

  const handleWishlist = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    toggleWishlistItem(product._id)

    toast.success(
      inWishlist ? 'Removed from wishlist' : 'Added to wishlist!'
    )
  }

  const priceFormatted = `৳${product.price.toLocaleString('en-BD')}`
  const originalFormatted = product.originalPrice
    ? `৳${product.originalPrice.toLocaleString('en-BD')}`
    : null

  if (viewMode === 'list') {
    return (
      <div
        className={`shop-list-card ${isHovered ? 'hovered' : ''}`}
        style={{ animationDelay: `${index * 0.05}s` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/product/${product.slug}`} className="shop-list-image">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              width={300}
              height={300}
              className="product-image"
            />
          ) : (
            <BagPlaceholder product={product} />
          )}

          {product.isOnSale && product.discountPercent && (
            <div className="product-badge product-badge-sale">
              -{product.discountPercent}%
            </div>
          )}
        </Link>

        <div className="shop-list-info">
          <p className="product-category">{product.category}</p>

          <Link href={`/product/${product.slug}`} className="shop-list-name">
            {product.name}
          </Link>

          <div className="product-rating">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={13}
                fill={i < Math.round(product.rating || 0) ? '#c9a84c' : 'none'}
                color={i < Math.round(product.rating || 0) ? '#c9a84c' : '#ccc'}
              />
            ))}
            <span className="review-count">({product.reviewCount || 0})</span>
          </div>

          <div className="product-price-row">
            <span className="current-price">{priceFormatted}</span>
            {originalFormatted && (
              <span className="original-price">{originalFormatted}</span>
            )}
          </div>

          <div className="shop-list-actions">
            <button type="button" className="action-btn" onClick={handleWishlist}>
              <Heart
                size={18}
                fill={inWishlist ? '#e91e8c' : 'none'}
                color={inWishlist ? '#e91e8c' : 'currentColor'}
              />
            </button>

            <Link href={`/product/${product.slug}`} className="action-btn">
              <Eye size={18} />
            </Link>

            <button
              type="button"
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAdding}
            >
              <ShoppingBag size={18} className="mr-2" />
              {isAdding
                ? 'Adding...'
                : product.stock === 0
                ? 'Out of Stock'
                : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`product-card ${isHovered ? 'hovered' : ''}`}
      style={{ animationDelay: `${index * 0.05}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="product-card-image-wrapper">
        <Link href={`/product/${product.slug}`}>
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              width={400}
              height={400}
              className="product-grid-image"
            />
          ) : (
            <BagPlaceholder product={product} />
          )}
        </Link>

        <div className="grid-hover-actions">
          <button type="button" className="grid-action-btn" onClick={handleWishlist}>
            <Heart size={18} fill={inWishlist ? '#e91e8c' : 'none'} />
          </button>

          <button
            type="button"
            className="grid-add-btn"
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAdding}
          >
            {isAdding ? <span className="loader" /> : <ShoppingBag size={18} />}
          </button>
        </div>
      </div>

      <div className="product-card-details">
        <Link href={`/product/${product.slug}`}>
          <h3 className="product-grid-name">{product.name}</h3>
        </Link>

        <div className="product-grid-price">
          <span className="price-main">{priceFormatted}</span>
          {originalFormatted && (
            <span className="price-old">{originalFormatted}</span>
          )}
        </div>
      </div>
    </div>
  )
}