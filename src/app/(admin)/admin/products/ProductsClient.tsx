'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Plus, Search, RefreshCw, Edit2, Trash2, X, Upload,
  ChevronDown, ChevronLeft, ChevronRight, Package,
  AlertTriangle, Loader2, Eye,
} from 'lucide-react'
import toast from 'react-hot-toast'

/* ============================================
   BRAND COLOR TOKENS
   Matches globals.css --color-accent family
   (same tokens as the Orders admin page)
   ============================================ */
const ACCENT        = '#CA865D'
const ACCENT_DARK    = '#b5724a'
const ACCENT_TEXT    = '#8a5a3a'          // darker accent for text-on-light-bg contrast
const ACCENT_SOFT    = 'rgba(202,134,93,0.08)'
const ACCENT_SOFT2   = 'rgba(202,134,93,0.07)'
const ACCENT_SOFT3   = 'rgba(202,134,93,0.06)'
const ACCENT_BORDER2 = 'rgba(202,134,93,0.25)'
const ACCENT_BORDER3 = 'rgba(202,134,93,0.3)'
const ACCENT_SHADOW  = 'rgba(202,134,93,0.35)'

// Page background the tab-row / pagination blend into.
const PAGE_BG = '#f8fafc'

// ✅ NEW (parity with OrdersClient): the desktop grid table needs real
// room — thumbnail + name/slug, category badge, price, stock badge,
// status toggle, and two action buttons. Below this we switch to a
// clean stacked card list instead of a squeezed table, exactly like
// the Orders page does.
const MOBILE_BREAKPOINT = 1040

// ✅ NEW: tracks the *actual* viewport width, not just a boolean, so
// things like the search placeholder / font sizes can shrink in more
// than one step on very narrow phones. Starts at a desktop-safe
// default so the first client render matches the server render
// (avoids a hydration mismatch), then corrects itself after mount.
function useViewportWidth() {
  const [width, setWidth] = useState(1280)
  useEffect(() => {
    const check = () => setWidth(window.innerWidth)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return width
}

function useIsMobile(breakpoint = MOBILE_BREAKPOINT) {
  const width = useViewportWidth()
  return width < breakpoint
}

// Builds a compact page-number sequence with ellipses, e.g.
// [1, '…', 4, 5, 6, '…', 12] — always keeps first, last, current,
// and `siblingCount` neighbours on each side of current visible.
// (Identical helper to OrdersClient so both pages paginate the same way.)
function buildPaginationRange(current: number, total: number, siblingCount = 1): (number | 'dots')[] {
  const totalNumbers = siblingCount * 2 + 5
  if (total <= totalNumbers) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const leftIndex = Math.max(current - siblingCount, 1)
  const rightIndex = Math.min(current + siblingCount, total)

  const showLeftDots = leftIndex > 2
  const showRightDots = rightIndex < total - 1

  const range: (number | 'dots')[] = [1]

  if (showLeftDots) range.push('dots')
  for (let i = leftIndex === 1 ? 2 : leftIndex; i <= (rightIndex === total ? total - 1 : rightIndex); i++) {
    if (i > 1 && i < total) range.push(i)
  }
  if (showRightDots) range.push('dots')

  range.push(total)
  return range
}

const ellipsisStyle: React.CSSProperties = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  minWidth: 0,
}

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
    <input suppressHydrationWarning
      type={type} placeholder={placeholder} value={value}
      onChange={e => onChange(e.target.value)}
      style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e8edf5', borderRadius: '10px', fontSize: '0.875rem', color: '#1e293b', outline: 'none', background: '#fafbfc', boxSizing: 'border-box' }}
      onFocus={e => (e.target.style.borderColor = ACCENT)}
      onBlur={e  => (e.target.style.borderColor = '#e8edf5')}
    />
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
      <button suppressHydrationWarning type="button" onClick={() => onChange(!checked)}
        style={{ width: '44px', height: '24px', borderRadius: '12px', background: checked ? ACCENT : '#e2e8f0', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
        <span style={{ position: 'absolute', top: '3px', left: checked ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
      </button>
      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>{label}</span>
    </label>
  )
}

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

  const [saving, setSaving]           = useState(false)
  const [uploading, setUploading]     = useState(false)
  const [fetchingUrl, setFetchingUrl] = useState(false)
  const [imgUrl, setImgUrl]           = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // ✅ NEW: modal's own tighter breakpoint (mirrors OrderModal) so the
  // pricing/settings rows stack cleanly instead of squeezing on phones,
  // independent of the page-level table/card breakpoint above.
  const isMobile = useIsMobile(560)

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

  // Re-uploads a pasted external URL through Cloudinary instead of trusting the
  // raw domain directly — otherwise next/image throws for any hostname not
  // listed in next.config.ts remotePatterns.
  const addUrl = async () => {
    const url = imgUrl.trim()
    if (!url) return
    setFetchingUrl(true)
    try {
      const res  = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      set('images', [...form.images, data.url])
      setImgUrl('')
      toast.success('Image fetched!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Could not fetch that image URL')
    } finally {
      setFetchingUrl(false)
    }
  }

  const removeImg = (i: number) => set('images', form.images.filter((_, idx) => idx !== i))
  const addColor  = () => set('colors', [...form.colors, { name: '', hex: ACCENT, stock: '0' }])
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
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '0' : '16px' }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', width: '100%', maxWidth: '700px',
        // ✅ FIX: on phones the modal now goes full-height/full-width
        // (no side padding, square corners) instead of being a
        // rounded card squeezed into a 16px gutter — that gutter is
        // what was causing content to feel cramped edge-to-edge.
        borderRadius: isMobile ? 0 : '20px',
        height: isMobile ? '100dvh' : 'auto',
        maxHeight: isMobile ? '100dvh' : '92vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.22)', overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #f1f5f9', flexShrink: 0, gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: ACCENT_SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Package size={18} color={ACCENT} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0, ...ellipsisStyle }}>{product ? 'Edit Product' : 'Add New Product'}</p>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 0', ...ellipsisStyle }}>{product ? product.name : 'Add a new bag to your store'}</p>
            </div>
          </div>
          <button suppressHydrationWarning onClick={onClose} style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', flexShrink: 0 }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: isMobile ? '18px 16px' : '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          <section>
            <SectionLabel>Basic Information</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <FInput placeholder="Product name *" value={form.name} onChange={v => set('name', v)} />
              <div style={{ position: 'relative' }}>
                <select suppressHydrationWarning value={form.category} onChange={e => set('category', e.target.value)}
                  style={{ width: '100%', padding: '9px 32px 9px 12px', border: '1.5px solid #e8edf5', borderRadius: '10px', fontSize: '0.875rem', color: '#1e293b', outline: 'none', background: '#fafbfc', cursor: 'pointer', appearance: 'none', boxSizing: 'border-box' }}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              </div>
              <input suppressHydrationWarning placeholder="Short description" value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)}
                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e8edf5', borderRadius: '10px', fontSize: '0.875rem', color: '#1e293b', outline: 'none', background: '#fafbfc', boxSizing: 'border-box' }}
                onFocus={e => (e.target.style.borderColor = ACCENT)} onBlur={e => (e.target.style.borderColor = '#e8edf5')} />
              <textarea suppressHydrationWarning placeholder="Full description" value={form.description} onChange={e => set('description', e.target.value)} rows={3}
                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e8edf5', borderRadius: '10px', fontSize: '0.875rem', color: '#1e293b', outline: 'none', background: '#fafbfc', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                onFocus={e => (e.target.style.borderColor = ACCENT)} onBlur={e => (e.target.style.borderColor = '#e8edf5')} />
            </div>
          </section>

          <section>
            <SectionLabel>Pricing</SectionLabel>
            {/* ✅ FIX: was a rigid '1fr 1fr' grid — on a 320px phone that
                gave each price field ~140px, which was tight for a
                "৳" + label + input. Now it stacks to one column below
                the modal's own breakpoint. */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
              <div><p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', margin: '0 0 6px' }}>Sale Price (৳) *</p><FInput placeholder="e.g. 850" value={form.price} onChange={v => set('price', v)} type="number" /></div>
              <div><p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', margin: '0 0 6px' }}>Original Price (৳)</p><FInput placeholder="e.g. 1200" value={form.originalPrice} onChange={v => set('originalPrice', v)} type="number" /></div>
            </div>
            {disc > 0 && <div style={{ marginTop: '8px', padding: '7px 12px', borderRadius: '8px', background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)', fontSize: '0.78rem', color: '#15803d', fontWeight: 600 }}>💰 {disc}% discount will be shown to customers</div>}
          </section>

          <section>
            <SectionLabel>Product Images</SectionLabel>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <input suppressHydrationWarning ref={fileRef} type="file" accept="image/*" onChange={uploadFile} style={{ display: 'none' }} />
              <button suppressHydrationWarning type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: '1.5px solid #e8edf5', background: '#f8fafc', fontSize: '0.82rem', fontWeight: 600, color: '#475569', cursor: 'pointer', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
                {uploading ? <><Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Uploading…</> : <><Upload size={14} /> Upload Image</>}
              </button>
              <div style={{ display: 'flex', gap: '6px', flex: '1 1 200px' }}>
                <input suppressHydrationWarning type="url" placeholder="Or paste image URL" value={imgUrl} onChange={e => setImgUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUrl())}
                  style={{ flex: 1, minWidth: 0, padding: '8px 12px', border: '1.5px solid #e8edf5', borderRadius: '10px', fontSize: '0.82rem', color: '#1e293b', outline: 'none', background: '#fafbfc' }}
                  onFocus={e => (e.target.style.borderColor = ACCENT)} onBlur={e => (e.target.style.borderColor = '#e8edf5')} />
                <button suppressHydrationWarning onClick={addUrl} type="button" disabled={fetchingUrl}
                  style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', background: ACCENT, color: 'white', fontSize: '0.82rem', fontWeight: 700, cursor: fetchingUrl ? 'not-allowed' : 'pointer', opacity: fetchingUrl ? 0.7 : 1, display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                  {fetchingUrl && <Loader2 size={12} style={{ animation: 'spin 0.7s linear infinite' }} />}
                  {fetchingUrl ? 'Fetching…' : 'Add'}
                </button>
              </div>
            </div>
            {form.images.length > 0 ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 72 : 88}px, 1fr))`, gap: '8px' }}>
                  {form.images.map((url, i) => (
                    <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '10px', overflow: 'hidden', border: `2px solid ${i === 0 ? ACCENT : '#f1f5f9'}` }}>
                      <Image src={url} alt="" fill sizes="88px" style={{ objectFit: 'cover' }} />
                      {i === 0 && (
                        <span style={{ position: 'absolute', top: '4px', left: '4px', background: ACCENT, color: 'white', fontSize: '0.52rem', fontWeight: 800, padding: '2px 5px', borderRadius: '4px', zIndex: 1 }}>MAIN</span>
                      )}
                      <button suppressHydrationWarning onClick={() => removeImg(i)}
                        style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(15,23,42,0.75)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                        <X size={10} />
                      </button>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', gap: '8px', flexWrap: 'wrap' }}>
              <SectionLabel>Color Variants & Stock</SectionLabel>
              <button suppressHydrationWarning type="button" onClick={addColor} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '8px', border: `1.5px solid ${ACCENT_BORDER2}`, background: ACCENT_SOFT3, fontSize: '0.78rem', fontWeight: 700, color: ACCENT_TEXT, cursor: 'pointer', flexShrink: 0 }}>
                <Plus size={13} /> Add Color
              </button>
            </div>
            {form.colors.length === 0
              ? <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>No color variants yet. Click &quot;Add Color&quot; to define colors with per-color stock.</p>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {form.colors.map((c, i) => (
                    // ✅ FIX: was a rigid single row (swatch + name input +
                    // 80px stock input + remove button) that overflowed
                    // horizontally below ~380px. Now wraps the name field
                    // onto its own line on phones while keeping swatch /
                    // stock / remove together on the compact row.
                    <div key={i} style={{ display: 'flex', flexWrap: isMobile ? 'wrap' : 'nowrap', alignItems: 'center', gap: '8px' }}>
                      <input suppressHydrationWarning type="color" value={c.hex} onChange={e => updColor(i, 'hex', e.target.value)} style={{ width: '38px', height: '38px', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '2px', flexShrink: 0 }} />
                      <input suppressHydrationWarning placeholder="Color name (e.g. Rose Pink)" value={c.name} onChange={e => updColor(i, 'name', e.target.value)}
                        style={{ flex: isMobile ? '1 1 100%' : 1, minWidth: 0, order: isMobile ? 3 : 0, padding: '8px 12px', border: '1.5px solid #e8edf5', borderRadius: '10px', fontSize: '0.85rem', color: '#1e293b', outline: 'none', background: '#fafbfc' }}
                        onFocus={e => (e.target.style.borderColor = ACCENT)} onBlur={e => (e.target.style.borderColor = '#e8edf5')} />
                      <input suppressHydrationWarning type="number" placeholder="Stock" value={c.stock} min="0" onChange={e => updColor(i, 'stock', e.target.value)}
                        style={{ width: '80px', flexShrink: 0, padding: '8px 10px', border: '1.5px solid #e8edf5', borderRadius: '10px', fontSize: '0.85rem', color: '#1e293b', outline: 'none', background: '#fafbfc' }}
                        onFocus={e => (e.target.style.borderColor = ACCENT)} onBlur={e => (e.target.style.borderColor = '#e8edf5')} />
                      <button suppressHydrationWarning onClick={() => rmColor(i)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid #fee2e2', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444', flexShrink: 0 }}><X size={14} /></button>
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
              <Toggle label="Active — visible on store"    checked={form.isActive}    onChange={v => set('isActive', v)} />
              <Toggle label="Featured — shown on homepage" checked={form.isFeatured}  onChange={v => set('isFeatured', v)} />
              <Toggle label="Flash Sale"                   checked={form.isFlashSale} onChange={v => set('isFlashSale', v)} />
              {form.isFlashSale && (
                <div style={{ marginLeft: isMobile ? 0 : '54px' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', padding: isMobile ? '14px 16px' : '16px 24px', borderTop: '1px solid #f1f5f9', flexShrink: 0, background: '#fafbfc' }}>
          <button suppressHydrationWarning onClick={onClose} style={{ flex: isMobile ? 1 : 'none', padding: '9px 20px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '0.875rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>Cancel</button>
          <button suppressHydrationWarning onClick={handleSave} disabled={saving}
            style={{ flex: isMobile ? 1 : 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px 24px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`, color: 'white', fontSize: '0.875rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.75 : 1, boxShadow: `0 4px 12px ${ACCENT_SHADOW}` }}>
            {saving && <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} />}
            {saving ? 'Saving…' : product ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </div>
    </div>
  )
}

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

  // ✅ NEW (parity with OrdersClient): real viewport width + derived
  // mobile flag, used to switch the desktop grid table over to a
  // stacked card list and to shrink the search placeholder in steps.
  const viewportWidth = useViewportWidth()
  const isMobile = viewportWidth < MOBILE_BREAKPOINT

  const searchPlaceholder =
    viewportWidth < 360 ? 'Search products…'
    : viewportWidth < 480 ? 'Search name or slug…'
    : 'Search order #, product name…'

  const limit = 10

  // Scroll-fade state for the status tabs row (mirrors OrdersClient) —
  // without it, the tabs just look cut off on narrow screens instead
  // of clearly scrollable.
  const tabsRef = useRef<HTMLDivElement>(null)
  const [tabsScroll, setTabsScroll] = useState({ left: false, right: false })

  const updateTabsScroll = useCallback(() => {
    const el = tabsRef.current
    if (!el) return
    setTabsScroll({
      left: el.scrollLeft > 4,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    })
  }, [])

  useEffect(() => {
    const el = tabsRef.current
    if (!el) return
    const recheck = () => requestAnimationFrame(() => requestAnimationFrame(updateTabsScroll))
    recheck()
    el.addEventListener('scroll', updateTabsScroll, { passive: true })
    const ro = new ResizeObserver(recheck)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateTabsScroll)
      ro.disconnect()
    }
  }, [updateTabsScroll])

  useEffect(() => {
    // Reads the initial category filter out of the URL once on mount —
    // a legitimate one-time sync from an external source (the URL) into
    // React state.
    const params = new URLSearchParams(window.location.search)
    const cat = params.get('category')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (cat) setCat(cat)
  }, [])

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

  useEffect(() => {
    // Genuine data-fetching effect — fetchProducts() calls setLoading(true)
    // synchronously before its first await, tripping this experimental rule
    // as a false positive.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts()
  }, [fetchProducts])
  useEffect(() => {
    // Resets pagination whenever the filters change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1)
  }, [search, catFilter, statFilter])

  // Recheck tab-fade state once the tab row's content settles.
  useEffect(() => {
    updateTabsScroll()
  }, [updateTabsScroll, total])

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

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>Products</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '4px 0 0' }}>{total} total products · Manage your store inventory</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
          <button suppressHydrationWarning onClick={fetchProducts}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, flex: isMobile ? '0 0 auto' : 'none' }}>
            <RefreshCw size={14} style={{ opacity: loading ? 0.5 : 1 }} />
            {!isMobile && 'Refresh'}
          </button>
          <button suppressHydrationWarning onClick={openAdd}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '9px 18px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`, color: 'white', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 14px ${ACCENT_SHADOW}`, flex: isMobile ? 1 : 'none' }}>
            <Plus size={15} strokeWidth={2.5} /> Add Product
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>

        {/* Status Tabs — horizontally scrollable with edge fades on narrow screens */}
        <div style={{ position: 'relative', borderBottom: '1px solid #f1f5f9' }}>
          <div
            ref={tabsRef}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '16px 20px 0', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {tabs.map(t => (
              <button suppressHydrationWarning key={t.value} onClick={() => setStat(t.value)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: '8px 8px 0 0',
                  border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                  whiteSpace: 'nowrap', flexShrink: 0,
                  background: statFilter === t.value ? '#fff' : 'transparent',
                  color: statFilter === t.value ? '#0f172a' : '#64748b',
                  borderBottom: statFilter === t.value ? `2px solid ${ACCENT}` : '2px solid transparent',
                  marginBottom: '-1px', transition: 'all 0.15s',
                }}>
                {t.color && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: t.color, flexShrink: 0 }} />}
                {t.label}
              </button>
            ))}
          </div>
          {tabsScroll.left && (
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '24px', background: `linear-gradient(to right, #fff, rgba(255,255,255,0))`, pointerEvents: 'none' }} />
          )}
          {tabsScroll.right && (
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '24px', background: `linear-gradient(to left, #fff, rgba(255,255,255,0))`, pointerEvents: 'none' }} />
          )}
        </div>

        {/* Search + Category Filter */}
        <div style={{ display: 'flex', gap: '10px', padding: '16px 20px', borderBottom: '1px solid #f8fafc', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 260px', background: '#f8fafc', border: '1.5px solid #f1f5f9', borderRadius: '10px', padding: '0 14px', height: '40px' }}>
            <Search size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
            <input suppressHydrationWarning type="text" placeholder={searchPlaceholder} value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: viewportWidth < 360 ? '0.8rem' : '0.85rem', color: '#334155' }} />
            {search && <button suppressHydrationWarning onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex', flexShrink: 0 }}><X size={13} /></button>}
          </div>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <select suppressHydrationWarning value={catFilter} onChange={e => setCat(e.target.value)}
              style={{ height: '40px', paddingLeft: '12px', paddingRight: '32px', border: '1.5px solid #f1f5f9', borderRadius: '10px', background: '#f8fafc', fontSize: '0.82rem', color: '#334155', outline: 'none', cursor: 'pointer', appearance: 'none', maxWidth: isMobile ? '160px' : 'none' }}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          </div>
        </div>

        {isMobile ? (
          /* ══════════════════════════════════════════
             MOBILE / TABLET CARD LIST
             Same pattern as OrdersClient: every product is its own
             bordered card with stacked, truncated rows so nothing can
             ever visually collide, regardless of viewport width.
             ══════════════════════════════════════════ */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px' }}>
            {loading && (
              <div style={{ padding: '50px 20px', textAlign: 'center' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #f1f5f9', borderTopColor: ACCENT, animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Loading products…</p>
              </div>
            )}

            {!loading && products.length === 0 && (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: ACCENT_SOFT3, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <Package size={22} color={ACCENT} style={{ opacity: 0.5 }} />
                </div>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', margin: 0 }}>No products found</p>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '6px 0 20px' }}>
                  {search || catFilter ? 'Try adjusting your filters' : 'Add your first bag to start selling'}
                </p>
                {!search && !catFilter && (
                  <button suppressHydrationWarning onClick={openAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', border: 'none', background: ACCENT, color: 'white', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>
                    <Plus size={15} /> Add First Product
                  </button>
                )}
              </div>
            )}

            {!loading && products.map(p => {
              const cat   = CATEGORIES.find(c => c.value === p.category)
              const isLow = p.totalStock > 0 && p.totalStock <= 5
              const isOut = p.totalStock === 0
              return (
                <div key={p._id} style={{
                  display: 'flex', flexDirection: 'column', gap: '10px',
                  background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9',
                  padding: '14px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}>
                  {/* Row 1: thumbnail + name/slug + featured/sale tags */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '10px', overflow: 'hidden', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {p.images[0]
                        ? <Image src={p.images[0]} alt={p.name} width={46} height={46} style={{ objectFit: 'cover' }} />
                        : <Package size={17} color={ACCENT} style={{ opacity: 0.4 }} />}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', margin: 0, ...ellipsisStyle }}>{p.name}</p>
                      <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '2px 0 0', fontFamily: 'monospace', ...ellipsisStyle }}>/{p.slug}</p>
                      {(p.isFeatured || p.isFlashSale) && (
                        <div style={{ display: 'flex', gap: '5px', marginTop: '5px', flexWrap: 'wrap' }}>
                          {p.isFeatured  && <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(245,158,11,0.1)', color: '#b45309' }}>⭐ Featured</span>}
                          {p.isFlashSale && <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(239,68,68,0.08)', color: '#dc2626' }}>🔥 Sale</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 2: category + price + stock badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingLeft: '56px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 600, padding: '3px 9px', borderRadius: '20px', background: '#f1f5f9', color: '#475569', whiteSpace: 'nowrap' }}>
                      {cat?.emoji} {cat?.label ?? p.category}
                    </span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px',
                      background: isOut ? 'rgba(239,68,68,0.08)' : isLow ? 'rgba(245,158,11,0.08)' : 'rgba(34,197,94,0.08)',
                      color: isOut ? '#dc2626' : isLow ? '#d97706' : '#16a34a', whiteSpace: 'nowrap',
                    }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isOut ? '#dc2626' : isLow ? '#d97706' : '#16a34a', flexShrink: 0 }} />
                      {isOut ? 'Out of stock' : `${p.totalStock} in stock`}
                    </span>
                  </div>

                  {/* Row 3: price, active toggle, edit/delete — split by a divider */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', paddingTop: '10px', borderTop: '1px solid #f8fafc' }}>
                    <div>
                      <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>৳{p.price.toLocaleString()}</p>
                      {p.originalPrice > p.price && <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '1px 0 0', textDecoration: 'line-through' }}>৳{p.originalPrice.toLocaleString()}</p>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      <button suppressHydrationWarning onClick={() => toggleActive(p)} aria-label="Toggle active"
                        style={{ width: '40px', height: '22px', borderRadius: '11px', background: p.isActive ? ACCENT : '#e2e8f0', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                        <span style={{ position: 'absolute', top: '2px', left: p.isActive ? '20px' : '2px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
                      </button>
                      <button suppressHydrationWarning onClick={() => openEdit(p)}
                        style={{ width: '34px', height: '34px', borderRadius: '9px', border: '1.5px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', flexShrink: 0 }}>
                        <Edit2 size={14} />
                      </button>
                      <button suppressHydrationWarning onClick={() => setDelId(p._id)}
                        style={{ width: '34px', height: '34px', borderRadius: '9px', border: '1.5px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', flexShrink: 0 }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* ══════════════════════════════════════════
             DESKTOP GRID TABLE
             Wrapped in a horizontal-scroll container as a safety net,
             plus per-cell ellipsis truncation, so long names/slugs can
             never spill into a neighbouring column.
             ══════════════════════════════════════════ */
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: '820px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr 150px 120px 90px 100px 90px', columnGap: '12px', padding: '10px 20px', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', background: '#fafbfc', borderBottom: '1px solid #f1f5f9' }}>
                <span></span><span>Product</span><span>Category</span><span>Price</span><span>Stock</span><span>Status</span><span style={{ textAlign: 'right' }}>Actions</span>
              </div>

              {loading && (
                <div style={{ padding: '60px', textAlign: 'center' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #f1f5f9', borderTopColor: ACCENT, animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Loading products…</p>
                </div>
              )}

              {!loading && products.length === 0 && (
                <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: ACCENT_SOFT3, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Package size={26} color={ACCENT} style={{ opacity: 0.5 }} />
                  </div>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', margin: 0 }}>No products found</p>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '6px 0 20px' }}>
                    {search || catFilter ? 'Try adjusting your filters' : 'Add your first bag to start selling'}
                  </p>
                  {!search && !catFilter && (
                    <button suppressHydrationWarning onClick={openAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', border: 'none', background: ACCENT, color: 'white', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>
                      <Plus size={15} /> Add First Product
                    </button>
                  )}
                </div>
              )}

              {!loading && products.map((p, i) => {
                const cat   = CATEGORIES.find(c => c.value === p.category)
                const isLow = p.totalStock > 0 && p.totalStock <= 5
                const isOut = p.totalStock === 0
                return (
                  <div key={p._id}
                    style={{ display: 'grid', gridTemplateColumns: '52px 1fr 150px 120px 90px 100px 90px', columnGap: '12px', padding: '14px 20px', borderBottom: i < products.length - 1 ? '1px solid #f8fafc' : 'none', alignItems: 'center', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fafbfc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>

                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {p.images[0]
                        ? <Image src={p.images[0]} alt={p.name} width={40} height={40} style={{ objectFit: 'cover' }} />
                        : <Package size={15} color={ACCENT} style={{ opacity: 0.4 }} />}
                    </div>

                    <div style={{ minWidth: 0, paddingRight: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: 0, ...ellipsisStyle }}>{p.name}</p>
                        {p.isFeatured  && <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '1px 5px', borderRadius: '4px', background: 'rgba(245,158,11,0.1)', color: '#b45309', flexShrink: 0 }}>⭐ Featured</span>}
                        {p.isFlashSale && <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '1px 5px', borderRadius: '4px', background: 'rgba(239,68,68,0.08)', color: '#dc2626', flexShrink: 0 }}>🔥 Sale</span>}
                      </div>
                      <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 0', fontFamily: 'monospace', ...ellipsisStyle }}>/{p.slug}</p>
                    </div>

                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', background: '#f1f5f9', color: '#475569', width: 'fit-content', maxWidth: '100%', ...ellipsisStyle }}>
                      {cat?.emoji} {cat?.label ?? p.category}
                    </span>

                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: 0, ...ellipsisStyle }}>৳{p.price.toLocaleString()}</p>
                      {p.originalPrice > p.price && <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '1px 0 0', textDecoration: 'line-through', ...ellipsisStyle }}>৳{p.originalPrice.toLocaleString()}</p>}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontSize: '0.78rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px',
                        background: isOut ? 'rgba(239,68,68,0.08)' : isLow ? 'rgba(245,158,11,0.08)' : 'rgba(34,197,94,0.08)',
                        color: isOut ? '#dc2626' : isLow ? '#d97706' : '#16a34a', whiteSpace: 'nowrap',
                      }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isOut ? '#dc2626' : isLow ? '#d97706' : '#16a34a', flexShrink: 0 }} />
                        {p.totalStock}
                      </span>
                      <p style={{ fontSize: '0.65rem', color: '#94a3b8', margin: '3px 0 0' }}>
                        {isOut ? 'Out of stock' : isLow ? 'Low stock' : 'In stock'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <button suppressHydrationWarning onClick={() => toggleActive(p)}
                        style={{ width: '40px', height: '22px', borderRadius: '11px', background: p.isActive ? ACCENT : '#e2e8f0', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                        <span style={{ position: 'absolute', top: '2px', left: p.isActive ? '20px' : '2px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
                      </button>
                      <span style={{ fontSize: '0.65rem', color: p.isActive ? '#16a34a' : '#94a3b8', fontWeight: 600 }}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button suppressHydrationWarning onClick={() => openEdit(p)}
                        style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', flexShrink: 0 }}
                        onMouseEnter={e => { e.currentTarget.style.background = ACCENT_SOFT2; e.currentTarget.style.borderColor = ACCENT_BORDER2; e.currentTarget.style.color = ACCENT }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' }}>
                        <Edit2 size={13} />
                      </button>
                      <button suppressHydrationWarning onClick={() => setDelId(p._id)}
                        style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', flexShrink: 0 }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; e.currentTarget.style.color = '#ef4444' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Pagination ──
          Identical pill-style pager to OrdersClient: single row on
          desktop with First/Last shortcuts, stacked + progress bar on
          mobile, dynamic ellipsis range via buildPaginationRange(). */}
      {pages > 1 && (
        <div style={{
          display: 'flex', flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap', gap: isMobile ? '12px' : '14px',
          padding: isMobile ? '14px 16px' : '10px 16px',
          background: '#fff', border: '1px solid #f1f5f9', borderRadius: isMobile ? '18px' : '16px',
          boxShadow: isMobile ? '0 4px 16px rgba(15,23,42,0.05)' : '0 1px 2px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: isMobile ? 'center' : 'flex-start' }}>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap' }}>
              Showing <strong style={{ color: '#1e293b', fontWeight: 700 }}>{(page - 1) * limit + 1}–{Math.min(page * limit, total)}</strong> of <strong style={{ color: '#1e293b', fontWeight: 700 }}>{total}</strong>
            </p>
            {isMobile && (
              <div style={{ width: '120px', height: '4px', borderRadius: '999px', background: '#f1f5f9', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '999px',
                  width: `${(page / pages) * 100}%`,
                  background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_DARK})`,
                  transition: 'width 0.25s ease',
                }} />
              </div>
            )}
          </div>

          <div style={{
            display: 'flex', gap: isMobile ? '6px' : '4px', alignItems: 'center',
            justifyContent: isMobile ? 'center' : 'flex-start',
            background: '#f8fafc', border: '1px solid #f1f5f9',
            borderRadius: isMobile ? '16px' : '12px', padding: isMobile ? '6px' : '4px',
          }}>
            {!isMobile && (
              <button suppressHydrationWarning
                onClick={() => setPage(1)}
                disabled={page === 1}
                aria-label="First page"
                style={{
                  height: '32px', padding: '0 10px', borderRadius: '9px', border: 'none',
                  background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.35 : 1,
                  color: '#475569', fontSize: '0.72rem', fontWeight: 700, transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (page !== 1) e.currentTarget.style.background = '#fff' }}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                First
              </button>
            )}

            <button suppressHydrationWarning
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              style={{
                width: isMobile ? '38px' : '32px', height: isMobile ? '38px' : '32px',
                borderRadius: isMobile ? '12px' : '9px',
                border: isMobile ? `1.5px solid ${page === 1 ? '#e8edf5' : ACCENT_BORDER2}` : 'none',
                background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.35 : 1,
                color: page === 1 ? '#475569' : (isMobile ? ACCENT : '#475569'),
                transition: 'background 0.15s, transform 0.1s', flexShrink: 0,
              }}
              onMouseEnter={e => { if (page !== 1 && !isMobile) e.currentTarget.style.background = '#fff' }}
              onMouseLeave={e => { if (!isMobile) e.currentTarget.style.background = 'transparent' }}
            >
              <ChevronLeft size={isMobile ? 17 : 15} />
            </button>

            {buildPaginationRange(page, pages, isMobile ? 0 : 1).map((p, i) =>
              p === 'dots' ? (
                <span key={`dots-${i}`} style={{
                  width: isMobile ? '20px' : '28px', height: isMobile ? '38px' : '32px',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: '#cbd5e1',
                  fontSize: '0.78rem', fontWeight: 800, letterSpacing: '1px', flexShrink: 0,
                }}>
                  •••
                </span>
              ) : (
                <button suppressHydrationWarning
                  key={p}
                  onClick={() => setPage(p)}
                  aria-current={page === p ? 'page' : undefined}
                  style={{
                    width: isMobile ? '38px' : '32px', height: isMobile ? '38px' : '32px',
                    borderRadius: isMobile ? '12px' : '9px', border: 'none',
                    background: page === p ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` : 'transparent',
                    color: page === p ? '#fff' : '#475569',
                    fontWeight: page === p ? 800 : 600, fontSize: isMobile ? '0.88rem' : '0.82rem', cursor: 'pointer',
                    flexShrink: 0, transition: 'transform 0.15s, background 0.15s, box-shadow 0.15s',
                    boxShadow: page === p
                      ? isMobile
                        ? `0 4px 14px ${ACCENT_SHADOW}, 0 0 0 4px ${ACCENT_SOFT}`
                        : `0 3px 10px ${ACCENT_SHADOW}`
                      : 'none',
                    transform: page === p ? (isMobile ? 'scale(1.1)' : 'scale(1.06)') : 'scale(1)',
                  }}
                  onMouseEnter={e => { if (page !== p && !isMobile) e.currentTarget.style.background = '#fff' }}
                  onMouseLeave={e => { if (page !== p && !isMobile) e.currentTarget.style.background = 'transparent' }}
                >
                  {p}
                </button>
              )
            )}

            <button suppressHydrationWarning
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              aria-label="Next page"
              style={{
                width: isMobile ? '38px' : '32px', height: isMobile ? '38px' : '32px',
                borderRadius: isMobile ? '12px' : '9px',
                border: isMobile ? `1.5px solid ${page === pages ? '#e8edf5' : ACCENT_BORDER2}` : 'none',
                background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: page === pages ? 'not-allowed' : 'pointer', opacity: page === pages ? 0.35 : 1,
                color: page === pages ? '#475569' : (isMobile ? ACCENT : '#475569'),
                transition: 'background 0.15s, transform 0.1s', flexShrink: 0,
              }}
              onMouseEnter={e => { if (page !== pages && !isMobile) e.currentTarget.style.background = '#fff' }}
              onMouseLeave={e => { if (!isMobile) e.currentTarget.style.background = 'transparent' }}
            >
              <ChevronRight size={isMobile ? 17 : 15} />
            </button>

            {!isMobile && (
              <button suppressHydrationWarning
                onClick={() => setPage(pages)}
                disabled={page === pages}
                aria-label="Last page"
                style={{
                  height: '32px', padding: '0 10px', borderRadius: '9px', border: 'none',
                  background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: page === pages ? 'not-allowed' : 'pointer', opacity: page === pages ? 0.35 : 1,
                  color: '#475569', fontSize: '0.72rem', fontWeight: 700, transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (page !== pages) e.currentTarget.style.background = '#fff' }}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                Last
              </button>
            )}
          </div>
        </div>
      )}

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
              <button suppressHydrationWarning onClick={() => setDelId(null)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '0.875rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>Cancel</button>
              <button suppressHydrationWarning onClick={() => handleDelete(delId)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#ef4444', color: 'white', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <ProductModal product={editing} onClose={() => setModalOpen(false)} onSaved={fetchProducts} />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}