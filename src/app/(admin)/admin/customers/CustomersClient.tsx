'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Search, RefreshCw, X, ChevronLeft, ChevronRight,
  ChevronDown, Users, ShoppingBag, TrendingUp,
  Mail, Calendar, Eye, Package, Clock, Check,
} from 'lucide-react'

/* ============================================
   BRAND COLOR TOKENS
   Matches globals.css --color-accent family
   (same tokens as the Products / Orders admin pages)
   ============================================ */
const ACCENT        = '#CA865D'
const ACCENT_DARK    = '#b5724a'
const ACCENT_TEXT    = '#8a5a3a'          // darker accent for text-on-light-bg contrast
const ACCENT_SOFT    = 'rgba(202,134,93,0.08)'
const ACCENT_SOFT2   = 'rgba(202,134,93,0.07)'
const ACCENT_SOFT3   = 'rgba(202,134,93,0.06)'
const ACCENT_BORDER2 = 'rgba(202,134,93,0.25)'
const ACCENT_BORDER3 = 'rgba(202,134,93,0.3)'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Customer {
  _id: string
  name: string
  email: string
  image?: string
  createdAt: string
  orderCount: number
  totalSpent: number
  lastOrder: string | null
}

interface OrderSummary {
  _id: string
  orderNumber: string
  total: number
  status: string
  createdAt: string
  items: { name: string; quantity: number }[]
}

interface CustomerDetail {
  user: Omit<Customer, 'orderCount' | 'totalSpent' | 'lastOrder'>
  orders: OrderSummary[]
}

// ── Constants ──────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { bg: string; text: string; dot: string }> = {
  pending:    { bg: 'rgba(234,179,8,0.08)',  text: '#b45309', dot: '#f59e0b' },
  processing: { bg: ACCENT_SOFT,             text: ACCENT_TEXT, dot: ACCENT },
  shipped:    { bg: 'rgba(59,130,246,0.08)', text: '#1d4ed8', dot: '#3b82f6' },
  delivered:  { bg: 'rgba(34,197,94,0.08)',  text: '#15803d', dot: '#22c55e' },
  cancelled:  { bg: 'rgba(239,68,68,0.08)',  text: '#b91c1c', dot: '#ef4444' },
}

const SORT_OPTS = [
  { v: '-createdAt',  l: 'Newest First' },
  { v: 'createdAt',   l: 'Oldest First' },
  { v: '-totalSpent', l: 'Top Spenders' },
]

// ✅ NEW: below this width the customer table has no room to lay out
// six columns cleanly (avatar+name, email, order count, spent, joined
// date, action button) — that's exactly what the screenshot shows:
// header labels merging into "CUSTOMEREMAILORDERS" and row content
// wrapping over itself. Below this breakpoint we render stacked cards
// instead, same pattern as the Orders admin page.
const MOBILE_BREAKPOINT = 860

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

// ── Helpers ────────────────────────────────────────────────────────────────────

// ✅ Always format dates with explicit locale 'en-GB' to avoid server/client mismatch
function fmt(dateStr: string, opts: Intl.DateTimeFormatOptions) {
  return new Date(dateStr).toLocaleDateString('en-GB', opts)
}

// ── Avatar ─────────────────────────────────────────────────────────────────────

function Avatar({ name, image, size = 40 }: { name: string; image?: string; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const colors   = [ACCENT, '#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6']
  const color    = colors[name.charCodeAt(0) % colors.length]

  if (image) return (
    <Image
      src={image}
      alt={name}
      width={size}
      height={size}
      style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
    />
  )
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${color}, ${color}cc)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: 800,
      fontSize: size > 36 ? '1rem' : '0.72rem',
    }}>
      {initials}
    </div>
  )
}

// ── Dropdown ───────────────────────────────────────────────────────────────────
// Same visual language as the "All Payments" filter on the Orders admin page:
// a pill-shaped trigger button, and a floating rounded panel with a soft
// accent highlight + checkmark on the selected row — instead of the
// browser's native <select> popup, which can't be themed.
interface DropdownOption { value: string; label: string }

function Dropdown({
  value, options, onChange, fullWidth = false,
}: {
  value: string
  options: DropdownOption[]
  onChange: (v: string) => void
  fullWidth?: boolean
}) {
  const [open, setOpen] = useState(false)
  // ✅ FIX: the panel used to be `position: absolute` inside this
  // wrapper, which meant any ancestor with `overflow: hidden` (or the
  // viewport edge on narrow screens) could clip its rounded corners
  // and cut it off mid-panel. Anchoring it with `position: fixed` and
  // computed viewport coordinates makes it escape all ancestor
  // clipping — it's only ever bounded by the screen itself, and we
  // clamp the left edge so it never runs past the right side either.
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null)
  const btnRef   = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const openDropdown = () => {
    if (open) { setOpen(false); return }
    const rect = btnRef.current?.getBoundingClientRect()
    if (rect) {
      const panelWidth = fullWidth ? rect.width : Math.max(rect.width, 190)
      const maxLeft = window.innerWidth - panelWidth - 8
      const left = Math.max(8, Math.min(rect.left, maxLeft))
      setCoords({ top: rect.bottom + 6, left, width: rect.width })
    }
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return
      if (panelRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    const closeOnScrollOrResize = () => setOpen(false)
    const escHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', escHandler)
    window.addEventListener('scroll', closeOnScrollOrResize, true)
    window.addEventListener('resize', closeOnScrollOrResize)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', escHandler)
      window.removeEventListener('scroll', closeOnScrollOrResize, true)
      window.removeEventListener('resize', closeOnScrollOrResize)
    }
  }, [open])

  const selected = options.find(o => o.value === value)

  return (
    <div style={{ position: 'relative', width: fullWidth ? '100%' : 'auto', flexShrink: 0 }}>
      <button
        suppressHydrationWarning
        ref={btnRef}
        type="button"
        onClick={openDropdown}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          width: fullWidth ? '100%' : 'auto',
          height: '42px', padding: '0 14px',
          borderRadius: '12px',
          border: `1.5px solid ${open ? ACCENT_BORDER3 : '#f1f5f9'}`,
          background: open ? ACCENT_SOFT : '#f8fafc',
          fontSize: '0.85rem', fontWeight: 700,
          color: open ? ACCENT_TEXT : '#334155',
          cursor: 'pointer', whiteSpace: 'nowrap',
          boxSizing: 'border-box', transition: 'background 0.15s, border-color 0.15s',
        }}
      >
        <span style={{ flex: fullWidth ? 1 : 'none', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {selected ? selected.label : 'Select…'}
        </span>
        <ChevronDown size={14} style={{ flexShrink: 0, color: open ? ACCENT : '#94a3b8', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      {open && coords && (
        <div ref={panelRef} style={{
          position: 'fixed', top: coords.top, left: coords.left, zIndex: 1000,
          width: fullWidth ? coords.width : undefined,
          minWidth: fullWidth ? coords.width : '190px',
          background: '#fff', borderRadius: '14px',
          border: '1px solid #f1f5f9',
          boxShadow: '0 16px 40px rgba(15,23,42,0.16)',
          padding: '6px', maxHeight: '280px', overflowY: 'auto',
        }}>
          {options.map(o => {
            const active = o.value === value
            return (
              <button
                suppressHydrationWarning
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%', padding: '9px 12px', border: 'none',
                  borderRadius: '9px',
                  background: active ? ACCENT_SOFT : 'transparent',
                  color: active ? ACCENT_TEXT : '#334155',
                  fontSize: '0.85rem', fontWeight: active ? 700 : 600,
                  cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f8fafc' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.label}</span>
                {active && <Check size={14} color={ACCENT} style={{ flexShrink: 0 }} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

const SORT_DROPDOWN_OPTIONS: DropdownOption[] = SORT_OPTS.map(o => ({ value: o.v, label: o.l }))

// ── Customer Detail Modal ──────────────────────────────────────────────────────

function CustomerModal({
  customerId, customerName, onClose,
}: { customerId: string; customerName: string; onClose: () => void }) {
  const [detail, setDetail]   = useState<CustomerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const viewportWidth = useViewportWidth()
  const isMobile = viewportWidth < 560

  useEffect(() => {
    fetch(`/api/admin/customers/${customerId}`)
      .then(r => r.json())
      .then(d => setDetail(d))
      .finally(() => setLoading(false))
  }, [customerId])

  const totalSpent = detail?.orders.reduce((a, o) => a + o.total, 0) ?? 0
  const delivered  = detail?.orders.filter(o => o.status === 'delivered').length ?? 0

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '640px',
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.22)', overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid #f1f5f9', flexShrink: 0, gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            {detail && <Avatar name={detail.user.name} image={detail.user.image} size={44} />}
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{customerName}</p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0' }}>Customer Profile</p>
            </div>
          </div>
          <button
            suppressHydrationWarning
            onClick={onClose}
            style={{
              width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
              border: '1.5px solid #e2e8f0', background: '#f8fafc',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#64748b',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                border: '3px solid #f1f5f9', borderTopColor: ACCENT,
                animation: 'spin 0.7s linear infinite', margin: '0 auto 12px',
              }} />
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Loading customer data…</p>
            </div>
          ) : detail ? (
            <>
              {/* Contact Info */}
              <div style={{
                background: '#f8fafc', borderRadius: '14px', padding: '16px',
                border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '10px',
              }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Contact Information
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <Mail size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
                  <span style={{
                    fontSize: '0.875rem', color: '#334155', fontWeight: 500,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0,
                  }}>{detail.user.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Calendar size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.875rem', color: '#334155' }}>
                    {/* ✅ explicit locale prevents server/client date mismatch */}
                    Joined {fmt(detail.user.createdAt, { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)', gap: isMobile ? '8px' : '12px' }}>
                {[
                  { label: 'Total Orders', value: detail.orders.length,          icon: ShoppingBag, color: '#6366f1', bg: 'rgba(99,102,241,0.08)'  },
                  { label: 'Total Spent',  value: `৳${totalSpent.toLocaleString('en-US')}`, icon: TrendingUp,  color: ACCENT, bg: ACCENT_SOFT },
                  { label: 'Delivered',    value: delivered,                      icon: Package,     color: '#10b981', bg: 'rgba(16,185,129,0.08)'  },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} style={{
                    background: '#f8fafc', borderRadius: '14px', padding: isMobile ? '10px 6px' : '16px',
                    border: '1px solid #f1f5f9', textAlign: 'center', minWidth: 0,
                  }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px', background: bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px',
                    }}>
                      <Icon size={16} style={{ color }} />
                    </div>
                    {/* ✅ div instead of p to avoid invalid nesting */}
                    <div style={{
                      fontSize: isMobile ? '0.92rem' : '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{value}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '3px 0 0' }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Order History */}
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                  Order History ({detail.orders.length})
                </div>
                {detail.orders.length === 0 ? (
                  <div style={{
                    padding: '32px', textAlign: 'center', background: '#f8fafc',
                    borderRadius: '14px', border: '1px solid #f1f5f9',
                  }}>
                    <ShoppingBag size={28} style={{ color: '#cbd5e1', margin: '0 auto 10px', display: 'block' }} />
                    <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>No orders yet</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {detail.orders.map(order => {
                      const cfg = STATUS_CFG[order.status] ?? STATUS_CFG.processing
                      return (
                        <div key={order._id} style={{
                          display: 'flex', flexWrap: isMobile ? 'wrap' : 'nowrap',
                          alignItems: 'center', gap: '12px',
                          padding: '14px 16px', background: '#f8fafc',
                          borderRadius: '12px', border: '1px solid #f1f5f9',
                        }}>
                          <div style={{
                            width: '38px', height: '38px', borderRadius: '10px',
                            background: ACCENT_SOFT2,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            <ShoppingBag size={14} color={ACCENT} />
                          </div>
                          <div style={{ flex: 1, minWidth: isMobile ? '120px' : 0 }}>
                            <div style={{
                              fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', margin: 0,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              #{order.orderNumber}
                            </div>
                            <div style={{
                              fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 0',
                              display: 'flex', alignItems: 'center', gap: '4px',
                            }}>
                              <Clock size={10} style={{ flexShrink: 0 }} />
                              {fmt(order.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}
                              {' · '}
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            fontSize: '0.72rem', fontWeight: 700, padding: '4px 9px',
                            borderRadius: '8px', background: cfg.bg, color: cfg.text, whiteSpace: 'nowrap',
                            flexShrink: 0,
                          }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: 0, flexShrink: 0 }}>
                            ৳{order.total.toLocaleString('en-US')}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <p style={{ textAlign: 'center', color: '#94a3b8' }}>Failed to load customer details.</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function CustomersClient() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [total,     setTotal]     = useState(0)
  const [page,      setPage]      = useState(1)
  const [pages,     setPages]     = useState(1)
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [sort,      setSort]      = useState('-createdAt')
  const [modalId,   setModalId]   = useState<string | null>(null)
  const [modalName, setModalName] = useState('')

  // ✅ NEW: drives the table → stacked-cards switch below.
  const viewportWidth = useViewportWidth()
  const isMobile = viewportWidth < MOBILE_BREAKPOINT

  const limit = 20

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const p   = new URLSearchParams({ page: String(page), limit: String(limit), search, sort })
      const res  = await fetch(`/api/admin/customers?${p}`)
      const data = await res.json()
      setCustomers(data.customers ?? [])
      setTotal(data.total  ?? 0)
      setPages(data.pages  ?? 1)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page, search, sort])

  useEffect(() => {
    // Genuine data-fetching effect — fetchCustomers() calls setLoading(true)
    // synchronously before its first await, tripping this experimental rule
    // as a false positive (data fetching is React's own documented use case
    // for useEffect: https://react.dev/learn/synchronizing-with-effects#fetching-data).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCustomers()
  }, [fetchCustomers])
  useEffect(() => {
    // Resets pagination whenever the filters change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1)
  }, [search, sort])

  const openModal = (c: Customer) => { setModalId(c._id); setModalName(c.name) }

  // Summary stats — computed from fetched data only, no locale-sensitive values
  const totalSpent = customers.reduce((a, c) => a + c.totalSpent, 0)
  const withOrders = customers.filter(c => c.orderCount > 0).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>
            Customers
          </h1>
          {/* ✅ suppressHydrationWarning on dynamic text derived from fetched state */}
          <p suppressHydrationWarning style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '4px 0 0' }}>
            {total} registered customers · {withOrders} have placed orders
          </p>
        </div>
        {/* ✅ suppressHydrationWarning on the button — its onClick ref differs SSR vs client */}
        <button
          suppressHydrationWarning
          onClick={fetchCustomers}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '9px 16px', borderRadius: '10px',
            border: '1.5px solid #e2e8f0', background: '#fff',
            color: '#475569', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
          }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {/* ✅ FIX: single column on mobile (isMobile) instead of the
          auto-fit(minmax(140px,1fr)) grid, which was still cramming
          two-per-row at narrow widths and squeezing the revenue figure
          ("৳10,…") into ellipsis. */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
        {[
          { label: 'Total Customers', value: total,                                    icon: Users,       gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', bg: 'rgba(99,102,241,0.08)'  },
          { label: 'With Orders',     value: withOrders,                               icon: ShoppingBag, gradient: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`, bg: ACCENT_SOFT },
          { label: 'Total Revenue',   value: `৳${totalSpent.toLocaleString('en-US')}`, icon: TrendingUp,  gradient: 'linear-gradient(135deg, #10b981, #059669)', bg: 'rgba(16,185,129,0.08)'  },
        ].map(({ label, value, icon: Icon, gradient, bg }) => (
          <div key={label} style={{
            background: '#fff', borderRadius: '16px', padding: '16px',
            border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0,
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px', background: gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, boxShadow: `0 4px 12px ${bg}`,
            }}>
              <Icon size={20} color="white" strokeWidth={2} />
            </div>
            <div style={{ minWidth: 0 }}>
              {/* ✅ div instead of p — avoids invalid nesting if this renders inside another p */}
              <div style={{
                fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', lineHeight: 1,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{value}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          flex: '1 1 220px', background: '#f8fafc',
          border: '1.5px solid #f1f5f9', borderRadius: '12px',
          padding: '0 14px', height: '42px',
        }}>
          <Search size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <input
            suppressHydrationWarning
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.85rem', color: '#334155' }}
          />
          {search && (
            <button
              suppressHydrationWarning
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex', flexShrink: 0 }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* ✅ FIX: was a native <select> (browser-default popup, no
            checkmark, system font/highlight colour) — now the same
            pill-trigger + floating rounded-panel dropdown used on the
            Orders and Products pages. */}
        <Dropdown value={sort} onChange={setSort} options={SORT_DROPDOWN_OPTIONS} />
      </div>

      {/* ── Customer list: stacked cards on narrow screens, grid table
          from MOBILE_BREAKPOINT up ── */}
      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {loading && (
            <div style={{ padding: '60px 20px', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                border: '3px solid #f1f5f9', borderTopColor: ACCENT,
                animation: 'spin 0.7s linear infinite', margin: '0 auto 12px',
              }} />
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Loading customers…</p>
            </div>
          )}

          {!loading && customers.length === 0 && (
            <div style={{ padding: '60px 20px', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px',
                background: ACCENT_SOFT3,
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
              }}>
                <Users size={22} color={ACCENT} style={{ opacity: 0.5 }} />
              </div>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', margin: 0 }}>No customers found</p>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '6px 0 0' }}>
                {search ? 'Try a different search term' : 'Customers will appear here once people register'}
              </p>
            </div>
          )}

          {!loading && customers.map(c => (
            <button
              suppressHydrationWarning
              key={c._id}
              onClick={() => openModal(c)}
              style={{
                display: 'flex', flexDirection: 'column', gap: '10px',
                background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9',
                padding: '14px 16px', textAlign: 'left', cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)', width: '100%',
              }}
            >
              {/* Row 1: avatar + name/email, view icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Avatar name={c.name} image={c.image} size={38} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontSize: '0.88rem', fontWeight: 700, color: '#1e293b',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {c.name}
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px',
                    fontSize: '0.75rem', color: '#94a3b8',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    <Mail size={11} style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</span>
                  </div>
                </div>
                <span style={{
                  width: '30px', height: '30px', borderRadius: '9px', flexShrink: 0,
                  border: '1.5px solid #e2e8f0', background: '#f8fafc',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b',
                }}>
                  <Eye size={13} />
                </span>
              </div>

              {/* Row 2: orders / spent / joined */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
                paddingTop: '10px', borderTop: '1px solid #f8fafc',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    minWidth: '26px', height: '22px', borderRadius: '7px', padding: '0 6px',
                    background: c.orderCount > 0 ? ACCENT_SOFT : '#f8fafc',
                    fontSize: '0.74rem', fontWeight: 800, flexShrink: 0,
                    color: c.orderCount > 0 ? ACCENT_TEXT : '#94a3b8',
                  }}>
                    {c.orderCount}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>orders</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: c.totalSpent > 0 ? '#0f172a' : '#94a3b8', whiteSpace: 'nowrap' }}>
                  {c.totalSpent > 0 ? `৳${c.totalSpent.toLocaleString('en-US')}` : '—'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {fmt(c.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div style={{
          background: '#fff', borderRadius: '16px',
          border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden',
        }}>
          {/* Safety-net horizontal scroll — same pattern as the Orders
              table — in case a viewport lands right at the boundary. */}
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: '680px' }}>
              {/* Head */}
              <div style={{
                display: 'grid', gridTemplateColumns: '2fr 1.5fr 80px 110px 110px 56px',
                padding: '11px 20px', fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                background: '#fafbfc', borderBottom: '1px solid #f1f5f9',
              }}>
                <span>Customer</span>
                <span>Email</span>
                <span>Orders</span>
                <span>Total Spent</span>
                <span>Joined</span>
                <span />
              </div>

              {/* Loading */}
              {loading && (
                <div style={{ padding: '60px', textAlign: 'center' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    border: '3px solid #f1f5f9', borderTopColor: ACCENT,
                    animation: 'spin 0.7s linear infinite', margin: '0 auto 12px',
                  }} />
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Loading customers…</p>
                </div>
              )}

              {/* Empty */}
              {!loading && customers.length === 0 && (
                <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '18px',
                    background: ACCENT_SOFT3,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                  }}>
                    <Users size={26} color={ACCENT} style={{ opacity: 0.5 }} />
                  </div>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', margin: 0 }}>No customers found</p>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '6px 0 0' }}>
                    {search ? 'Try a different search term' : 'Customers will appear here once people register'}
                  </p>
                </div>
              )}

              {/* Rows */}
              {!loading && customers.map((c, i) => (
                <div
                  key={c._id}
                  style={{
                    display: 'grid', gridTemplateColumns: '2fr 1.5fr 80px 110px 110px 56px',
                    padding: '13px 20px',
                    borderBottom: i < customers.length - 1 ? '1px solid #f8fafc' : 'none',
                    alignItems: 'center', transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fafbfc')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Name + Avatar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <Avatar name={c.name} image={c.image} size={38} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.875rem', fontWeight: 700, color: '#1e293b',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {c.name}
                      </div>
                      {c.lastOrder && (
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px', whiteSpace: 'nowrap' }}>
                          {/* ✅ explicit locale */}
                          Last order {fmt(c.lastOrder, { day: 'numeric', month: 'short' })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                    <Mail size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                    <div style={{
                      fontSize: '0.8rem', color: '#64748b',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {c.email}
                    </div>
                  </div>

                  {/* Orders */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      minWidth: '28px', height: '24px', borderRadius: '7px', padding: '0 7px',
                      background: c.orderCount > 0 ? ACCENT_SOFT : '#f8fafc',
                      fontSize: '0.8rem', fontWeight: 800,
                      color: c.orderCount > 0 ? ACCENT_TEXT : '#94a3b8',
                    }}>
                      {c.orderCount}
                    </div>
                  </div>

                  {/* Spent */}
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: c.totalSpent > 0 ? '#0f172a' : '#94a3b8', whiteSpace: 'nowrap' }}>
                    {c.totalSpent > 0 ? `৳${c.totalSpent.toLocaleString('en-US')}` : '—'}
                  </div>

                  {/* Joined */}
                  <div style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {/* ✅ explicit locale */}
                    {fmt(c.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>

                  {/* View */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                      suppressHydrationWarning
                      onClick={() => openModal(c)}
                      style={{
                        width: '32px', height: '32px', borderRadius: '9px',
                        border: '1.5px solid #e2e8f0', background: '#f8fafc',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#64748b', flexShrink: 0,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background     = ACCENT_SOFT2
                        e.currentTarget.style.borderColor    = ACCENT_BORDER2
                        e.currentTarget.style.color          = ACCENT
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background     = '#f8fafc'
                        e.currentTarget.style.borderColor    = '#e2e8f0'
                        e.currentTarget.style.color          = '#64748b'
                      }}
                    >
                      <Eye size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div style={{
          display: 'flex', flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
        }}>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, textAlign: isMobile ? 'center' : 'left' }}>
            Showing{' '}
            <strong style={{ color: '#1e293b' }}>{(page - 1) * limit + 1}–{Math.min(page * limit, total)}</strong>
            {' '}of{' '}
            <strong style={{ color: '#1e293b' }}>{total}</strong> customers
          </p>
          <div style={{ display: 'flex', gap: '6px', justifyContent: isMobile ? 'center' : 'flex-start', flexWrap: 'wrap' }}>
            <button
              suppressHydrationWarning
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                border: '1.5px solid #e2e8f0', background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                opacity: page === 1 ? 0.4 : 1, color: '#475569', flexShrink: 0,
              }}
            >
              <ChevronLeft size={15} />
            </button>

            {Array.from({ length: Math.min(isMobile ? 3 : 5, pages) }, (_, i) => {
              const span = isMobile ? 3 : 5
              let n = i + 1
              if (pages > span) {
                const edge = Math.floor(span / 2)
                if      (page <= edge + 1)         n = i + 1
                else if (page >= pages - edge)      n = pages - span + 1 + i
                else                                n = page - edge + i
              }
              return (
                <button
                  suppressHydrationWarning
                  key={n}
                  onClick={() => setPage(n)}
                  style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    border: `1.5px solid ${page === n ? ACCENT_BORDER3 : '#e2e8f0'}`,
                    background: page === n ? ACCENT_SOFT : '#fff',
                    color: page === n ? ACCENT : '#475569',
                    fontWeight: page === n ? 800 : 500,
                    fontSize: '0.82rem', cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  {n}
                </button>
              )
            })}

            <button
              suppressHydrationWarning
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                border: '1.5px solid #e2e8f0', background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: page === pages ? 'not-allowed' : 'pointer',
                opacity: page === pages ? 0.4 : 1, color: '#475569', flexShrink: 0,
              }}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {modalId && (
        <CustomerModal
          customerId={modalId}
          customerName={modalName}
          onClose={() => setModalId(null)}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}