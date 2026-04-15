// app/wishlist/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingBag, Trash2, ArrowLeft, Star } from 'lucide-react'
import { useWishlistStore } from '@/store/wishlistStore'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'

interface Product {
  _id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  images?: string[]
  category: string
  rating?: number
  reviewCount?: number
  stock: number
  colors?: string[]
}

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  const items = useWishlistStore((s) => s.items)
  const removeItem = useWishlistStore((s) => s.removeItem)
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted || items.length === 0) {
      setLoading(false)
      setProducts([])
      return
    }

    const fetchProducts = async () => {
      setLoading(true)
      try {
        // Fetch each product by ID
        const results = await Promise.all(
          items.map((id) =>
            fetch(`/api/products/${id}`).then((r) => (r.ok ? r.json() : null))
          )
        )
        setProducts(results.filter(Boolean))
      } catch {
        toast.error('Failed to load wishlist products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [items, isMounted])

  const handleRemove = (productId: string, name: string) => {
    removeItem(productId)
    toast.success(`Removed ${name} from wishlist`)
  }

  const handleAddToCart = (product: Product) => {
    addItem({
      product: {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        description: product.name,
        shortDescription: product.name,
        price: product.originalPrice ?? product.price,
        discountPrice: product.originalPrice ? product.price : undefined,
        category: product.category,
        tags: [],
        colors: (product.colors ?? []).map((hex) => ({
          name: hex,
          hex,
          images: [],
          stock: product.stock,
        })),
        mainImage: {
          url: product.images?.[0] ?? '',
          cloudinaryId: '',
          alt: product.name,
        },
        status: 'active',
        isFeatured: false,
        isFlashSale: false,
        soldCount: 0,
        stock: product.stock,
        ratings: { average: product.rating ?? 0, count: product.reviewCount ?? 0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      quantity: 1,
      selectedColor: product.colors?.[0] ?? 'Default',
      price: product.price,
    })
    toast.success(`🛍️ ${product.name} added to cart!`)
    setTimeout(() => openCart(), 300)
  }

  if (!isMounted) return null

  return (
    <div className="shop-page" style={{ paddingTop: '72px' }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, #2d1b4e 100%)',
          padding: '2.5rem 0 2rem',
        }}
      >
        <div className="container-bagbliss">
          <Link
            href="/shop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
              marginBottom: '1rem',
              fontFamily: 'var(--font-body)',
            }}
          >
            <ArrowLeft size={16} />
            Back to Shop
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Heart size={28} color="var(--color-accent)" fill="var(--color-accent)" />
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                fontWeight: 700,
                color: 'white',
                margin: 0,
              }}
            >
              My Wishlist
            </h1>
            {items.length > 0 && (
              <span
                style={{
                  background: 'var(--color-accent)',
                  color: 'white',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                }}
              >
                {items.length}
              </span>
            )}
          </div>
          <p
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              margin: '0.5rem 0 0',
            }}
          >
            {items.length === 0
              ? 'Your wishlist is empty'
              : `${items.length} item${items.length > 1 ? 's' : ''} saved`}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container-bagbliss" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        {loading ? (
          <div className="products-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '320px', borderRadius: 'var(--radius-xl)' }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="shop-empty">
            <div className="shop-empty-icon">
              <Heart size={36} />
            </div>
            <h2 className="shop-empty-title">Nothing saved yet</h2>
            <p className="shop-empty-subtitle">
              Browse our collection and heart the bags you love!
            </p>
            <Link href="/shop" className="btn-primary">
              <ShoppingBag size={18} />
              Browse Shop
            </Link>
          </div>
        ) : (
          <>
            {/* Clear all */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '1.5rem',
              }}
            >
              <button
                onClick={() => {
                  items.forEach((id) => removeItem(id))
                  toast.success('Wishlist cleared')
                }}
                className="cart-clear-btn"
                style={{ fontSize: '0.85rem' }}
              >
                Clear all
              </button>
            </div>

            <div className="products-grid">
              {products.map((product, index) => (
                <WishlistCard
                  key={product._id}
                  product={product}
                  index={index}
                  onRemove={() => handleRemove(product._id, product.name)}
                  onAddToCart={() => handleAddToCart(product)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function WishlistCard({
  product,
  index,
  onRemove,
  onAddToCart,
}: {
  product: Product
  index: number
  onRemove: () => void
  onAddToCart: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const price = `৳${product.price.toLocaleString('en-BD')}`
  const original = product.originalPrice
    ? `৳${product.originalPrice.toLocaleString('en-BD')}`
    : null
  const discountPct = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null

  const handleAdd = () => {
    if (product.stock === 0 || isAdding) return
    setIsAdding(true)
    onAddToCart()
    setTimeout(() => setIsAdding(false), 600)
  }

  return (
    <div
      className="shop-grid-card"
      style={{ animationDelay: `${index * 0.06}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.slug}`} className="shop-grid-img-wrap">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="shop-grid-img"
            style={{
              transform: isHovered ? 'scale(1.07)' : 'scale(1)',
              transition: 'transform 0.5s ease',
            }}
          />
        ) : (
          <div
            className="shop-card-placeholder"
            style={{ background: '#fdf3e0' }}
          >
            <ShoppingBag size={48} color="var(--color-accent)" opacity={0.3} />
          </div>
        )}

        {discountPct && (
          <div className="shop-card-badges">
            <span className="shop-card-badge-sale">-{discountPct}%</span>
          </div>
        )}

        {/* Remove button */}
        <div
          className={`shop-grid-actions ${isHovered ? 'shop-grid-actions-visible' : ''}`}
        >
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onRemove()
            }}
            className="shop-icon-btn"
            aria-label="Remove from wishlist"
            title="Remove"
          >
            <Trash2 size={16} color="var(--color-error)" />
          </button>
        </div>
      </Link>

      <div className="shop-grid-info">
        <p className="shop-card-category">{product.category}</p>
        <Link href={`/product/${product.slug}`} className="shop-grid-name">
          {product.name}
        </Link>

        {(product.rating ?? 0) > 0 && (
          <div className="shop-card-rating">
            <div className="shop-card-stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={11}
                  fill={s <= Math.round(product.rating!) ? '#C9A84C' : 'none'}
                  color={s <= Math.round(product.rating!) ? '#C9A84C' : '#d1d5db'}
                />
              ))}
            </div>
            <span className="shop-card-review-count">({product.reviewCount ?? 0})</span>
          </div>
        )}

        <div className="shop-card-price-row">
          <span className="shop-card-price">{price}</span>
          {original && <span className="shop-card-original">{original}</span>}
        </div>

        {product.stock <= 5 && product.stock > 0 && (
          <p className="shop-card-low-stock">Only {product.stock} left!</p>
        )}
      </div>

      <button
        onClick={handleAdd}
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