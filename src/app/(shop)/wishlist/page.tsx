'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Heart, ShoppingBag, Trash2, ArrowLeft,
  Star, Package, ArrowRight, Sparkles,
} from 'lucide-react'
import { useWishlistStore } from '@/store/wishlistStore'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'

// ── Types ──────────────────────────────────────────────────────────────────

interface Product {
  _id:             string
  name:            string
  slug:            string
  price:           number
  originalPrice?:  number
  images?:         string[]
  category:        string
  rating?:         number
  reviewCount?:    number
  totalStock?:     number
  stock?:          number
  colors?:         { name: string; hex: string; stock: number }[] | string[]
  isFeatured?:     boolean
  isFlashSale?:    boolean
  flashSalePrice?: number
}

// ── Helpers ────────────────────────────────────────────────────────────────

const CAT_LABELS: Record<string, string> = {
  'mini-crossbody': 'Mini Crossbody',
  'chain-strap':    'Chain Strap',
  'leather':        'Leather',
  'canvas':         'Canvas',
  'party':          'Party & Evening',
}

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: '1px' }}>
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={11}
          fill={s <= Math.round(rating) ? '#C9A84C' : 'none'}
          color={s <= Math.round(rating) ? '#C9A84C' : '#d1d5db'}
        />
      ))}
    </div>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div style={{
      background: 'white', borderRadius: '20px',
      border: '1px solid #f1f5f9', overflow: 'hidden',
    }}>
      <div className="skeleton" style={{ aspectRatio: '1', width: '100%' }} />
      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="skeleton" style={{ height: '12px', width: '60%', borderRadius: '6px' }} />
        <div className="skeleton" style={{ height: '16px', width: '90%', borderRadius: '6px' }} />
        <div className="skeleton" style={{ height: '14px', width: '40%', borderRadius: '6px' }} />
        <div className="skeleton" style={{ height: '42px', borderRadius: '10px', marginTop: '4px' }} />
      </div>
    </div>
  )
}

// ── Wishlist Card ──────────────────────────────────────────────────────────

function WishlistCard({
  product, index, onRemove, onAddToCart,
}: {
  product:     Product
  index:       number
  onRemove:    () => void
  onAddToCart: () => void
}) {
  const [hovered,  setHovered]  = useState(false)
  const [adding,   setAdding]   = useState(false)
  const [removing, setRemoving] = useState(false)

  const stock          = product.totalStock ?? product.stock ?? 0
  const isOutOfStock   = stock === 0
  const isLowStock     = stock > 0 && stock <= 5
  const effectivePrice = product.isFlashSale && product.flashSalePrice
    ? product.flashSalePrice
    : product.price
  const originalPrice  = product.originalPrice ?? (product.isFlashSale ? product.price : null)
  const discountPct    = originalPrice && originalPrice > effectivePrice
    ? Math.round((1 - effectivePrice / originalPrice) * 100)
    : null

  const handleAdd = async () => {
    if (isOutOfStock || adding) return
    setAdding(true)
    onAddToCart()
    setTimeout(() => setAdding(false), 800)
  }

  const handleRemove = () => {
    setRemoving(true)
    setTimeout(onRemove, 250)
  }

  return (
    <div
      style={{
        background:     'white',
        borderRadius:   '20px',
        border:         `1px solid ${hovered ? 'rgba(233,30,140,0.2)' : '#f1f5f9'}`,
        overflow:       'hidden',
        display:        'flex',
        flexDirection:  'column',
        transition:     'all 0.25s ease',
        boxShadow:      hovered ? '0 12px 40px rgba(233,30,140,0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
        transform:      removing ? 'scale(0.96)' : hovered ? 'translateY(-3px)' : 'none',
        opacity:        removing ? 0 : 1,
        animationDelay: `${index * 0.06}s`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: '#fafafa' }}>
        <Link href={`/product/${product.slug}`} style={{ display: 'block', width: '100%', height: '100%' }}>
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              style={{
                objectFit:  'cover',
                transform:  hovered ? 'scale(1.07)' : 'scale(1)',
                transition: 'transform 0.5s ease',
              }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(233,30,140,0.04), rgba(201,168,76,0.04))',
            }}>
              <Package size={48} color="#e91e8c" style={{ opacity: 0.2 }} />
            </div>
          )}
        </Link>

        {/* Badges */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 2 }}>
          {discountPct && (
            <span style={{ background: '#e91e8c', color: 'white', fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '7px', fontFamily: 'var(--font-mono)' }}>
              -{discountPct}%
            </span>
          )}
          {product.isFlashSale && (
            <span style={{ background: '#f59e0b', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '2px 7px', borderRadius: '6px' }}>
              ⚡ SALE
            </span>
          )}
          {isLowStock && (
            <span style={{ background: 'rgba(239,68,68,0.9)', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: '6px' }}>
              Only {stock} left
            </span>
          )}
        </div>

        {/* Remove button */}
        <button
          onClick={handleRemove}
          style={{
            position:   'absolute', top: '10px', right: '10px',
            width:      '34px', height: '34px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.95)',
            border:     '1.5px solid rgba(239,68,68,0.2)',
            display:    'flex', alignItems: 'center', justifyContent: 'center',
            cursor:     'pointer', zIndex: 3,
            opacity:    hovered ? 1 : 0,
            transform:  hovered ? 'translateX(0)' : 'translateX(8px)',
            transition: 'all 0.2s ease',
            boxShadow:  '0 2px 8px rgba(0,0,0,0.12)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background  = '#fff1f2'
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background  = 'rgba(255,255,255,0.95)'
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'
          }}
          title="Remove from wishlist"
        >
          <Trash2 size={14} color="#ef4444" />
        </button>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div style={{
            position:       'absolute', inset: 0,
            background:     'rgba(255,255,255,0.7)',
            display:        'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(2px)',
          }}>
            <span style={{
              background:   'rgba(15,23,42,0.85)', color: 'white',
              fontSize:     '0.75rem', fontWeight: 700,
              padding:      '6px 14px', borderRadius: '99px',
            }}>
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px 14px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <p style={{
          fontFamily:    'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700,
          color:         '#e91e8c', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0,
        }}>
          {CAT_LABELS[product.category] ?? product.category}
        </p>

        <Link
          href={`/product/${product.slug}`}
          style={{
            fontFamily:      'var(--font-body)', fontSize: '0.92rem', fontWeight: 700,
            color:           hovered ? '#e91e8c' : '#1e293b', textDecoration: 'none',
            lineHeight:      1.35, transition: 'color 0.2s',
            display:         '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}
        >
          {product.name}
        </Link>

        {(product.rating ?? 0) > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Stars rating={product.rating!} />
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              ({product.reviewCount ?? 0})
            </span>
          </div>
        )}

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '2px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 800, color: '#e91e8c' }}>
            ৳{effectivePrice.toLocaleString('en-BD')}
          </span>
          {originalPrice && originalPrice > effectivePrice && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'line-through' }}>
              ৳{originalPrice.toLocaleString('en-BD')}
            </span>
          )}
          {discountPct && (
            <span style={{
              fontSize:   '0.68rem', fontWeight: 700,
              background: 'rgba(34,197,94,0.08)', color: '#15803d',
              padding:    '2px 6px', borderRadius: '6px',
              border:     '1px solid rgba(34,197,94,0.2)',
            }}>
              Save {discountPct}%
            </span>
          )}
        </div>
      </div>

      {/* Add to Cart */}
      <div style={{ padding: '0 12px 12px' }}>
        <button
          onClick={handleAdd}
          disabled={isOutOfStock || adding}
          style={{
            display:        'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            width:          '100%', padding: '11px',
            background:     isOutOfStock ? '#e2e8f0' : adding ? 'var(--color-accent-dark)' : 'linear-gradient(135deg, #1a1a2e, #2d2d4e)',
            color:          isOutOfStock ? '#94a3b8' : 'white',
            fontFamily:     'var(--font-body)', fontSize: '0.82rem', fontWeight: 700,
            border:         'none', borderRadius: '12px',
            cursor:         isOutOfStock ? 'not-allowed' : 'pointer',
            transition:     'all 0.2s ease',
          }}
          onMouseEnter={e => {
            if (!isOutOfStock && !adding)
              e.currentTarget.style.background = 'linear-gradient(135deg, #e91e8c, #f43f5e)'
          }}
          onMouseLeave={e => {
            if (!isOutOfStock && !adding)
              e.currentTarget.style.background = 'linear-gradient(135deg, #1a1a2e, #2d2d4e)'
          }}
        >
          {adding ? (
            <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Added!</>
          ) : isOutOfStock ? (
            'Out of Stock'
          ) : (
            <><ShoppingBag size={14} /> Add to Cart</>
          )}
        </button>
      </div>
    </div>
  )
}

// ── Empty State ────────────────────────────────────────────────────────────

function EmptyWishlist() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '5rem 2rem', textAlign: 'center',
    }}>
      <div style={{
        width: '100px', height: '100px', borderRadius: '50%',
        background: 'rgba(233,30,140,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1.5rem',
      }}>
        <Heart size={44} color="#e91e8c" strokeWidth={1.5} />
      </div>
      <h2 style={{
        fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,3vw,2rem)',
        color: 'var(--color-primary)', margin: '0 0 0.75rem',
      }}>
        Your wishlist is empty
      </h2>
      <p style={{
        fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)',
        fontSize: '1rem', lineHeight: 1.7, margin: '0 0 2rem', maxWidth: '380px',
      }}>
        Browse our collection and tap the ❤️ on bags you love to save them here.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/shop" className="btn-primary" style={{ gap: '0.5rem' }}>
          <ShoppingBag size={18} /> Browse Shop
        </Link>
        <Link href="/" className="btn-secondary" style={{ gap: '0.5rem', padding: '0.875rem 1.5rem' }}>
          <Sparkles size={16} /> See Featured
        </Link>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(true)

  const items        = useWishlistStore(s => s.items)
  const hasHydrated  = useWishlistStore(s => s.hasHydrated)
  const removeItem   = useWishlistStore(s => s.removeItem)
  const addItem      = useCartStore(s => s.addItem)
  const openCart     = useCartStore(s => s.openCart)

  // ── Wait for Zustand to rehydrate from localStorage before fetching ──────
  useEffect(() => {
    // Don't run until Zustand has loaded from localStorage
    if (!hasHydrated) return

    const controller = new AbortController()

    async function load() {
      if (items.length === 0) {
        setProducts([])
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        const results = await Promise.all(
          items.map(id =>
            fetch(`/api/products/${id}`, { signal: controller.signal })
              .then(r => r.ok ? r.json() : null)
              .catch(() => null)
          )
        )
        if (!controller.signal.aborted) {
          setProducts(results.filter(Boolean))
          setLoading(false)
        }
      } catch {
        if (!controller.signal.aborted) {
          toast.error('Failed to load wishlist')
          setLoading(false)
        }
      }
    }

    load()
    return () => controller.abort()
  }, [items, hasHydrated]) // ← hasHydrated ensures we wait for localStorage

  const handleRemove = (id: string) => {
    removeItem(id)
    setProducts(prev => prev.filter(p => p._id !== id))
    toast.success('Removed from wishlist')
  }

  const handleAddToCart = (product: Product) => {
    const firstColor = Array.isArray(product.colors) && product.colors.length > 0
      ? typeof product.colors[0] === 'string'
        ? product.colors[0]
        : (product.colors[0] as { name: string; hex: string; stock: number }).name
      : 'Default'

    const colorObjs = Array.isArray(product.colors)
      ? product.colors.map(c =>
          typeof c === 'string'
            ? { name: c, hex: c, images: [], stock: product.totalStock ?? product.stock ?? 10 }
            : {
                name:   (c as { name: string }).name,
                hex:    (c as { hex: string }).hex,
                images: [],
                stock:  (c as { stock: number }).stock,
              }
        )
      : []

    const effectivePrice = product.isFlashSale && product.flashSalePrice
      ? product.flashSalePrice
      : product.price

    addItem({
      product: {
        _id:              product._id,
        name:             product.name,
        slug:             product.slug,
        description:      product.name,
        shortDescription: product.name,
        price:            product.originalPrice ?? product.price,
        discountPrice:    product.originalPrice ? effectivePrice : undefined,
        category:         product.category,
        tags:             [],
        colors:           colorObjs,
        mainImage: {
          url:          product.images?.[0] ?? '',
          cloudinaryId: '',
          alt:          product.name,
        },
        status:      'active',
        isFeatured:  product.isFeatured  ?? false,
        isFlashSale: product.isFlashSale ?? false,
        soldCount:   0,
        stock:       product.totalStock ?? product.stock ?? 0,
        ratings:     { average: product.rating ?? 0, count: product.reviewCount ?? 0 },
        createdAt:   new Date().toISOString(),
        updatedAt:   new Date().toISOString(),
      },
      quantity:      1,
      selectedColor: firstColor,
      price:         effectivePrice,
    })

    toast.success(`🛍️ ${product.name} added to cart!`)
    setTimeout(() => openCart(), 300)
  }

  // Show skeletons while Zustand is rehydrating OR products are loading
  const isLoading = !hasHydrated || loading

  return (
    <div style={{ paddingTop: '72px', minHeight: '100vh', background: 'var(--color-surface)' }}>

      {/* ── Hero Header ───────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-primary) 0%, #2d1b4e 100%)',
        padding: '2.5rem 0 2rem', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-40%', right: '-5%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(233,30,140,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-30%', left: '-5%', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container-bagbliss" style={{ position: 'relative', zIndex: 1 }}>
          <Link
            href="/shop"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', fontWeight: 600,
              textDecoration: 'none', marginBottom: '1.25rem', fontFamily: 'var(--font-body)',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
          >
            <ArrowLeft size={16} /> Back to Shop
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'rgba(233,30,140,0.2)', border: '1px solid rgba(233,30,140,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Heart size={24} color="#e91e8c" fill="#e91e8c" />
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem,4vw,2.75rem)',
              fontWeight: 700, color: 'white', margin: 0,
            }}>
              My Wishlist
            </h1>
            {hasHydrated && items.length > 0 && (
              <span style={{
                background: 'rgba(233,30,140,0.25)', border: '1px solid rgba(233,30,140,0.4)',
                color: '#f9a8d4', fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem', fontWeight: 700,
                padding: '0.2rem 0.75rem', borderRadius: '9999px',
              }}>
                {items.length} saved
              </span>
            )}
          </div>

          <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-body)', fontSize: '0.95rem', margin: 0 }}>
            {!hasHydrated
              ? 'Loading your wishlist...'
              : items.length === 0
              ? 'No items saved yet — start browsing!'
              : `${products.length} item${products.length !== 1 ? 's' : ''} you love`}
          </p>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="container-bagbliss" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>

        {/* Loading — show while hydrating OR fetching */}
        {isLoading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {[...Array(Math.max(items.length, 4))].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && items.length === 0 && <EmptyWishlist />}

        {/* Products */}
        {!isLoading && products.length > 0 && (
          <>
            {/* Toolbar */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: '1.5rem',
              flexWrap: 'wrap', gap: '1rem',
            }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Showing <strong style={{ color: 'var(--color-primary)' }}>{products.length}</strong> saved item{products.length !== 1 ? 's' : ''}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    products.forEach(p => handleAddToCart(p))
                    toast.success(`${products.length} items added to cart! 🛍️`)
                    setTimeout(() => openCart(), 400)
                  }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.5rem 1.1rem', borderRadius: '9999px',
                    background: 'var(--color-accent)', color: 'white',
                    fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.82rem',
                    border: 'none', cursor: 'pointer',
                  }}
                >
                  <ShoppingBag size={14} /> Add All to Cart
                </button>
                <button
                  onClick={() => {
                    items.forEach(id => removeItem(id))
                    setProducts([])
                    toast.success('Wishlist cleared')
                  }}
                  style={{
                    background: 'none', border: '1.5px solid rgba(239,68,68,0.2)',
                    borderRadius: '9999px', padding: '0.5rem 1rem',
                    fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600,
                    color: '#ef4444', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                  }}
                >
                  <Trash2 size={13} /> Clear All
                </button>
              </div>
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
              {products.map((product, i) => (
                <WishlistCard
                  key={product._id}
                  product={product}
                  index={i}
                  onRemove={() => handleRemove(product._id)}
                  onAddToCart={() => handleAddToCart(product)}
                />
              ))}
            </div>

            {/* Bottom CTA */}
            <div style={{
              marginTop: '3rem', padding: '2rem',
              background: 'white', borderRadius: '20px',
              border: '1px solid #f1f5f9',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
            }}>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)', margin: '0 0 4px' }}>
                  Find more bags you&apos;ll love
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Explore our full collection of mini crossbody bags
                </p>
              </div>
              <Link href="/shop" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.875rem 1.75rem', borderRadius: '9999px',
                background: 'var(--color-primary)', color: 'white',
                fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.9rem',
                textDecoration: 'none',
              }}>
                Browse Shop <ArrowRight size={16} />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}