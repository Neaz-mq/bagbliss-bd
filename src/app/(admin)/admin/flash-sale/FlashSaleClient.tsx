'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import {
  Zap, Package, Search, X, Plus, Trash2, RefreshCw,
  ChevronDown, Save, AlertTriangle, TrendingDown, Tag, ShoppingBag, Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Product {
  _id: string
  name: string
  slug: string
  price: number
  originalPrice: number
  flashSalePrice: number
  isFlashSale: boolean
  images: string[]
  category: string
  totalStock: number
}

// ── Constants ──────────────────────────────────────────────────────────────────

const CAT_LABELS: Record<string, string> = {
  'mini-crossbody': '👛 Mini Crossbody',
  'chain-strap':    '✨ Chain Strap',
  leather:          '💼 Leather',
  canvas:           '🎒 Canvas',
  party:            '💖 Party & Evening',
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function discount(original: number, sale: number) {
  if (!original || !sale || original <= sale) return 0
  return Math.round((1 - sale / original) * 100)
}

function PriceInput({
  value, onChange, placeholder,
}: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <span style={{ position: 'absolute', left: '10px', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 700 }}>৳</span>
      <input
        suppressHydrationWarning
        type="number" min="0" placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '8px 10px 8px 26px', border: '1.5px solid #e8edf5', borderRadius: '10px', fontSize: '0.875rem', color: '#1e293b', outline: 'none', background: '#fafbfc', boxSizing: 'border-box' }}
        onFocus={e => (e.target.style.borderColor = '#e91e8c')}
        onBlur={e => (e.target.style.borderColor = '#e8edf5')}
      />
    </div>
  )
}

// ── Edit Price Modal ───────────────────────────────────────────────────────────

function EditPriceModal({
  product, onClose, onSaved,
}: { product: Product; onClose: () => void; onSaved: (id: string, flashPrice: number) => void }) {
  const [price, setPrice]   = useState(String(product.flashSalePrice || Math.round(product.price * 0.8)))
  const [saving, setSaving] = useState(false)

  const disc = discount(product.originalPrice || product.price, Number(price))

  const handleSave = async () => {
    if (!price || Number(price) <= 0) { toast.error('Enter a valid price'); return }
    if (Number(price) >= product.price) { toast.error('Flash price must be lower than regular price'); return }
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/flash-sale/${product._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFlashSale: true, flashSalePrice: Number(price) }),
      })
      if (!res.ok) throw new Error()
      onSaved(product._id, Number(price))
      toast.success('Flash sale price updated!')
      onClose()
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '440px', boxShadow: '0 24px 64px rgba(0,0,0,0.22)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(233,30,140,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tag size={16} color="#e91e8c" />
            </div>
            <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Set Flash Price</p>
          </div>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '9px', border: '1.5px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Product info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '10px', overflow: 'hidden', background: 'rgba(233,30,140,0.05)', flexShrink: 0, border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {product.images[0]
                ? <Image src={product.images[0]} alt={product.name} width={52} height={52} style={{ objectFit: 'cover' }} />
                : <Package size={18} color="#e91e8c" style={{ opacity: 0.4 }} />}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '3px 0 0' }}>
                Regular price: <strong style={{ color: '#475569' }}>৳{product.price.toLocaleString('en-US')}</strong>
                {product.originalPrice > product.price && (
                  <span style={{ textDecoration: 'line-through', marginLeft: '6px', color: '#94a3b8' }}>৳{product.originalPrice.toLocaleString('en-US')}</span>
                )}
              </p>
            </div>
          </div>

          {/* Price input */}
          <div>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', margin: '0 0 8px' }}>Flash Sale Price *</p>
            <PriceInput value={price} onChange={setPrice} placeholder="e.g. 650" />
          </div>

          {/* Discount preview */}
          {Number(price) > 0 && Number(price) < product.price && (
            <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(233,30,140,0.05)', border: '1px solid rgba(233,30,140,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingDown size={15} color="#e91e8c" />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#be185d' }}>Discount preview</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', textDecoration: 'line-through' }}>৳{product.price.toLocaleString('en-US')}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#e91e8c' }}>৳{Number(price).toLocaleString('en-US')}</span>
                <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#e91e8c', color: 'white', fontSize: '0.72rem', fontWeight: 800 }}>-{disc}%</span>
              </div>
            </div>
          )}

          {Number(price) >= product.price && Number(price) > 0 && (
            <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={14} color="#ef4444" />
              <span style={{ fontSize: '0.8rem', color: '#b91c1c' }}>Flash price must be lower than ৳{product.price.toLocaleString('en-US')}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: '10px', padding: '16px 22px', borderTop: '1px solid #f1f5f9', background: '#fafbfc' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '0.875rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            suppressHydrationWarning
            onClick={handleSave}
            disabled={saving || Number(price) >= product.price || !price}
            style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #e91e8c, #f43f5e)', color: 'white', fontSize: '0.875rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving || Number(price) >= product.price || !price ? 0.6 : 1, boxShadow: '0 4px 12px rgba(233,30,140,0.3)' }}
          >
            {saving ? <><Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Saving…</> : <><Save size={14} /> Save Price</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Add Products Modal ─────────────────────────────────────────────────────────

function AddProductsModal({
  existing, onClose, onAdded,
}: { existing: string[]; onClose: () => void; onAdded: () => void }) {
  const [allProducts, setAll]   = useState<Product[]>([])
  const [search,  setSearch]    = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [prices,  setPrices]    = useState<Record<string, string>>({})
  const [loading, setLoading]   = useState(true)
  const [saving,  setSaving]    = useState(false)

  useEffect(() => {
    fetch('/api/admin/flash-sale?type=all')
      .then(r => r.json())
      .then(d => setAll(d.products ?? []))
      .finally(() => setLoading(false))
  }, [])

  const available = allProducts.filter(p =>
    !existing.includes(p._id) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) ||
     p.category.toLowerCase().includes(search.toLowerCase()))
  )

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleAdd = async () => {
    if (selected.size === 0) { toast.error('Select at least one product'); return }
    for (const id of selected) {
      const p  = allProducts.find(p => p._id === id)
      const fp = Number(prices[id])
      if (!fp || fp <= 0 || (p && fp >= p.price)) {
        toast.error(`Set a valid flash price for "${p?.name}"`)
        return
      }
    }
    setSaving(true)
    try {
      await Promise.all([...selected].map(id =>
        fetch(`/api/admin/flash-sale/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isFlashSale: true, flashSalePrice: Number(prices[id]) }),
        })
      ))
      toast.success(`${selected.size} product${selected.size > 1 ? 's' : ''} added to flash sale!`)
      onAdded(); onClose()
    } catch { toast.error('Failed to add products') }
    finally { setSaving(false) }
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '600px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.22)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(233,30,140,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={16} color="#e91e8c" />
            </div>
            <div>
              <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Add to Flash Sale</p>
              <p suppressHydrationWarning style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 0' }}>{selected.size} selected</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '9px', border: '1.5px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
            <X size={14} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '14px 22px', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', border: '1.5px solid #e8edf5', borderRadius: '12px', padding: '0 14px', height: '40px' }}>
            <Search size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
            <input
              suppressHydrationWarning
              type="text" placeholder="Search products…" value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.85rem', color: '#334155' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #f1f5f9', borderTopColor: '#e91e8c', animation: 'spin 0.7s linear infinite', margin: '0 auto 10px' }} />
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>Loading products…</p>
            </div>
          ) : available.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <ShoppingBag size={28} style={{ color: '#cbd5e1', margin: '0 auto 10px', display: 'block' }} />
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>
                {search ? 'No products match your search' : 'All active products are already in the flash sale'}
              </p>
            </div>
          ) : (
            available.map(p => {
              const sel = selected.has(p._id)
              return (
                <div key={p._id}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '12px', marginBottom: '4px', background: sel ? 'rgba(233,30,140,0.04)' : 'transparent', border: `1.5px solid ${sel ? 'rgba(233,30,140,0.2)' : 'transparent'}`, cursor: 'pointer', transition: 'all 0.12s' }}
                  onClick={() => toggle(p._id)}
                >
                  {/* Checkbox */}
                  <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: `2px solid ${sel ? '#e91e8c' : '#e2e8f0'}`, background: sel ? '#e91e8c' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {sel && <span style={{ color: 'white', fontSize: '12px', fontWeight: 900 }}>✓</span>}
                  </div>

                  {/* Image */}
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.images[0]
                      ? <Image src={p.images[0]} alt={p.name} width={44} height={44} style={{ objectFit: 'cover' }} />
                      : <Package size={16} color="#e91e8c" style={{ opacity: 0.4 }} />}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 0' }}>
                      Regular: ৳{p.price.toLocaleString('en-US')} · {CAT_LABELS[p.category] ?? p.category}
                    </p>
                  </div>

                  {/* Price input when selected */}
                  {sel && (
                    <div onClick={e => e.stopPropagation()} style={{ width: '110px', flexShrink: 0 }}>
                      <PriceInput
                        value={prices[p._id] ?? ''}
                        onChange={v => setPrices(prev => ({ ...prev, [p._id]: v }))}
                        placeholder="Sale price"
                      />
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: '10px', padding: '14px 22px', borderTop: '1px solid #f1f5f9', background: '#fafbfc', flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '0.875rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            suppressHydrationWarning
            onClick={handleAdd}
            disabled={saving || selected.size === 0}
            style={{ flex: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #e91e8c, #f43f5e)', color: 'white', fontSize: '0.875rem', fontWeight: 700, cursor: saving || selected.size === 0 ? 'not-allowed' : 'pointer', opacity: saving || selected.size === 0 ? 0.6 : 1, boxShadow: '0 4px 12px rgba(233,30,140,0.3)' }}
          >
            {saving
              ? <><Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Adding…</>
              : <><Zap size={14} /> Add {selected.size > 0 ? selected.size : ''} to Flash Sale</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function FlashSaleClient() {
  const [products,    setProducts]    = useState<Product[]>([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [addModal,    setAddModal]    = useState(false)
  const [removing,    setRemoving]    = useState<string | null>(null)
  const [sortBy,      setSortBy]      = useState('discount')

  const fetchFlashSale = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/flash-sale?type=active')
      const data = await res.json()
      setProducts(data.products ?? [])
    } catch { toast.error('Failed to load flash sale') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchFlashSale() }, [fetchFlashSale])

  const handleRemove = async (id: string) => {
    setRemoving(id)
    try {
      const res = await fetch(`/api/admin/flash-sale/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFlashSale: false }),
      })
      if (!res.ok) throw new Error()
      setProducts(prev => prev.filter(p => p._id !== id))
      toast.success('Removed from flash sale')
    } catch { toast.error('Failed to remove') }
    finally { setRemoving(null) }
  }

  const handlePriceSaved = (id: string, newPrice: number) => {
    setProducts(prev => prev.map(p => p._id === id ? { ...p, flashSalePrice: newPrice } : p))
  }

  const filtered = products
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'discount') return discount(a.originalPrice || a.price, a.flashSalePrice) < discount(b.originalPrice || b.price, b.flashSalePrice) ? 1 : -1
      if (sortBy === 'price')    return a.flashSalePrice - b.flashSalePrice
      if (sortBy === 'stock')    return b.totalStock - a.totalStock
      return 0
    })

  const avgDiscount  = products.length
    ? Math.round(products.reduce((a, p) => a + discount(p.originalPrice || p.price, p.flashSalePrice), 0) / products.length)
    : 0
  const totalSavings = products.reduce((a, p) => a + ((p.originalPrice || p.price) - p.flashSalePrice), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #e91e8c, #f43f5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(233,30,140,0.4)' }}>
              <Zap size={18} color="white" strokeWidth={2.5} />
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>Flash Sale</h1>
          </div>
          <p suppressHydrationWarning style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>
            {products.length} products on sale · Avg {avgDiscount}% off
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* ✅ suppressHydrationWarning on all buttons with onClick */}
          <button
            suppressHydrationWarning
            onClick={fetchFlashSale}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#475569', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            suppressHydrationWarning
            onClick={() => setAddModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #e91e8c, #f43f5e)', color: 'white', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(233,30,140,0.35)' }}
          >
            <Plus size={15} strokeWidth={2.5} /> Add Products
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px' }}>
        {[
          { label: 'On Sale',       value: products.length,                          icon: Zap,         gradient: 'linear-gradient(135deg, #e91e8c, #f43f5e)', bg: 'rgba(233,30,140,0.08)' },
          { label: 'Avg Discount',  value: `${avgDiscount}%`,                        icon: TrendingDown, gradient: 'linear-gradient(135deg, #f59e0b, #f97316)', bg: 'rgba(245,158,11,0.08)' },
          { label: 'Total Savings', value: `৳${totalSavings.toLocaleString('en-US')}`, icon: Tag,      gradient: 'linear-gradient(135deg, #10b981, #059669)', bg: 'rgba(16,185,129,0.08)'  },
          { label: 'Items in Stock',value: products.reduce((a, p) => a + p.totalStock, 0), icon: ShoppingBag, gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', bg: 'rgba(99,102,241,0.08)' },
        ].map(({ label, value, icon: Icon, gradient, bg }) => (
          <div key={label} style={{ background: '#fff', borderRadius: '16px', padding: '18px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 10px ${bg}` }}>
              <Icon size={18} color="white" strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Sort */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 200px', background: '#fff', border: '1.5px solid #e8edf5', borderRadius: '12px', padding: '0 14px', height: '42px' }}>
          <Search size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
          {/* ✅ suppressHydrationWarning on controlled input */}
          <input
            suppressHydrationWarning
            type="text" placeholder="Search flash sale products…" value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.85rem', color: '#334155' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          {/* ✅ suppressHydrationWarning on controlled select */}
          <select
            suppressHydrationWarning
            value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ height: '42px', paddingLeft: '12px', paddingRight: '30px', border: '1.5px solid #e8edf5', borderRadius: '12px', background: '#fff', fontSize: '0.82rem', color: '#334155', outline: 'none', cursor: 'pointer', appearance: 'none' }}
          >
            <option value="discount">Highest Discount</option>
            <option value="price">Lowest Price</option>
            <option value="stock">Most Stock</option>
          </select>
          <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', background: '#fff', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid #f1f5f9', borderTopColor: '#e91e8c', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Loading flash sale…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '80px 20px', textAlign: 'center', background: '#fff', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'rgba(233,30,140,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Zap size={30} color="#e91e8c" style={{ opacity: 0.4 }} />
          </div>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', margin: 0 }}>
            {search ? 'No products match your search' : 'No products in flash sale yet'}
          </p>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '6px 0 20px' }}>
            {search ? 'Try a different search term' : 'Add products to start your flash sale and attract customers'}
          </p>
          {!search && (
            <button
              suppressHydrationWarning
              onClick={() => setAddModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 24px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #e91e8c, #f43f5e)', color: 'white', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(233,30,140,0.35)' }}
            >
              <Plus size={15} /> Add First Product
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
          {filtered.map(p => {
            const disc       = discount(p.originalPrice || p.price, p.flashSalePrice)
            const isRemoving = removing === p._id
            return (
              <div key={p._id}
                style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.09)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)')}
              >
                {/* Image */}
                <div style={{ position: 'relative', aspectRatio: '4/3', background: 'rgba(233,30,140,0.04)', overflow: 'hidden' }}>
                  {p.images[0]
                    ? <Image src={p.images[0]} alt={p.name} fill sizes="(max-width: 768px) 100vw, 260px" style={{ objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={36} color="#e91e8c" style={{ opacity: 0.25 }} /></div>}
                  <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'linear-gradient(135deg, #e91e8c, #f43f5e)', color: 'white', fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(233,30,140,0.4)' }}>
                    -{disc}%
                  </div>
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(15,23,42,0.75)', color: 'white', fontSize: '0.68rem', fontWeight: 700, padding: '3px 9px', borderRadius: '7px', backdropFilter: 'blur(4px)' }}>
                    {p.totalStock} in stock
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: '14px' }}>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 4px', fontWeight: 600 }}>{CAT_LABELS[p.category] ?? p.category}</p>
                  <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', margin: '0 0 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>

                  {/* Prices */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#e91e8c' }}>৳{p.flashSalePrice.toLocaleString('en-US')}</span>
                    <span style={{ fontSize: '0.82rem', color: '#94a3b8', textDecoration: 'line-through' }}>৳{p.price.toLocaleString('en-US')}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 7px', borderRadius: '6px', background: 'rgba(34,197,94,0.08)', color: '#15803d', border: '1px solid rgba(34,197,94,0.2)', marginLeft: 'auto' }}>
                      Save ৳{(p.price - p.flashSalePrice).toLocaleString('en-US')}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      suppressHydrationWarning
                      onClick={() => setEditProduct(p)}
                      style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '8px', borderRadius: '9px', border: '1.5px solid rgba(233,30,140,0.2)', background: 'rgba(233,30,140,0.05)', color: '#e91e8c', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      <Tag size={13} /> Edit Price
                    </button>
                    <button
                      suppressHydrationWarning
                      onClick={() => handleRemove(p._id)}
                      disabled={isRemoving}
                      style={{ width: '36px', height: '36px', borderRadius: '9px', border: '1.5px solid rgba(239,68,68,0.2)', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isRemoving ? 'not-allowed' : 'pointer', color: '#ef4444', flexShrink: 0, opacity: isRemoving ? 0.5 : 1 }}
                    >
                      {isRemoving
                        ? <Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} />
                        : <Trash2 size={13} />}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      {editProduct && <EditPriceModal product={editProduct} onClose={() => setEditProduct(null)} onSaved={handlePriceSaved} />}
      {addModal    && <AddProductsModal existing={products.map(p => p._id)} onClose={() => setAddModal(false)} onAdded={fetchFlashSale} />}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}