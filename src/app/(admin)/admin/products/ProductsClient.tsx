'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Plus, Search, RefreshCw, Edit2, Trash2, X, Upload,
  ChevronDown, ChevronLeft, ChevronRight, Package,
  AlertTriangle, Loader2, 
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ColorVariant { name: string; hex: string; stock: number }

interface Product {
  _id: string; name: string; slug: string
  shortDescription: string; description: string
  price: number; originalPrice: number; category: string
  images: string[]; colors: ColorVariant[]
  totalStock: number; isActive: boolean
  isFeatured: boolean; isFlashSale: boolean; flashSalePrice: number
  tags: string[]; soldCount: number; createdAt: string
}

interface FormState {
  name: string; shortDescription: string; description: string
  price: string; originalPrice: string; category: string
  images: string[]; colors: { name: string; hex: string; stock: string }[]
  totalStock: string; isActive: boolean; isFeatured: boolean
  isFlashSale: boolean; flashSalePrice: string; tags: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'mini-crossbody', label: 'Mini Crossbody', emoji: '👛' },
  { value: 'chain-strap',    label: 'Chain Strap',    emoji: '✨' },
  { value: 'leather',        label: 'Leather',        emoji: '💼' },
  { value: 'canvas',         label: 'Canvas',         emoji: '🎒' },
  { value: 'party',          label: 'Party & Evening', emoji: '💖' },
]

const EMPTY: FormState = {
  name: '', shortDescription: '', description: '',
  price: '', originalPrice: '', category: 'mini-crossbody',
  images: [], colors: [], totalStock: '',
  isActive: true, isFeatured: false, isFlashSale: false,
  flashSalePrice: '', tags: '',
}

// ── Small Helpers ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>
      {children}
    </p>
  )
}

function FInput({ placeholder, value, onChange, type = 'text' }: {
  placeholder: string; value: string; onChange: (v: string) => void; type?: string
}) {
  return (
    <input
      type={type} placeholder={placeholder} value={value}
      onChange={e => onChange(e.target.value)}
      style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e8edf5', borderRadius: '10px', fontSize: '0.875rem', color: '#1e293b', outline: 'none', background: '#fafbfc', boxSizing: 'border-box' }}
      onFocus={e => (e.target.style.borderColor = '#e91e8c')}
      onBlur={e  => (e.target.style.borderColor = '#e8edf5')}
    />
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
      <button type="button" onClick={() => onChange(!checked)}
        style={{ width: '44px', height: '24px', borderRadius: '12px', background: checked ? '#e91e8c' : '#e2e8f0', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
        <span style={{ position: 'absolute', top: '3px', left: checked ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
      </button>
      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>{label}</span>
    </label>
  )
}

// ── Product Modal ─────────────────────────────────────────────────────────────

function ProductModal({ product, onClose, onSaved }: {
  product: Product | null; onClose: () => void; onSaved: () => void
}) {
  const [form, setForm] = useState<FormState>(
    product ? {
      name: product.name, shortDescription: product.shortDescription,
      description: product.description, price: String(product.price),
      originalPrice: String(product.originalPrice || ''), category: product.category,
      images: [...product.images],
      colors: product.colors.map(c => ({ ...c, stock: String(c.stock) })),
      totalStock: String(product.totalStock), isActive: product.isActive,
      isFeatured: product.isFeatured, isFlashSale: product.isFlashSale,
      flashSalePrice: String(product.flashSalePrice || ''), tags: product.tags.join(', '),
    } : EMPTY
  )

  const [saving, setSaving]       = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imgUrl, setImgUrl]       = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (k: keyof FormState, v: unknown) => setForm(p => ({ ...p, [k]: v }))

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res  = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      set('images', [...form.images, data.url])
      toast.success('Image uploaded!')
    } catch { toast.error('Upload failed') }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }

  const addUrl   = () => { const url = imgUrl.trim(); if (!url) return; set('images', [...form.images, url]); setImgUrl('') }
  const removeImg = (i: number) => set('images', form.images.filter((_, idx) => idx !== i))
  const addColor  = () => set('colors', [...form.colors, { name: '', hex: '#e91e8c', stock: '0' }])
  const rmColor   = (i: number) => set('colors', form.colors.filter((_, idx) => idx !== i))
  const updColor  = (i: number, f: string, v: string) => set('colors', form.colors.map((c, idx) => idx === i ? { ...c, [f]: v } : c))

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) { toast.error('Name and price are required'); return }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(), shortDescription: form.shortDescription.trim(),
        description: form.description.trim(), price: Number(form.price),
        originalPrice: Number(form.originalPrice) || 0, category: form.category,
        images: form.images, colors: form.colors.map(c => ({ name: c.name, hex: c.hex, stock: Number(c.stock) || 0 })),
        totalStock: Number(form.totalStock) || 0, isActive: form.isActive,
        isFeatured: form.isFeatured, isFlashSale: form.isFlashSale,
        flashSalePrice: Number(form.flashSalePrice) || 0,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      }
      const url    = product ? `/api/admin/products/${product._id}` : '/api/admin/products'
      const method = product ? 'PATCH' : 'POST'
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data   = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(product ? '✅ Product updated!' : '✅ Product created!')
      onSaved(); onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally { setSaving(false) }
  }

  const disc = form.price && form.originalPrice && Number(form.originalPrice) > Number(form.price)
    ? Math.round((1 - Number(form.price) / Number(form.originalPrice)) * 100) : 0

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '700px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.22)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(233,30,140,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={18} color="#e91e8c" />
            </div>
            <div>
              <p style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{product ? 'Edit Product' : 'Add New Product'}</p>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 0' }}>{product ? product.name : 'Add a new bag to your store'}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <section>
            <SectionLabel>Basic Information</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <FInput placeholder="Product name *" value={form.name} onChange={v => set('name', v)} />
              <div style={{ position: 'relative' }}>
                <select value={form.category} onChange={e => set('category', e.target.value)}
                  style={{ width: '100%', padding: '9px 32px 9px 12px', border: '1.5px solid #e8edf5', borderRadius: '10px', fontSize: '0.875rem', color: '#1e293b', outline: 'none', background: '#fafbfc', cursor: 'pointer', appearance: 'none', boxSizing: 'border-box' }}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              </div>
              <input placeholder="Short description" value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)}
                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e8edf5', borderRadius: '10px', fontSize: '0.875rem', color: '#1e293b', outline: 'none', background: '#fafbfc', boxSizing: 'border-box' }}
                onFocus={e => (e.target.style.borderColor = '#e91e8c')} onBlur={e => (e.target.style.borderColor = '#e8edf5')} />
              <textarea placeholder="Full description" value={form.description} onChange={e => set('description', e.target.value)} rows={3}
                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e8edf5', borderRadius: '10px', fontSize: '0.875rem', color: '#1e293b', outline: 'none', background: '#fafbfc', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                onFocus={e => (e.target.style.borderColor = '#e91e8c')} onBlur={e => (e.target.style.borderColor = '#e8edf5')} />
            </div>
          </section>

          <section>
            <SectionLabel>Pricing</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', margin: '0 0 6px' }}>Sale Price (৳) *</p><FInput placeholder="e.g. 850" value={form.price} onChange={v => set('price', v)} type="number" /></div>
              <div><p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', margin: '0 0 6px' }}>Original Price (৳)</p><FInput placeholder="e.g. 1200" value={form.originalPrice} onChange={v => set('originalPrice', v)} type="number" /></div>
            </div>
            {disc > 0 && <div style={{ marginTop: '8px', padding: '7px 12px', borderRadius: '8px', background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)', fontSize: '0.78rem', color: '#15803d', fontWeight: 600 }}>💰 {disc}% discount will be shown to customers</div>}
          </section>

          <section>
            <SectionLabel>Product Images</SectionLabel>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <input ref={fileRef} type="file" accept="image/*" onChange={uploadFile} style={{ display: 'none' }} />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: '1.5px solid #e8edf5', background: '#f8fafc', fontSize: '0.82rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                {uploading ? <><Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Uploading…</> : <><Upload size={14} /> Upload Image</>}
              </button>
              <div style={{ display: 'flex', gap: '6px', flex: '1 1 200px' }}>
                <input type="url" placeholder="Or paste image URL" value={imgUrl} onChange={e => setImgUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUrl())}
                  style={{ flex: 1, padding: '8px 12px', border: '1.5px solid #e8edf5', borderRadius: '10px', fontSize: '0.82rem', color: '#1e293b', outline: 'none', background: '#fafbfc' }}
                  onFocus={e => (e.target.style.borderColor = '#e91e8c')} onBlur={e => (e.target.style.borderColor = '#e8edf5')} />
                <button onClick={addUrl} type="button" style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', background: '#e91e8c', color: 'white', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>Add</button>
              </div>
            </div>
            {form.images.length > 0 ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: '8px' }}>
                  {form.images.map((url, i) => (
                    <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '10px', overflow: 'hidden', border: `2px solid ${i === 0 ? '#e91e8c' : '#f1f5f9'}` }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {i === 0 && <span style={{ position: 'absolute', top: '4px', left: '4px', background: '#e91e8c', color: 'white', fontSize: '0.52rem', fontWeight: 800, padding: '2px 5px', borderRadius: '4px' }}>MAIN</span>}
                      <button onClick={() => removeImg(i)} style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(15,23,42,0.75)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={10} /></button>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '6px 0 0' }}>First image is the main display image.</p>
              </>
            ) : (
              <div style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                <Package size={28} style={{ margin: '0 auto 8px', opacity: 0.3, display: 'block' }} />
                <p style={{ fontSize: '0.82rem', margin: 0 }}>Upload or paste image URLs above</p>
              </div>
            )}
          </section>

          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <SectionLabel>Color Variants & Stock</SectionLabel>
              <button type="button" onClick={addColor} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '8px', border: '1.5px solid rgba(233,30,140,0.25)', background: 'rgba(233,30,140,0.06)', fontSize: '0.78rem', fontWeight: 700, color: '#e91e8c', cursor: 'pointer' }}>
                <Plus size={13} /> Add Color
              </button>
            </div>
            {form.colors.length === 0
              ? <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>No color variants yet. Click "Add Color" to define colors with per-color stock.</p>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {form.colors.map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="color" value={c.hex} onChange={e => updColor(i, 'hex', e.target.value)} style={{ width: '38px', height: '38px', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '2px', flexShrink: 0 }} />
                      <input placeholder="Color name (e.g. Rose Pink)" value={c.name} onChange={e => updColor(i, 'name', e.target.value)}
                        style={{ flex: 1, padding: '8px 12px', border: '1.5px solid #e8edf5', borderRadius: '10px', fontSize: '0.85rem', color: '#1e293b', outline: 'none', background: '#fafbfc' }}
                        onFocus={e => (e.target.style.borderColor = '#e91e8c')} onBlur={e => (e.target.style.borderColor = '#e8edf5')} />
                      <input type="number" placeholder="Stock" value={c.stock} min="0" onChange={e => updColor(i, 'stock', e.target.value)}
                        style={{ width: '80px', padding: '8px 10px', border: '1.5px solid #e8edf5', borderRadius: '10px', fontSize: '0.85rem', color: '#1e293b', outline: 'none', background: '#fafbfc' }}
                        onFocus={e => (e.target.style.borderColor = '#e91e8c')} onBlur={e => (e.target.style.borderColor = '#e8edf5')} />
                      <button onClick={() => rmColor(i)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid #fee2e2', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444', flexShrink: 0 }}><X size={14} /></button>
                    </div>
                  ))}
                </div>
            }
            <div style={{ marginTop: '12px' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', margin: '0 0 6px' }}>Total Stock (overall count)</p>
              <FInput placeholder="e.g. 50" value={form.totalStock} onChange={v => set('totalStock', v)} type="number" />
            </div>
          </section>

          <section>
            <SectionLabel>Settings</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Toggle label="Active — visible on store"      checked={form.isActive}   onChange={v => set('isActive', v)} />
              <Toggle label="Featured — shown on homepage"   checked={form.isFeatured} onChange={v => set('isFeatured', v)} />
              <Toggle label="Flash Sale"                     checked={form.isFlashSale} onChange={v => set('isFlashSale', v)} />
              {form.isFlashSale && (
                <div style={{ marginLeft: '54px' }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', margin: '0 0 6px' }}>Flash Sale Price (৳)</p>
                  <FInput placeholder="e.g. 600" value={form.flashSalePrice} onChange={v => set('flashSalePrice', v)} type="number" />
                </div>
              )}
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', margin: '0 0 6px' }}>Tags (comma separated)</p>
                <FInput placeholder="e.g. trending, gift, new-arrival" value={form.tags} onChange={v => set('tags', v)} />
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', padding: '16px 24px', borderTop: '1px solid #f1f5f9', flexShrink: 0, background: '#fafbfc' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '0.875rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 24px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #e91e8c, #f43f5e)', color: 'white', fontSize: '0.875rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.75 : 1, boxShadow: '0 4px 12px rgba(233,30,140,0.35)' }}>
            {saving && <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} />}
            {saving ? 'Saving…' : product ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ProductsClient() {
  const [products,  setProducts]  = useState<Product[]>([])
  const [total,     setTotal]     = useState(0)
  const [page,      setPage]      = useState(1)
  const [pages,     setPages]     = useState(1)
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [catFilter, setCat]       = useState('')
  const [statFilter,setStat]      = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing,   setEditing]   = useState<Product | null>(null)
  const [delId,     setDelId]     = useState<string | null>(null)

  const limit = 20

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ page: String(page), limit: String(limit), search, category: catFilter, status: statFilter })
      const res = await fetch(`/api/admin/products?${p}`)
      const d   = await res.json()
      setProducts(d.products ?? [])
      setTotal(d.total ?? 0)
      setPages(d.pages  ?? 1)
    } catch { toast.error('Failed to load products') }
    finally  { setLoading(false) }
  }, [page, search, catFilter, statFilter])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => { setPage(1) }, [search, catFilter, statFilter])

  const openAdd  = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (p: Product) => { setEditing(p); setModalOpen(true) }

  const toggleActive = async (p: Product) => {
    try {
      await fetch(`/api/admin/products/${p._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !p.isActive }) })
      setProducts(prev => prev.map(x => x._id === p._id ? { ...x, isActive: !p.isActive } : x))
      toast.success(p.isActive ? 'Hidden from store' : 'Now visible on store')
    } catch { toast.error('Failed to update') }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setProducts(prev => prev.filter(p => p._id !== id))
      setTotal(prev => prev - 1)
      setDelId(null)
      toast.success('Product deleted')
    } catch { toast.error('Delete failed') }
  }

  const tabs = [
    { label: 'All',      value: '',         count: total },
    { label: 'Active',   value: 'active',   color: '#22c55e' },
    { label: 'Inactive', value: 'inactive', color: '#94a3b8' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>Products</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '4px 0 0' }}>
            {total} total products · Manage your store inventory
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={fetchProducts}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={openAdd}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #e91e8c, #f43f5e)', color: 'white', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(233,30,140,0.3)' }}>
            <Plus size={15} strokeWidth={2.5} /> Add Product
          </button>
        </div>
      </div>

      {/* ── Main Card ── */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>

        {/* Status Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '16px 20px 0', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button key={t.value} onClick={() => setStat(t.value)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '8px 8px 0 0',
                border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                background: statFilter === t.value ? '#fff' : 'transparent',
                color: statFilter === t.value ? '#0f172a' : '#64748b',
                borderBottom: statFilter === t.value ? '2px solid #e91e8c' : '2px solid transparent',
                marginBottom: '-1px', transition: 'all 0.15s',
              }}>
              {t.color && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: t.color, flexShrink: 0 }} />}
              {t.label}
            </button>
          ))}
        </div>

        {/* Search + Category Filter */}
        <div style={{ display: 'flex', gap: '10px', padding: '16px 20px', borderBottom: '1px solid #f8fafc', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 260px', background: '#f8fafc', border: '1.5px solid #f1f5f9', borderRadius: '10px', padding: '0 14px', height: '40px' }}>
            <Search size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
            <input type="text" placeholder="Search order #, product name…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.85rem', color: '#334155' }} />
            {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}><X size={13} /></button>}
          </div>

          <div style={{ position: 'relative' }}>
            <select value={catFilter} onChange={e => setCat(e.target.value)}
              style={{ height: '40px', paddingLeft: '12px', paddingRight: '32px', border: '1.5px solid #f1f5f9', borderRadius: '10px', background: '#f8fafc', fontSize: '0.82rem', color: '#334155', outline: 'none', cursor: 'pointer', appearance: 'none' }}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Table Head */}
        <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr 150px 120px 90px 100px 90px', padding: '10px 20px', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', background: '#fafbfc', borderBottom: '1px solid #f1f5f9' }}>
          <span></span>
          <span>Product</span>
          <span>Category</span>
          <span>Price</span>
          <span>Stock</span>
          <span>Status</span>
          <span style={{ textAlign: 'right' }}>Actions</span>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #f1f5f9', borderTopColor: '#e91e8c', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Loading products…</p>
          </div>
        )}

        {/* Empty */}
        {!loading && products.length === 0 && (
          <div style={{ padding: '80px 20px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(233,30,140,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Package size={26} color="#e91e8c" style={{ opacity: 0.5 }} />
            </div>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', margin: 0 }}>No products found</p>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '6px 0 20px' }}>
              {search || catFilter ? 'Try adjusting your filters' : 'Add your first bag to start selling'}
            </p>
            {!search && !catFilter && (
              <button onClick={openAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#e91e8c', color: 'white', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>
                <Plus size={15} /> Add First Product
              </button>
            )}
          </div>
        )}

        {/* Rows */}
        {!loading && products.map((p, i) => {
          const cat   = CATEGORIES.find(c => c.value === p.category)
          const isLow = p.totalStock > 0 && p.totalStock <= 5
          const isOut = p.totalStock === 0

          return (
            <div key={p._id}
              style={{ display: 'grid', gridTemplateColumns: '52px 1fr 150px 120px 90px 100px 90px', padding: '14px 20px', borderBottom: i < products.length - 1 ? '1px solid #f8fafc' : 'none', alignItems: 'center', transition: 'background 0.1s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#fafbfc')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>

              {/* Image */}
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {p.images[0]
                  ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <Package size={15} color="#e91e8c" style={{ opacity: 0.4 }} />}
              </div>

              {/* Name + slug */}
              <div style={{ minWidth: 0, paddingRight: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                  {p.isFeatured && <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '1px 5px', borderRadius: '4px', background: 'rgba(245,158,11,0.1)', color: '#b45309', flexShrink: 0 }}>⭐ Featured</span>}
                  {p.isFlashSale && <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '1px 5px', borderRadius: '4px', background: 'rgba(239,68,68,0.08)', color: '#dc2626', flexShrink: 0 }}>🔥 Sale</span>}
                </div>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 0', fontFamily: 'monospace' }}>/{p.slug}</p>
              </div>

              {/* Category badge */}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', background: '#f1f5f9', color: '#475569', width: 'fit-content' }}>
                {cat?.emoji} {cat?.label ?? p.category}
              </span>

              {/* Price */}
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>৳{p.price.toLocaleString()}</p>
                {p.originalPrice > p.price && (
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '1px 0 0', textDecoration: 'line-through' }}>৳{p.originalPrice.toLocaleString()}</p>
                )}
              </div>

              {/* Stock */}
              <div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  fontSize: '0.78rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px',
                  background: isOut ? 'rgba(239,68,68,0.08)' : isLow ? 'rgba(245,158,11,0.08)' : 'rgba(34,197,94,0.08)',
                  color: isOut ? '#dc2626' : isLow ? '#d97706' : '#16a34a',
                }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isOut ? '#dc2626' : isLow ? '#d97706' : '#16a34a', flexShrink: 0 }} />
                  {p.totalStock}
                </span>
                <p style={{ fontSize: '0.65rem', color: '#94a3b8', margin: '3px 0 0' }}>
                  {isOut ? 'Out of stock' : isLow ? 'Low stock' : 'In stock'}
                </p>
              </div>

              {/* Active Toggle */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <button onClick={() => toggleActive(p)}
                  style={{ width: '40px', height: '22px', borderRadius: '11px', background: p.isActive ? '#e91e8c' : '#e2e8f0', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                  <span style={{ position: 'absolute', top: '2px', left: p.isActive ? '20px' : '2px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
                </button>
                <span style={{ fontSize: '0.65rem', color: p.isActive ? '#16a34a' : '#94a3b8', fontWeight: 600 }}>
                  {p.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                <button onClick={() => openEdit(p)}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.07)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.color = '#6366f1' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' }}>
                  <Edit2 size={13} />
                </button>
                <button onClick={() => setDelId(p._id)}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; e.currentTarget.style.color = '#ef4444' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          )
        })}

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
              Showing <strong style={{ color: '#0f172a' }}>{(page-1)*limit+1}–{Math.min(page*limit,total)}</strong> of <strong style={{ color: '#0f172a' }}>{total}</strong> products
            </p>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: page===1?'not-allowed':'pointer', opacity: page===1?0.4:1, color: '#475569' }}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                let n = i+1
                if (pages>5) { if (page<=3) n=i+1; else if (page>=pages-2) n=pages-4+i; else n=page-2+i }
                return (
                  <button key={n} onClick={() => setPage(n)}
                    style={{ width: '34px', height: '34px', borderRadius: '8px', border: `1px solid ${page===n?'rgba(233,30,140,0.3)':'#e2e8f0'}`, background: page===n?'rgba(233,30,140,0.08)':'#fff', color: page===n?'#e91e8c':'#475569', fontWeight: page===n?700:500, fontSize: '0.82rem', cursor: 'pointer' }}>
                    {n}
                  </button>
                )
              })}
              <button onClick={() => setPage(p => Math.min(pages,p+1))} disabled={page===pages}
                style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: page===pages?'not-allowed':'pointer', opacity: page===pages?0.4:1, color: '#475569' }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      {delId && (
        <div onClick={() => setDelId(null)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px', padding: '28px', maxWidth: '360px', width: '100%', boxShadow: '0 24px 48px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={22} color="#ef4444" />
            </div>
            <p style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>Delete Product?</p>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 24px', lineHeight: 1.6 }}>This action is permanent and cannot be undone.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDelId(null)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '0.875rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleDelete(delId)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#ef4444', color: 'white', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {modalOpen && (
        <ProductModal product={editing} onClose={() => setModalOpen(false)} onSaved={fetchProducts} />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}