'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingBag, Eye, Star, Zap } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { IProduct } from '@/types'
import toast from 'react-hot-toast'
import type { Product } from './ShopClient'
import type { MouseEvent } from 'react'

interface Props {
  product: Product
  viewMode: 'grid' | 'list'
  index: number
}

// ── Bag Placeholder ───────────────────────────
const BagPlaceholder = ({ seed }: { seed: string }) => {
  const hues = ['#f9e4f0', '#fdf3e0', '#e8eaf6', '#e0f4ea', '#fff3e0']
  const bg = hues[seed.charCodeAt(0) % hues.length]
  return (
    <div className="shop-card-placeholder" style={{ background: bg }} aria-hidden>
      <svg viewBox="0 0 120 130" fill="none" width="72" height="80">
        <path
          d="M38 52 Q38 28 60 28 Q82 28 82 52"
          stroke="#C9A84C" strokeWidth="5" strokeLinecap="round" fill="none"
        />
        <rect x="18" y="52" width="84" height="64" rx="14" fill="#E91E8C" opacity="0.18" />
        <rect x="18" y="52" width="84" height="64" rx="14" stroke="#E91E8C" strokeWidth="1.5" />
        <path d="M18 72 Q60 56 102 72 L102 52 Q60 38 18 52 Z" fill="#E91E8C" opacity="0.12" />
        <circle cx="60" cy="74" r="8" fill="#C9A84C" opacity="0.5" />
        <circle cx="60" cy="74" r="4" fill="#1A1A2E" opacity="0.3" />
      </svg>
    </div>
  )
}

// ── Stars ─────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <div className="shop-card-stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s} size={11}
          fill={s <= Math.round(rating) ? '#C9A84C' : 'none'}
          color={s <= Math.round(rating) ? '#C9A84C' : '#d1d5db'}
        />
      ))}
    </div>
  )
}

// ── Convert ShopClient.Product → IProduct ─────
function toIProduct(p: Product): IProduct {
  return {
    _id:              p._id,
    name:             p.name,
    slug:             p.slug,
    description:      p.name,
    shortDescription: p.name,
    // If there's an originalPrice the displayed price is the sale price
    price:            p.originalPrice ?? p.price,
    discountPrice:    p.originalPrice ? p.price : undefined,
    category:         p.category,
    tags:             p.tags ?? [],
    colors: (p.colors ?? []).map((hex) => ({
      name:   hex,
      hex,
      images: [],
      stock:  p.stock,
    })),
    mainImage: {
      url:          p.images?.[0] ?? '',
      cloudinaryId: '',
      alt:          p.name,
    },
    status:      'active',
    isFeatured:  p.isFeatured  ?? false,
    isFlashSale: p.isOnSale    ?? false,
    soldCount:   p.reviewCount ?? 0,
    stock:       p.stock,
    ratings: {
      average: p.rating       ?? 0,
      count:   p.reviewCount  ?? 0,
    },
    createdAt: p.createdAt,
    updatedAt: p.createdAt,
  }
}

export default function ShopProductCard({ product, viewMode, index }: Props) {
  const [isHovered, setIsHovered] = useState(false)
  const [isAdding, setIsAdding]   = useState(false)

  const addItem    = useCartStore((s) => s.addItem)
  const openCart   = useCartStore((s) => s.openCart)
  const toggleWish = useWishlistStore((s) => s.toggleItem)
  const inWishlist = useWishlistStore((s) => s.items.includes(product._id))

  const handleAddToCart = (e: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (isAdding || product.stock === 0) return

    setIsAdding(true)
    addItem({
      product:       toIProduct(product),
      quantity:      1,
      selectedColor: product.colors?.[0] ?? 'Default',
      price:         product.price,
    })
    toast.success(`🛍️ ${product.name} added to cart!`)
    setTimeout(() => { setIsAdding(false); openCart() }, 500)
  }

  const handleWishlist = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWish(product._id)
    toast.success(inWishlist ? 'Removed from wishlist' : '❤️ Added to wishlist!')
  }

  const price    = `৳${product.price.toLocaleString('en-BD')}`
  const original = product.originalPrice
    ? `৳${product.originalPrice.toLocaleString('en-BD')}`
    : null

  // ── LIST VIEW ──────────────────────────────────────────────────────────
  if (viewMode === 'list') {
    return (
      <div
        className="shop-list-card"
        style={{ animationDelay: `${index * 0.05}s` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image */}
        <Link href={`/product/${product.slug}`} className="shop-list-img-wrap">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100px, 130px"
              className="shop-list-img"
              style={{
                transform: isHovered ? 'scale(1.06)' : 'scale(1)',
                transition: 'transform 0.4s ease',
              }}
            />
          ) : (
            <BagPlaceholder seed={product._id} />
          )}
          {product.isOnSale && product.discountPercent && (
            <span className="shop-card-badge-sale">-{product.discountPercent}%</span>
          )}
        </Link>

        {/* Info */}
        <div className="shop-list-info">
          <p className="shop-card-category">{product.category}</p>
          <Link href={`/product/${product.slug}`} className="shop-list-name">
            {product.name}
          </Link>
          {(product.rating ?? 0) > 0 && (
            <div className="shop-card-rating">
              <Stars rating={product.rating!} />
              <span className="shop-card-review-count">({product.reviewCount ?? 0})</span>
            </div>
          )}
          <div className="shop-card-price-row">
            <span className="shop-card-price">{price}</span>
            {original && <span className="shop-card-original">{original}</span>}
            {product.isOnSale && product.discountPercent && (
              <span className="shop-card-save">Save {product.discountPercent}%</span>
            )}
          </div>
          {product.stock <= 5 && product.stock > 0 && (
            <p className="shop-card-low-stock">Only {product.stock} left!</p>
          )}
        </div>

        {/* Actions */}
        <div className="shop-list-actions">
          <button
            onClick={handleWishlist}
            className={`shop-icon-btn ${inWishlist ? 'shop-icon-btn-active' : ''}`}
            aria-label="Wishlist"
          >
            <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
          </button>
          <Link href={`/product/${product.slug}`} className="shop-icon-btn" aria-label="View">
            <Eye size={18} />
          </Link>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAdding}
            className="shop-list-cart-btn"
          >
            {isAdding ? <span className="shop-spinner" /> : <ShoppingBag size={16} />}
            {product.stock === 0 ? 'Out of Stock' : isAdding ? 'Adding…' : 'Add to Cart'}
          </button>
        </div>
      </div>
    )
  }

 // ── GRID VIEW ──────────────────────────────────────────────────────────
  return (
    <div
      className="shop-grid-card"
      style={{ animationDelay: `${index * 0.06}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image block container */}
      <div className="shop-grid-img-container" style={{ position: 'relative', overflow: 'hidden' }}>
        <Link href={`/product/${product.slug}`} className="shop-grid-img-wrap">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="shop-grid-img"
              style={{
                transform: isHovered ? 'scale(1.07)' : 'scale(1)',
                transition: 'transform 0.5s ease',
              }}
            />
          ) : (
            <BagPlaceholder seed={product._id} />
          )}
        </Link>

        {/* Badges */}
        <div className="shop-card-badges">
          {product.isFeatured && (
            <span className="shop-card-badge-featured">✨ Featured</span>
          )}
          {product.isOnSale && product.discountPercent && (
            <span className="shop-card-badge-sale">-{product.discountPercent}%</span>
          )}
        </div>

        {/* Low stock */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="shop-card-low-stock-tag">
            <Zap size={11} /> Only {product.stock} left
          </div>
        )}

        {/* Hover actions - MOVED OUTSIDE THE IMAGE LINK */}
        <div className={`shop-grid-actions ${isHovered ? 'shop-grid-actions-visible' : ''}`}>
          <button
            onClick={handleWishlist}
            className={`shop-icon-btn ${inWishlist ? 'shop-icon-btn-active' : ''}`}
            aria-label="Wishlist"
          >
            <Heart size={17} fill={inWishlist ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAdding}
            className="shop-icon-btn shop-icon-btn-cart"
            aria-label="Add to cart"
          >
            {isAdding
              ? <span className="shop-spinner shop-spinner-sm" />
              : <ShoppingBag size={17} />}
          </button>
          <Link href={`/product/${product.slug}`} className="shop-icon-btn" aria-label="Quick view">
            <Eye size={17} />
          </Link>
        </div>
      </div>

      {/* Info block */}
      <div className="shop-grid-info">
        <p className="shop-card-category">{product.category}</p>
        <Link href={`/product/${product.slug}`} className="shop-grid-name">
          {product.name}
        </Link>
        {(product.rating ?? 0) > 0 && (
          <div className="shop-card-rating">
            <Stars rating={product.rating!} />
            <span className="shop-card-review-count">({product.reviewCount ?? 0})</span>
          </div>
        )}
        <div className="shop-card-price-row">
          <span className="shop-card-price">{price}</span>
          {original && <span className="shop-card-original">{original}</span>}
        </div>
        {(product.colors?.length ?? 0) > 0 && (
          <div className="shop-card-colors">
            {product.colors!.slice(0, 5).map((hex) => (
              <span
                key={hex}
                className="shop-card-color-dot"
                style={{
                  background: hex,
                  border:
                    hex === '#f5f5f0' || hex === '#ffffff'
                      ? '1.5px solid #e5e7eb'
                      : '1.5px solid transparent',
                }}
                title={hex}
              />
            ))}
            {(product.colors?.length ?? 0) > 5 && (
              <span className="shop-card-colors-more">
                +{product.colors!.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Add to Cart footer */}
      <button
        onClick={handleAddToCart}
        disabled={product.stock === 0 || isAdding}
        className="shop-grid-atc-btn"
      >
        {isAdding ? (
          <><span className="shop-spinner shop-spinner-sm" /> Adding…</>
        ) : product.stock === 0 ? (
          'Out of Stock'
        ) : (
          <><ShoppingBag size={15} /> Add to Cart</>
        )}
      </button>
    </div>
  )
}