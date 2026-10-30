'use client'

import { Fragment, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, RotateCcw, MessageCircle, ShoppingBag, Check, ExternalLink } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import type { IProduct } from '@/types'

// ── Config ────────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = '8801303660481'
const DEFAULT_MESSAGE = 'Hello BagBliss BD! 👜 I have a question about your bags.'
const BRAND = '#CA865D'
const BRAND_DARK = '#8f5f3d'
const DARK = '#0f0f13'

// ── Bottom nav height + margin — must match your Navbar.tsx floating pill
// pill height ≈ 62px, bottom margin 0.875rem (14px), gap above = 12px buffer
const BOTTOM_NAV_HEIGHT = 62
const BOTTOM_NAV_MARGIN = 10    // ← was 14 (no more bottom margin since nav is flush)
const FAB_CLEARANCE     = BOTTOM_NAV_HEIGHT + BOTTOM_NAV_MARGIN + 12  // = 74px

const QUICK_WA_MESSAGES = [
  { emoji: '👜', label: 'Ask about a bag',      text: 'Hi! I want to know more about one of your bags.' },
  { emoji: '📦', label: 'Track my order',       text: 'Hi! I want to track my order. My order number is: ' },
  { emoji: '💰', label: 'Price & availability', text: 'Hi! I want to check the price and availability of a bag.' },
  { emoji: '↩️', label: 'Return / Exchange',    text: 'Hi! I want to return or exchange an item I purchased.' },
  { emoji: '🚚', label: 'Delivery question',    text: 'Hi! I have a question about delivery to my area.' },
]

const QUICK_AI = ['Under ৳1,000', 'New Arrivals', 'Sale Bags']

// Product card payload returned by /api/ai/chat (validated + priced on the server)
interface ChatProduct {
  _id: string
  name: string
  slug: string
  category: string
  price: number
  originalPrice?: number
  isFlashSale: boolean
  image: string
  colors: { name: string; hex: string; stock: number }[]
  stock: number
  tags: string[]
  rating: number
  reviewCount: number
  createdAt: string
}

interface Message { role: 'user' | 'assistant'; content: string; products?: ChatProduct[] }

const WELCOME: Message = {
  role: 'assistant',
  content: "Hey! 👜 I'm your personal bag stylist. Share your budget, occasion, or vibe — I'll find your perfect match!",
}

function buildWhatsAppURL(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

function renderMessage(content: string) {
  return content.split('\n').map((line, lineIdx) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g)
    return (
      <span key={lineIdx} style={{ display: 'block' }}>
        {parts.map((part, i) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={i}>{part.slice(2, -2)}</strong>
            : <span key={i}>{part}</span>
        )}
      </span>
    )
  })
}

// ── WhatsApp Panel ────────────────────────────────────────────────────────
function WhatsAppPanel({ onClose, isMobile }: { onClose: () => void; isMobile: boolean }) {
  const [customMessage, setCustomMessage] = useState('')

  const handleQuick = (text: string) => {
    window.open(buildWhatsAppURL(text), '_blank', 'noopener,noreferrer')
    onClose()
  }
  const handleCustom = () => {
    window.open(buildWhatsAppURL(customMessage.trim() || DEFAULT_MESSAGE), '_blank', 'noopener,noreferrer')
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      style={{
        width: isMobile ? 'calc(100vw - 32px)' : 320,
        maxWidth: 340,
        borderRadius: 20, overflow: 'hidden',
        background: 'white',
        boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)',
      }}
    >
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
        padding: '16px 18px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 46, height: 46, borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          border: '2px solid rgba(255,255,255,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}><ShoppingBag size={22} color="#fff" strokeWidth={1.75} /></div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white', margin: 0 }}>BagBliss BD Support</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#90EE90', display: 'inline-block' }} />
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.85)', margin: 0 }}>Typically replies in minutes</p>
          </div>
        </div>
        <button onClick={onClose} style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)', border: 'none',
          color: 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700,
        }}>×</button>
      </div>

      {/* Chat bubble */}
      <div style={{ padding: '16px 16px 8px', background: '#ECE5DD' }}>
        <div style={{
          background: 'white', borderRadius: '0 12px 12px 12px',
          padding: '10px 14px', maxWidth: '85%',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)', position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: -8,
            width: 0, height: 0,
            borderTop: '8px solid white',
            borderLeft: '8px solid transparent',
          }} />
          <p style={{ fontSize: '0.84rem', color: '#111', margin: 0, lineHeight: 1.5 }}>
            👋 Hi there! How can we help you today?
          </p>
          <p style={{ fontSize: '0.65rem', color: '#94a3b8', margin: '4px 0 0', textAlign: 'right' }}>BagBliss BD</p>
        </div>
      </div>

      {/* Quick messages */}
      <div style={{ background: '#ECE5DD', padding: '8px 16px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#667781', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>
          Quick Messages
        </p>
        {QUICK_WA_MESSAGES.map(({ emoji, label, text }) => (
          <button key={label} onClick={() => handleQuick(text)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', borderRadius: 20,
            background: 'white', border: '1px solid rgba(0,0,0,0.08)',
            cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
            color: '#111', textAlign: 'left', width: '100%',
            transition: 'all 0.15s', boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.borderColor = '#25D366' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)' }}
          >
            <span style={{ fontSize: 14, flexShrink: 0 }}>{emoji}</span>
            {label}
            <span style={{ marginLeft: 'auto', color: '#25D366', fontSize: 12 }}>→</span>
          </button>
        ))}
      </div>

      {/* Custom input */}
      <div style={{ padding: '10px 12px 14px', background: '#F0F0F0', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', borderRadius: 24, padding: '6px 6px 6px 14px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <input
            type="text"
            placeholder="Type a message…"
            value={customMessage}
            onChange={e => setCustomMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCustom()}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.84rem', color: '#111', background: 'transparent', minWidth: 0 }}
          />
          <button onClick={handleCustom} style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #25D366, #128C7E)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: '0 2px 8px rgba(37,211,102,0.4)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <p style={{ fontSize: '0.65rem', color: '#94a3b8', textAlign: 'center', margin: '8px 0 0' }}>
          🔒 Messages are end-to-end encrypted on WhatsApp
        </p>
      </div>
    </motion.div>
  )
}

// ── Chat → cart helpers ───────────────────────────────────────────────────
// Same shape ShopProductCard builds, so the cart drawer / checkout treat a
// product added from the chat exactly like one added from the shop page.
function toIProduct(p: ChatProduct): IProduct {
  return {
    _id:              p._id,
    name:             p.name,
    slug:             p.slug,
    description:      p.name,
    shortDescription: p.name,
    price:            p.originalPrice ?? p.price,
    discountPrice:    p.originalPrice ? p.price : undefined,
    category:         p.category,
    tags:             p.tags ?? [],
    colors: (p.colors ?? []).map((c) => ({
      name:   c.name,
      hex:    c.hex,
      images: [],
      stock:  c.stock,
    })),
    mainImage: { url: p.image ?? '', cloudinaryId: '', alt: p.name },
    status:          'active',
    isFeatured:      false,
    isFlashSale:     p.isFlashSale,
    flashSalePrice:  p.isFlashSale ? p.price : undefined,
    soldCount:       p.reviewCount ?? 0,
    stock:           p.stock,
    ratings:         { average: p.rating ?? 0, count: p.reviewCount ?? 0 },
    createdAt:       p.createdAt,
    updatedAt:       p.createdAt,
  }
}

const fmtPrice = (n: number) => `৳${n.toLocaleString('en-BD')}`

// ── Product card shown inside the chat ────────────────────────────────────
function ChatProductCard({ product, onCloseChat }: { product: ChatProduct; onCloseChat: () => void }) {
  const addItem  = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)

  const colors = product.colors
  // Start on the first colour that is actually in stock
  const firstAvail = Math.max(0, colors.findIndex((c) => c.stock > 0))
  const [colorIdx, setColorIdx] = useState(firstAvail)
  const [added, setAdded]       = useState(false)
  const [imgError, setImgError] = useState(false)

  const selected   = colors[colorIdx]
  const colorName  = selected?.name ?? 'Default'
  const available  = colors.length ? (selected?.stock ?? 0) : product.stock
  const outOfStock = product.stock <= 0 || available <= 0
  const discount   = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const handleAdd = () => {
    if (outOfStock) { toast.error('Out of stock'); return }

    // Don't let the cart go above what's in stock for this colour
    const inCart = useCartStore.getState().items
      .filter((i) => i.product._id === product._id && i.selectedColor === colorName)
      .reduce((n, i) => n + i.quantity, 0)
    if (inCart >= available) {
      toast.error(`Only ${available} in stock`)
      return
    }

    addItem({
      product:       toIProduct(product),
      quantity:      1,
      selectedColor: colorName,
      price:         product.price,
    })
    toast.success(`🛍️ ${product.name} added to cart!`)
    setAdded(true)
    setTimeout(() => setAdded(false), 2200)
  }

  const handleViewCart = () => {
    onCloseChat()
    openCart()
  }

  return (
    <div style={{
      display: 'flex', gap: 10, padding: 10, background: '#fff',
      borderRadius: 16, border: '1px solid rgba(0,0,0,0.07)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    }}>
      {/* Image */}
      <Link href={`/product/${product.slug}`} style={{
        position: 'relative', width: 78, height: 98, flexShrink: 0,
        borderRadius: 12, overflow: 'hidden', background: '#f3efea',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {product.image && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <ShoppingBag size={24} color="#c9b8a8" strokeWidth={1.5} />
        )}
        {discount > 0 && (
          <span style={{
            position: 'absolute', top: 5, left: 5, background: '#e11d48', color: '#fff',
            fontSize: 9, fontWeight: 800, padding: '2px 5px', borderRadius: 6,
          }}>-{discount}%</span>
        )}
      </Link>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Link href={`/product/${product.slug}`} style={{
          fontSize: 12.5, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.3,
          textDecoration: 'none',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{product.name}</Link>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: BRAND }}>{fmtPrice(product.price)}</span>
          {discount > 0 && product.originalPrice && (
            <span style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'line-through' }}>
              {fmtPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Colours */}
        {colors.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
            {colors.map((c, i) => (
              <button
                key={`${c.name}-${i}`}
                type="button"
                title={c.stock > 0 ? c.name : `${c.name} (out of stock)`}
                aria-label={c.name}
                disabled={c.stock <= 0}
                onClick={() => setColorIdx(i)}
                style={{
                  width: 16, height: 16, borderRadius: '50%', padding: 0,
                  background: c.hex, cursor: c.stock > 0 ? 'pointer' : 'not-allowed',
                  border: '1px solid rgba(0,0,0,0.18)',
                  outline: i === colorIdx ? `2px solid ${BRAND}` : 'none',
                  outlineOffset: 2,
                  opacity: c.stock > 0 ? 1 : 0.35,
                }}
              />
            ))}
            <span style={{ fontSize: 10.5, color: '#6b7280', marginLeft: 2 }}>{colorName}</span>
          </div>
        )}

        <p style={{
          margin: '4px 0 0', fontSize: 10.5, fontWeight: 600,
          color: outOfStock ? '#dc2626' : available <= 5 ? '#d97706' : '#16a34a',
        }}>
          {outOfStock ? 'Out of stock' : available <= 5 ? `Only ${available} left` : 'In stock'}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6, marginTop: 'auto', paddingTop: 7 }}>
          {added ? (
            <button type="button" onClick={handleViewCart} style={{
              flex: 1, height: 32, borderRadius: 10, border: 'none', cursor: 'pointer',
              background: '#16a34a', color: '#fff', fontSize: 11.5, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            }}>
              <Check size={13} /> Added · View cart
            </button>
          ) : (
            <button type="button" onClick={handleAdd} disabled={outOfStock} style={{
              flex: 1, height: 32, borderRadius: 10, border: 'none',
              cursor: outOfStock ? 'not-allowed' : 'pointer',
              background: outOfStock ? '#e5e7eb' : `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`,
              color: outOfStock ? '#9ca3af' : '#fff', fontSize: 11.5, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            }}>
              <ShoppingBag size={13} /> Add to cart
            </button>
          )}
          <Link href={`/product/${product.slug}`} title="View product" aria-label="View product" style={{
            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
            border: '1.5px solid #e5e5e5', background: '#fff', color: '#555',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ExternalLink size={13} />
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── AI Shopping Panel ─────────────────────────────────────────────────────
function AIPanel({ onClose, isMobile }: { onClose: () => void; isMobile: boolean }) {
  const [msgs, setMsgs] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 200) }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, loading])

  const send = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    const userMsg: Message = { role: 'user', content: msg }
    setMsgs(p => [...p, userMsg])
    setInput('')
    setLoading(true)
    try {
      const apiMessages = [...msgs, userMsg]
        .filter(m => m !== WELCOME)
        .map(({ role, content }) => ({ role, content }))
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setMsgs(p => [...p, {
        role: 'assistant',
        content: data.message ?? 'Sorry, try again!',
        products: Array.isArray(data.products) ? data.products : [],
      }])
    } catch {
      setMsgs(p => [...p, { role: 'assistant', content: 'Connection issue. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  // On mobile: nearly full-screen height minus nav bar clearance
  const panelHeight = isMobile ? `calc(100dvh - ${FAB_CLEARANCE + 58 + 16}px)` : '500px'
  const panelWidth  = isMobile ? 'calc(100vw - 32px)' : '330px'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      style={{
        width: panelWidth,
        maxWidth: 340,
        height: panelHeight,
        borderRadius: 20, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        background: '#fff',
        boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)',
      }}
    >
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${DARK} 0%, #1a0a1a 50%, #2a0a20 100%)`,
        padding: '14px 16px', position: 'relative', overflow: 'hidden',
        flexShrink: 0,
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle, ${BRAND}40, transparent)`, filter: 'blur(16px)' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 16px ${BRAND}50` }}><ShoppingBag size={20} color="#fff" strokeWidth={1.75} /></div>
              <div style={{ position: 'absolute', bottom: -2, right: -2, width: 11, height: 11, borderRadius: '50%', background: '#22c55e', border: '2px solid #0f0f13' }} />
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: 0 }}>BagBliss AI</p>
              <p style={{ color: '#22c55e', fontSize: 11, fontWeight: 500, margin: '2px 0 0' }}>● Replies instantly</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { icon: <RotateCcw size={13} />, action: () => setMsgs([WELCOME]), title: 'New chat' },
              { icon: <X size={14} />, action: onClose, title: 'Close' },
            ].map((btn, i) => (
              <button key={i} onClick={btn.action} title={btn.title} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
              >{btn.icon}</button>
            ))}
          </div>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: '8px 0 0', position: 'relative' }}>Your AI personal shopper</p>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10, background: 'linear-gradient(180deg, #faf8f6 0%, #f5f2ef 100%)' }}>
        {msgs.map((m, i) => (
          <Fragment key={i}>
          <div style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 6 }}>
            {m.role === 'assistant' && (
              <div style={{ width: 24, height: 24, borderRadius: 8, flexShrink: 0, background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingBag size={13} color="#fff" strokeWidth={2} /></div>
            )}
            <div style={{
              maxWidth: '75%', padding: '10px 14px', fontSize: 13, lineHeight: 1.6,
              borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              ...(m.role === 'user'
                ? { background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`, color: '#fff', boxShadow: `0 4px 16px ${BRAND}35` }
                : { background: '#fff', color: '#1a1a1a', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)' }
              ),
            }}>
              {m.role === 'assistant' ? renderMessage(m.content) : m.content}
            </div>
          </div>
          {m.role === 'assistant' && m.products && m.products.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 30 }}>
              {m.products.map((p) => (
                <ChatProductCard key={p._id} product={p} onCloseChat={onClose} />
              ))}
            </div>
          )}
          </Fragment>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
            <div style={{ width: 24, height: 24, borderRadius: 8, background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingBag size={13} color="#fff" strokeWidth={2} /></div>
            <div style={{ background: '#fff', borderRadius: '18px 18px 18px 4px', padding: '12px 16px', display: 'flex', gap: 5, alignItems: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)' }}>
              {[0, 1, 2].map(i => (
                <motion.span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#ccc', display: 'block' }}
                  animate={{ y: [0, -5, 0], backgroundColor: ['#ccc', BRAND, '#ccc'] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          </div>
        )}

        {msgs.length === 1 && !loading && (
          <div style={{ marginTop: 4 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#aaa', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Try asking</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {QUICK_AI.map(q => (
                <button key={q} onClick={() => send(q)} style={{ border: '1.5px solid #e5e5e5', borderRadius: 99, padding: '6px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer', background: '#fff', color: '#555', transition: 'all 0.15s', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = BRAND; el.style.background = BRAND; el.style.color = '#fff' }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = '#e5e5e5'; el.style.background = '#fff'; el.style.color = '#555' }}
                >{q}</button>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ borderTop: '1px solid #efefef', padding: '10px 12px 12px', background: '#fff', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1.5px solid #e8e8e8', borderRadius: 14, padding: '8px 10px', background: '#fafafa', transition: 'border-color 0.15s' }}
          onFocus={e => (e.currentTarget.style.borderColor = BRAND)}
          onBlur={e => (e.currentTarget.style.borderColor = '#e8e8e8')}
        >
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask about bags..." disabled={loading}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#1a1a1a' }}
          />
          <button onClick={() => send()} disabled={!input.trim() || loading} style={{ width: 32, height: 32, borderRadius: 10, border: 'none', background: input.trim() ? `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` : '#e8e8e8', color: input.trim() ? '#fff' : '#aaa', cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: input.trim() ? `0 4px 12px ${BRAND}45` : 'none', transition: 'all 0.2s' }}>
            <Send size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ── WhatsApp SVG Icon ─────────────────────────────────────────────────────
function WhatsAppIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M24 7C14.611 7 7 14.611 7 24c0 3.32.906 6.432 2.491 9.094L7.5 40.5l7.628-1.978A16.944 16.944 0 0024 41c9.389 0 17-7.611 17-17S33.389 7 24 7z" fill="white"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M19.343 16c-.413 0-.862.155-1.172.477-.603.618-2.171 2.25-2.171 4.568 0 2.328 1.6 4.58 1.823 4.892.222.311 3.144 5.015 7.75 6.832 1.063.41 1.894.656 2.541.84 1.068.303 2.04.26 2.808.158.857-.114 2.638-.98 3.012-1.929.373-.948.373-1.762.261-1.93-.112-.167-.41-.261-.858-.456-.448-.195-2.638-1.243-3.047-1.385-.41-.14-.708-.21-1.007.196-.298.405-1.155 1.385-1.416 1.669-.26.285-.521.32-.97.125-.447-.196-1.89-.662-3.6-2.107-1.33-1.125-2.228-2.515-2.489-2.921-.26-.405-.027-.624.196-.825.2-.18.448-.47.671-.706.224-.235.298-.405.448-.675.149-.27.075-.507-.038-.706-.112-.2-.988-2.39-1.362-3.264C20.325 16.233 19.87 16 19.343 16z" fill="#25D366"/>
    </svg>
  )
}

// ── Main ChatLauncher ─────────────────────────────────────────────────────
type ActivePanel = null | 'picker' | 'whatsapp' | 'ai'

export default function ChatLauncher() {
  const [active, setActive] = useState<ActivePanel>(null)
  const [badge, setBadge]   = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile (< 1024px — matches your Navbar breakpoint)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    // Initial sync read of an external API before subscribing to its
    // changes — matches React's documented "Subscribing to an external
    // store" pattern (https://react.dev/learn/synchronizing-with-effects#subscribing-to-events).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobile(mq.matches)
    const h = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setBadge(true), 5000)
    return () => clearTimeout(t)
  }, [])

  const isOpen = active !== null

  const handleFAB = () => {
    if (isOpen) {
      setActive(null)
    } else {
      setBadge(false)
      setActive('picker')
    }
  }

  // ── Bottom offset:
  // Desktop: 24px (standard)
  // Mobile:  bottom nav pill (62px) + its own margin (14px) + gap (12px) = 88px
  //          + safe-area-inset-bottom for notched phones
  const bottomOffset = isMobile
    ? `calc(${FAB_CLEARANCE}px + env(safe-area-inset-bottom, 0px))`
    : '24px'

  // On mobile panels open LEFT-anchored (right: 16px keeps it in frame)
  const rightOffset = '16px'

  return (
    <>
      <div style={{
        position: 'fixed',
        bottom: bottomOffset,
        right: rightOffset,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 10,
      }}>

        {/* Panels */}
        <AnimatePresence mode="wait">
          {active === 'whatsapp' && <WhatsAppPanel key="wa" onClose={() => setActive(null)} isMobile={isMobile} />}
          {active === 'ai'       && <AIPanel       key="ai" onClose={() => setActive(null)} isMobile={isMobile} />}
        </AnimatePresence>

        {/* Speed-dial picker */}
        <AnimatePresence>
          {active === 'picker' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.18 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}
            >
              {/* WhatsApp option */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: 0.05 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}
              >
                <div style={{
                  background: 'white', borderRadius: 10, padding: '6px 14px',
                  fontSize: 13, fontWeight: 600, color: '#111',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  whiteSpace: 'nowrap',
                }}>
                  Chat on WhatsApp
                </div>
                <button
                  onClick={() => setActive('whatsapp')}
                  style={{
                    width: 50, height: 50, borderRadius: '50%', border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #25D366, #128C7E)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 6px 20px rgba(37,211,102,0.5)',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,211,102,0.6)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,211,102,0.5)' }}
                >
                  <WhatsAppIcon size={24} />
                </button>
              </motion.div>

              {/* AI option */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: 0.1 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}
              >
                <div style={{
                  background: 'white', borderRadius: 10, padding: '6px 14px',
                  fontSize: 13, fontWeight: 600, color: '#111',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  whiteSpace: 'nowrap',
                }}>
                  AI Bag Stylist
                </div>
                <button
                  onClick={() => setActive('ai')}
                  style={{
                    width: 50, height: 50, borderRadius: '50%', border: 'none', cursor: 'pointer',
                    background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 6px 20px ${BRAND}55`,
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = `0 8px 24px ${BRAND}70` }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = `0 6px 20px ${BRAND}55` }}
                >
                  <ShoppingBag size={22} color="#fff" strokeWidth={1.75} />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          onClick={handleFAB}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: isOpen
              ? '#1a1a1a'
              : `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isOpen
              ? '0 8px 24px rgba(0,0,0,0.3)'
              : `0 8px 28px ${BRAND}60`,
            position: 'relative',
            transition: 'background 0.3s, box-shadow 0.3s',
            // Slightly smaller on mobile so it doesn't feel chunky
            ...(isMobile && { width: 48, height: 48 } as React.CSSProperties),
          }}
        >
          {/* Pulse ring */}
          {!isOpen && (
            <motion.div
              style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `${BRAND}50` }}
              animate={{ scale: [1, 1.6, 1.6], opacity: [0.6, 0, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}

          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="x"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ color: '#fff', display: 'flex' }}
              >
                <X size={20} />
              </motion.div>
            ) : (
              <motion.div key="chat"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ color: '#fff', display: 'flex' }}
              >
                <MessageCircle size={22} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Badge */}
          <AnimatePresence>
            {badge && !isOpen && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                style={{
                  position: 'absolute', top: -2, right: -2,
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 800, color: BRAND,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >1</motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  )
}