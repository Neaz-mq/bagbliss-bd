'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Search, Filter, RefreshCw, Eye, ChevronLeft, ChevronRight,
  X, CheckCircle, Package, Truck, XCircle, Clock, ShoppingBag,
  Phone, MapPin, CreditCard, StickyNote, ChevronDown, Check,
} from 'lucide-react'

/* ============================================
   BRAND COLOR TOKENS
   Matches globals.css --color-accent family
   ============================================ */
const ACCENT       = '#CA865D'
const ACCENT_DARK  = '#b5724a'
const ACCENT_TEXT  = '#8a5a3a'          // darker accent for text-on-light-bg contrast
const ACCENT_SOFT  = 'rgba(202,134,93,0.08)'
const ACCENT_SOFT2 = 'rgba(202,134,93,0.07)'
const ACCENT_SOFT3 = 'rgba(202,134,93,0.06)'
const ACCENT_BORDER = 'rgba(202,134,93,0.2)'
const ACCENT_BORDER2 = 'rgba(202,134,93,0.25)'
const ACCENT_BORDER3 = 'rgba(202,134,93,0.3)'
const ACCENT_SHADOW = 'rgba(202,134,93,0.35)'

// Page background the tab-row fade gradients blend into. Most admin
// shells use a very light gray behind white cards — if your layout's
// page background is a different color, change this one constant and
// both fade edges below will match automatically.
const PAGE_BG = '#f8fafc'

// ✅ FIX: columns are now flexible (minmax/fr) instead of rigid px widths.
// Previously '1fr 160px 140px 110px 90px 56px' meant the 5 non-order
// columns NEVER shrank — so once the admin sidebar ate into the viewport,
// the 1fr "Order" column collapsed toward 0px while its text (which had
// no overflow/ellipsis handling) kept its full content width and spilled
// visually into the "Customer" column next to it. That's what produced
// the "#BBB0XFASFWUttara Dhaka" merged/overlapping text in the screenshots
// — it happened even at ~1136px viewport because the sidebar reduced the
// real available width below what the fixed columns needed.
// Now every column has a sane minimum AND can shrink proportionally.
const TABLE_GRID_COLS =
  'minmax(170px,1.6fr) minmax(130px,1fr) minmax(112px,120px) minmax(110px,140px) minmax(80px,90px) 46px'
const TABLE_COL_GAP   = '14px'

// ✅ FIX: raised from 768 → 1180. The desktop grid table needs real room
// (icon + order# + date, customer name + phone, status badge, payment
// badge, amount, and an action button) to lay out without truncation
// fighting for space. 768px (or even ~1100px once a sidebar is present)
// was nowhere near enough — that's the width range shown in your
// screenshots. Below this breakpoint we now render clean stacked cards
// instead of a squeezed table.
const MOBILE_BREAKPOINT = 1180

// ✅ NEW: below this width the status tabs wrap onto a second row
// instead of relying on horizontal scroll. On a real phone (≤480px)
// there's only room for 2–3 tabs at a time, so "Delivered" / "Cancelled"
// were sitting off-screen with only a sliver of their pill visible —
// easy to miss and easy to mistake for a rendering bug. Wrapping
// guarantees every tab is always visible with no swipe required.
const TABS_WRAP_BREAKPOINT = 480

// ✅ NEW: tracks the *actual* viewport width (not just a mobile/desktop
// boolean). We need the real number now because the search placeholder
// text needs to shrink in more than one step as the screen narrows
// (1180px sidebar breakpoint vs. a 320px phone are very different
// problems). Starts at a desktop-safe default so the very first client
// render matches the server render (avoids a hydration mismatch), then
// corrects itself right after mount via the resize listener.
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
function buildPaginationRange(current: number, total: number, siblingCount = 1): (number | 'dots')[] {
  const totalNumbers = siblingCount * 2 + 5 // first + last + current + 2*siblings + 2 dots
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

// Small helper so every table cell truncates the same way instead of
// silently overflowing into its neighbour when space runs out.
const ellipsisStyle: React.CSSProperties = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  minWidth: 0,
}

type OrderStatus = 'pending' | 'processing' | 'review' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
type PaymentMethod = 'bkash' | 'nagad' | 'cod' | 'sslcommerz' | 'card'

interface OrderItem {
  productId: string; name: string; price: number
  quantity: number; color: string; image?: string
}
interface Shipping {
  fullName: string; phone: string; email?: string
  division: string; district: string; thana: string
  address: string; postalCode?: string
}
interface Order {
  _id: string; orderNumber: string; userId?: string; guestEmail?: string
  items: OrderItem[]; shipping: Shipping; delivery: string; deliveryFee: number
  payment: PaymentMethod; subtotal: number; total: number; status: OrderStatus
  orderNote?: string; createdAt: string
  riskLevel?: string | null; riskTitle?: string | null
}

const STATUS_CONFIG: Record<OrderStatus, {
  label: string; bg: string; text: string; dot: string; border: string; icon: React.ElementType
}> = {
  pending:    { label: 'Pending',    bg: 'rgba(100,116,139,0.08)', text: '#475569', dot: '#64748b', border: 'rgba(100,116,139,0.2)', icon: Clock },
  processing: { label: 'Processing', bg: ACCENT_SOFT, text: ACCENT_TEXT, dot: ACCENT, border: ACCENT_BORDER, icon: Clock },
  // ⚠️ SSLCommerz risk_level=1 (risky/fraud-suspected) পেমেন্টে অর্ডার এই
  // স্ট্যাটাসে থাকে — normal 'processing' থেকে আলাদা রঙে (লাল/warning)
  // দেখানো হচ্ছে যাতে শিপ করার আগে চোখে পড়ে ও ম্যানুয়ালি ভেরিফাই করা যায়।
  review:     { label: 'Needs Review', bg: 'rgba(239,68,68,0.1)', text: '#b91c1c', dot: '#ef4444', border: 'rgba(239,68,68,0.25)', icon: XCircle },
  shipped:    { label: 'Shipped',    bg: 'rgba(59,130,246,0.08)', text: '#1d4ed8', dot: '#3b82f6', border: 'rgba(59,130,246,0.2)', icon: Truck },
  delivered:  { label: 'Delivered',  bg: 'rgba(34,197,94,0.08)',  text: '#15803d', dot: '#22c55e', border: 'rgba(34,197,94,0.2)',  icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  bg: 'rgba(239,68,68,0.08)',  text: '#b91c1c', dot: '#ef4444', border: 'rgba(239,68,68,0.2)',  icon: XCircle },
  refunded:   { label: 'Refunded',   bg: 'rgba(148,163,184,0.1)', text: '#475569', dot: '#94a3b8', border: 'rgba(148,163,184,0.25)', icon: XCircle },
}

const PAYMENT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  bkash:      { label: 'bKash',  color: '#e2136e', bg: 'rgba(226,19,110,0.1)' },
  nagad:      { label: 'Nagad',  color: '#f6a623', bg: 'rgba(246,166,35,0.1)' },
  cod:        { label: 'COD',    color: '#475569', bg: 'rgba(71,85,105,0.1)'  },
  // ✅ SSLCommerz-এর মাধ্যমে হওয়া অনলাইন পেমেন্ট (bKash/Nagad/Card যেকোনো
  // চ্যানেলেই হোক) order.payment ফিল্ডে 'sslcommerz' হিসেবে সেভ হয়।
  // এই এন্ট্রি না থাকায় আগে fallback হয়ে ভুলভাবে "COD" দেখাচ্ছিল।
  sslcommerz: { label: 'Online Payment', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
  card:       { label: 'Card',   color: '#1d4ed8', bg: 'rgba(29,78,216,0.1)' },
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.processing
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px',
      borderRadius: '8px', background: cfg.bg, color: cfg.text,
      border: `1px solid ${cfg.border}`, whiteSpace: 'nowrap',
      width: 'fit-content', maxWidth: '100%',
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}

/* ============================================
   Reusable stylish dropdown
   Replaces native <select> elements, which can't be themed on mobile
   (that's the flat blue-highlight browser-default menu — no amount of
   CSS on a real <select> can restyle its open menu on iOS/Android).
   This is a fully custom button + panel, built the same way as the
   "Update Status" menu in the modal below, so it always matches the
   brand.
   ============================================ */
interface DropdownOption { value: string; label: string; dot?: string }

function Dropdown({
  value, options, onChange, icon: Icon, placeholder = 'Select', minWidth = '180px', align = 'left',
}: {
  value: string
  options: DropdownOption[]
  onChange: (v: string) => void
  icon?: React.ElementType
  placeholder?: string
  minWidth?: string
  align?: 'left' | 'right'
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const selected = options.find(o => o.value === value)

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button suppressHydrationWarning
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          height: '42px', padding: '0 14px', borderRadius: '12px',
          border: `1.5px solid ${open ? ACCENT_BORDER3 : '#e8edf5'}`,
          background: '#fff', fontSize: '0.82rem', fontWeight: 600, color: '#334155',
          outline: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
          boxShadow: open ? `0 0 0 3px ${ACCENT_SOFT}` : 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
      >
        {Icon && <Icon size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />}
        {selected && selected.dot && (
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: selected.dot, flexShrink: 0 }} />
        )}
        {selected ? selected.label : placeholder}
        <ChevronDown size={13} style={{
          color: '#94a3b8', flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s',
        }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)',
          left: align === 'left' ? 0 : 'auto',
          right: align === 'right' ? 0 : 'auto',
          zIndex: 20, background: '#fff', borderRadius: '14px',
          border: '1px solid #f1f5f9', boxShadow: '0 16px 40px rgba(15,23,42,0.14)',
          overflow: 'hidden', minWidth, maxWidth: 'min(260px, calc(100vw - 32px))',
          padding: '6px',
        }}>
          {options.map(opt => {
            const active = opt.value === value
            return (
              <button suppressHydrationWarning
                type="button"
                key={opt.value || 'all'}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  width: '100%', padding: '9px 10px', border: 'none', borderRadius: '9px',
                  background: active ? ACCENT_SOFT : 'transparent',
                  cursor: 'pointer', fontSize: '0.83rem', fontWeight: active ? 700 : 500,
                  color: active ? ACCENT_TEXT : '#334155', textAlign: 'left',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f8fafc' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                {opt.dot && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: opt.dot, flexShrink: 0 }} />}
                <span style={{ flex: 1, minWidth: 0, ...ellipsisStyle }}>{opt.label}</span>
                {active && <Check size={14} style={{ color: ACCENT, flexShrink: 0 }} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function OrderModal({ order, onClose, onStatusChange }: {
  order: Order
  onClose: () => void
  onStatusChange: (id: string, status: OrderStatus) => Promise<void>
}) {
  const [updating, setUpdating]           = useState(false)
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  // Modal has its own, tighter breakpoint — it doesn't sit next to a
  // sidebar and only needs to stack its two-column info grid.
  const isMobile = useIsMobile(640)

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setShowStatusMenu(false); setUpdating(true)
    await onStatusChange(order._id, newStatus)
    setCurrentStatus(newStatus); setUpdating(false)
  }

  const allStatuses: OrderStatus[] = ['processing', 'shipped', 'delivered', 'cancelled']
  const payment = PAYMENT_CONFIG[order.payment] ?? PAYMENT_CONFIG.cod

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#ffffff', borderRadius: '20px',
        width: '100%', maxWidth: '680px', maxHeight: '90vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
      }}>
        {/* Modal header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid #f1f5f9', flexShrink: 0, gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
              background: `linear-gradient(135deg, ${ACCENT_SOFT}, rgba(202,134,93,0.05))`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShoppingBag size={18} color={ACCENT} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0, ...ellipsisStyle }}>
                Order #{order.orderNumber}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0', ...ellipsisStyle }}>
                {new Date(order.createdAt).toLocaleString('en-US', {
                  day: 'numeric', month: 'long', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
          </div>
          <button suppressHydrationWarning onClick={onClose} style={{
            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
            border: '1.5px solid #e2e8f0', background: '#f8fafc',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#64748b',
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Status + payment + updater */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <StatusBadge status={currentStatus} />
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px',
              borderRadius: '8px', background: payment.bg, color: payment.color,
            }}>
              <CreditCard size={11} />
              {payment.label}
            </span>

            <div style={{ marginLeft: isMobile ? 0 : 'auto', position: 'relative', width: isMobile ? '100%' : 'auto' }}>
              <button suppressHydrationWarning
                onClick={() => setShowStatusMenu(v => !v)}
                disabled={updating}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  width: isMobile ? '100%' : 'auto',
                  padding: '8px 14px', borderRadius: '10px', cursor: 'pointer',
                  fontSize: '0.8rem', fontWeight: 700,
                  background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`,
                  color: 'white', border: 'none',
                  boxShadow: `0 4px 12px ${ACCENT_SHADOW}`,
                  opacity: updating ? 0.7 : 1,
                }}
              >
                <Package size={13} />
                {updating ? 'Updating…' : 'Update Status'}
                <ChevronDown size={12} />
              </button>
              {showStatusMenu && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                  background: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden',
                  zIndex: 10, minWidth: '160px', width: isMobile ? '100%' : 'auto',
                }}>
                  {allStatuses.map(s => {
                    const cfg = STATUS_CONFIG[s]
                    return (
                      <button suppressHydrationWarning
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        disabled={s === currentStatus}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          width: '100%', padding: '10px 14px', border: 'none',
                          background: s === currentStatus ? '#f8fafc' : 'transparent',
                          cursor: s === currentStatus ? 'default' : 'pointer',
                          fontSize: '0.82rem', fontWeight: 600,
                          color: s === currentStatus ? cfg.text : '#334155',
                          textAlign: 'left',
                        }}
                      >
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
                        {cfg.label}
                        {s === currentStatus && (
                          <CheckCircle size={12} style={{ marginLeft: 'auto', color: cfg.dot }} />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ⚠️ SSLCommerz risk warning — শুধু risky (risk_level=1) পেমেন্টে দেখাবে */}
          {order.riskLevel === '1' && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '12px', padding: '12px 14px',
            }}>
              <XCircle size={16} color="#b91c1c" style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#b91c1c', margin: 0 }}>
                  Flagged risky by SSLCommerz{order.riskTitle ? ` — "${order.riskTitle}"` : ''}
                </p>
                <p style={{ fontSize: '0.76rem', color: '#7f1d1d', margin: '2px 0 0' }}>
                  টাকা কেটেছে, কিন্তু শিপ করার আগে কাস্টমারকে ফোনে ভেরিফাই করে তারপর status "Processing"-এ নিন।
                </p>
              </div>
            </div>
          )}

          {/* Items */}
          <div style={{ background: '#f8fafc', borderRadius: '14px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Items ({order.items.length})
              </p>
            </div>
            {order.items.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                borderBottom: i < order.items.length - 1 ? '1px solid #f1f5f9' : 'none',
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
                  background: ACCENT_SOFT2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Package size={16} color={ACCENT} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', margin: 0, ...ellipsisStyle }}>
                    {item.name}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 0', ...ellipsisStyle }}>
                    Color: {item.color} · Qty: {item.quantity}
                  </p>
                </div>
                <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: 0, flexShrink: 0 }}>
                  ৳{(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Shipping + Summary grid — stacks to 1 column on narrow modal widths */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
            <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px', border: '1px solid #f1f5f9', minWidth: 0 }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Shipping Info
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', minWidth: 0 }}>
                  <Phone size={13} style={{ color: '#94a3b8', flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', margin: 0, ...ellipsisStyle }}>{order.shipping.fullName}</p>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0', ...ellipsisStyle }}>{order.shipping.phone}</p>
                    {order.shipping.email && <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '1px 0 0', ...ellipsisStyle }}>{order.shipping.email}</p>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', minWidth: 0 }}>
                  <MapPin size={13} style={{ color: '#94a3b8', flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.5, minWidth: 0, wordBreak: 'break-word' }}>
                    {order.shipping.address}<br />
                    {order.shipping.thana}, {order.shipping.district}<br />
                    {order.shipping.division}
                    {order.shipping.postalCode && ` - ${order.shipping.postalCode}`}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px', border: '1px solid #f1f5f9', minWidth: 0 }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Order Summary
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {[
                  { label: 'Subtotal', value: `৳${order.subtotal.toLocaleString()}` },
                  { label: 'Delivery', value: `৳${order.deliveryFee.toLocaleString()}` },
                  { label: 'Payment',  value: payment.label },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{label}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>{value}</span>
                  </div>
                ))}
                <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>Total</span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: ACCENT }}>৳{order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {order.orderNote && (
            <div style={{
              background: 'rgba(245,158,11,0.06)', borderRadius: '12px',
              padding: '14px 16px', border: '1px solid rgba(245,158,11,0.18)',
              display: 'flex', gap: '10px',
            }}>
              <StickyNote size={15} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b45309', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Customer Note</p>
                <p style={{ fontSize: '0.85rem', color: '#92400e', margin: 0, lineHeight: 1.5, wordBreak: 'break-word' }}>{order.orderNote}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const [orders, setOrders]          = useState<Order[]>([])
  const [total, setTotal]            = useState(0)
  const [page, setPage]              = useState(1)
  const [pages, setPages]            = useState(1)
  const [loading, setLoading]        = useState(true)
  const [search, setSearch]          = useState('')
  const [statusFilter, setStatus]    = useState('')
  const [paymentFilter, setPayment]  = useState('')
  const [selectedOrder, setSelected] = useState<Order | null>(null)

  // ✅ NEW: real viewport width, not just a mobile/desktop boolean —
  // needed so the search placeholder can shrink in steps and so the
  // status tabs know when to switch from horizontal-scroll to wrap.
  const viewportWidth = useViewportWidth()
  const isMobile = viewportWidth < MOBILE_BREAKPOINT
  // ✅ NEW: on real phones, wrap the status tabs onto multiple rows
  // instead of horizontal-scrolling them. A scrollable row with no
  // visible affordance made "Delivered" / "Cancelled" look cut off /
  // broken rather than just off-screen — wrapping removes the need
  // for a scroll gesture entirely.
  const tabsWrap = viewportWidth < TABS_WRAP_BREAKPOINT

  // ✅ FIX: the placeholder used to be one fixed string
  // ("Search order #, customer name, phone…"). On a narrow phone
  // (≤360px, like your 320px screenshot) there simply isn't room for
  // the icon + that full sentence + the clear button, so the input
  // just hard-clipped it mid-word ("…customer name" with "phone"
  // gone) — not an ellipsis, just an invisible cut-off. Now the
  // placeholder itself shortens in steps as the viewport narrows, so
  // there's always a complete, readable phrase instead of a clipped
  // fragment.
  const searchPlaceholder =
    viewportWidth < 360 ? 'Search orders…'
    : viewportWidth < 480 ? 'Search order #, name, phone…'
    : 'Search order #, customer name, phone…'

  const limit = 10

  // Scroll-fade state for the status tabs row. Only relevant when the
  // tabs are horizontally scrollable (tabsWrap === false) — on
  // narrower screens they wrap instead, so nothing overflows and no
  // fade is needed. Without a visual cue on the scrollable variant,
  // "Delivered" / "Cancelled" just look cut off / broken instead of
  // scrollable. These fades fade the edge into PAGE_BG and only
  // appear when there's actually more to scroll to.
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
    if (!el || tabsWrap) { setTabsScroll({ left: false, right: false }); return }

    // ✅ FIX: previously this only recomputed on the 'scroll' and
    // window 'resize' events, plus once on mount. In your screenshots
    // (DevTools responsive mode spawning straight at 425px/320px) the
    // tab row was clearly overflowing — "Delivered"/"Shipped" were cut
    // off — but the right-edge fade never appeared. That's because
    // `scrollWidth` isn't reliably final on the very first paint, and
    // a fixed-size DevTools viewport never fires a 'resize' event to
    // trigger a recheck. A ResizeObserver on the row itself reacts to
    // any layout change (container resize, content reflow, fonts
    // loading), and the double rAF makes sure we measure only after
    // the browser has actually committed layout.
    const recheck = () => {
      requestAnimationFrame(() => requestAnimationFrame(updateTabsScroll))
    }

    recheck()
    el.addEventListener('scroll', updateTabsScroll, { passive: true })

    const ro = new ResizeObserver(recheck)
    ro.observe(el)

    return () => {
      el.removeEventListener('scroll', updateTabsScroll)
      ro.disconnect()
    }
  }, [updateTabsScroll, tabsWrap])

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page), limit: String(limit),
        search, status: statusFilter, payment: paymentFilter, sort: '-createdAt',
      })
      const res  = await fetch(`/api/admin/orders?${params}`)
      const data = await res.json()
      setOrders(data.orders ?? [])
      setTotal(data.total   ?? 0)
      setPages(data.pages   ?? 1)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, paymentFilter])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders()
  }, [fetchOrders])
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1)
  }, [search, statusFilter, paymentFilter])

  // Recheck fade state once the tab row's own content settles (e.g.
  // after fonts/layout finish, or the list re-renders).
  useEffect(() => {
    updateTabsScroll()
  }, [updateTabsScroll, total])

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o))
    if (selectedOrder?._id === id) setSelected(prev => prev ? { ...prev, status } : null)
  }

  const STATUS_TABS = [
    { key: '',           label: 'All' },
    { key: 'review',     label: 'Needs Review' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped',    label: 'Shipped' },
    { key: 'delivered',  label: 'Delivered' },
    { key: 'cancelled',  label: 'Cancelled' },
  ]

  const PAYMENT_OPTIONS: DropdownOption[] = [
    { value: '',           label: 'All Payments' },
    { value: 'bkash',      label: 'bKash',          dot: PAYMENT_CONFIG.bkash.color },
    { value: 'nagad',      label: 'Nagad',          dot: PAYMENT_CONFIG.nagad.color },
    { value: 'sslcommerz', label: 'Online Payment', dot: PAYMENT_CONFIG.sslcommerz.color },
    { value: 'cod',        label: 'COD',            dot: PAYMENT_CONFIG.cod.color },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>
            Orders
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '4px 0 0' }}>
            {total} total orders · Manage and track all customer orders
          </p>
        </div>
        <button suppressHydrationWarning
          onClick={fetchOrders}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '9px 16px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
            background: '#f8fafc', color: '#475569', cursor: 'pointer',
            fontSize: '0.82rem', fontWeight: 600,
          }}
        >
          <RefreshCw size={14} style={{ opacity: loading ? 0.5 : 1 }} />
          Refresh
        </button>
      </div>

      {/* ── Status Tabs ──
          Two layouts depending on viewport:
          - tabsWrap (≤480px, real phones): flex-wrap onto as many rows
            as needed. Every tab is always visible, no scroll gesture.
          - !tabsWrap (tablet/desktop): single horizontally-scrolling
            row wrapped in a relative container with left/right fade
            overlays that only render while there's actually more
            content in that direction (tracked via tabsScroll, backed
            by a ResizeObserver so it also catches DevTools/initial-load
            viewports — see the effect above). Extra right padding so
            the last tab never sits flush against the fade/edge. */}
      <div style={{ position: 'relative' }}>
        <div
          ref={tabsRef}
          style={{
            display: 'flex', gap: '6px',
            flexWrap: tabsWrap ? 'wrap' : 'nowrap',
            overflowX: tabsWrap ? 'visible' : 'auto',
            scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
            paddingRight: tabsWrap ? 0 : '20px',
          }}
        >
          {STATUS_TABS.map(tab => {
            const active = statusFilter === tab.key
            const cfg    = tab.key ? STATUS_CONFIG[tab.key as OrderStatus] : null
            return (
              <button suppressHydrationWarning
                key={tab.key}
                onClick={() => setStatus(tab.key)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: tabsWrap ? '7px 12px' : '8px 16px', borderRadius: '10px', border: 'none',
                  cursor: 'pointer', fontSize: tabsWrap ? '0.78rem' : '0.82rem', fontWeight: active ? 700 : 500,
                  whiteSpace: 'nowrap', flexShrink: 0,
                  background: active ? (cfg ? cfg.bg : 'rgba(15,23,42,0.06)') : 'transparent',
                  color:      active ? (cfg ? cfg.text : '#0f172a') : '#64748b',
                  outline:    active ? `1.5px solid ${cfg ? cfg.border : 'rgba(15,23,42,0.12)'}` : 'none',
                }}
              >
                {cfg && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />}
                {tab.label}
              </button>
            )
          })}
        </div>

        {!tabsWrap && tabsScroll.left && (
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: '28px',
            background: `linear-gradient(to right, ${PAGE_BG}, rgba(248,250,252,0))`,
            pointerEvents: 'none',
          }} />
        )}
        {!tabsWrap && tabsScroll.right && (
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: '28px',
            background: `linear-gradient(to left, ${PAGE_BG}, rgba(248,250,252,0))`,
            pointerEvents: 'none',
          }} />
        )}
      </div>

      {/* ── Search + Payment Filter ── */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 280px',
          background: '#fff', border: '1.5px solid #e8edf5', borderRadius: '12px',
          padding: '0 14px', height: '42px',
        }}>
          <Search size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <input suppressHydrationWarning
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
              // ✅ FIX: font-size now steps down slightly on very narrow
              // screens too, so the shortened placeholder has a touch
              // more breathing room next to the icon + clear button.
              fontSize: viewportWidth < 360 ? '0.8rem' : '0.85rem',
              color: '#334155',
            }}
          />
          {search && (
            <button suppressHydrationWarning onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex', flexShrink: 0 }}>
              <X size={14} />
            </button>
          )}
        </div>

        <Dropdown
          value={paymentFilter}
          onChange={setPayment}
          options={PAYMENT_OPTIONS}
          icon={Filter}
          placeholder="All Payments"
          minWidth="170px"
        />
      </div>

      {/* ── Table (desktop) / Card list (mobile & tablet) ── */}
      {isMobile ? (
        /* ══════════════════════════════════════════
           MOBILE / TABLET CARD LIST
           Used any time the grid table wouldn't have room to lay out
           cleanly (see MOBILE_BREAKPOINT). Every order is its own
           bordered card, info stacked vertically with each row's text
           truncated, so nothing can visually collide.
           ══════════════════════════════════════════ */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {loading && (
            <div style={{ padding: '60px 20px', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                border: '3px solid #f1f5f9', borderTopColor: ACCENT,
                animation: 'spin 0.7s linear infinite', margin: '0 auto 12px',
              }} />
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Loading orders…</p>
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '60px 20px', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9',
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px',
                background: ACCENT_SOFT3, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px',
              }}>
                <ShoppingBag size={22} color={ACCENT} style={{ opacity: 0.5 }} />
              </div>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', margin: 0 }}>No orders found</p>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '6px 0 0' }}>
                {search || statusFilter || paymentFilter ? 'Try adjusting your filters' : 'Orders will appear here once customers start buying'}
              </p>
            </div>
          )}

          {!loading && orders.map(order => {
            const pay = PAYMENT_CONFIG[order.payment] ?? PAYMENT_CONFIG.cod
            return (
              <button suppressHydrationWarning
                key={order._id}
                onClick={() => setSelected(order)}
                style={{
                  display: 'flex', flexDirection: 'column', gap: '10px',
                  background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9',
                  padding: '14px 16px', textAlign: 'left', cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)', width: '100%',
                }}
              >
                {/* Row 1: order # + date on the left, status badge on the right */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
                      background: `linear-gradient(135deg, ${ACCENT_SOFT}, rgba(202,134,93,0.04))`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <ShoppingBag size={13} color={ACCENT} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', margin: 0, ...ellipsisStyle }}>
                        #{order.orderNumber}
                      </p>
                      <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: '3px', ...ellipsisStyle }}>
                        <Clock size={9} style={{ flexShrink: 0 }} />
                        {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <StatusBadge status={order.status} />
                  </div>
                </div>

                {/* Row 2: customer name + phone */}
                <div style={{ minWidth: 0, paddingLeft: '44px' }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', margin: 0, ...ellipsisStyle }}>
                    {order.shipping?.fullName ?? 'Guest'}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 0', ...ellipsisStyle }}>
                    {order.shipping?.phone ?? order.guestEmail ?? '—'}
                  </p>
                </div>

                {/* Row 3: payment badge + amount + view icon */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
                  paddingTop: '10px', borderTop: '1px solid #f8fafc',
                }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    fontSize: '0.7rem', fontWeight: 700, padding: '4px 9px',
                    borderRadius: '7px', background: pay.bg, color: pay.color, width: 'fit-content', flexShrink: 0,
                  }}>
                    {pay.label}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: 0, whiteSpace: 'nowrap' }}>
                      ৳{order.total.toLocaleString()}
                    </p>
                    <span style={{
                      width: '30px', height: '30px', borderRadius: '9px',
                      border: '1.5px solid #e2e8f0', background: '#f8fafc',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#64748b', flexShrink: 0,
                    }}>
                      <Eye size={13} />
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        /* ══════════════════════════════════════════
           DESKTOP GRID TABLE
           Flexible minmax()/fr columns + per-cell truncation, wrapped
           in a horizontal-scroll container as a last-resort safety net
           so nothing can ever visually overflow into a neighbour cell.
           ══════════════════════════════════════════ */
        <div style={{
          background: '#ffffff', borderRadius: '20px',
          border: '1px solid #f1f5f9', boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          overflowX: 'auto',
        }}>
          <div style={{ minWidth: '760px' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: TABLE_GRID_COLS, columnGap: TABLE_COL_GAP,
              padding: '11px 20px', fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              background: '#fafbfc', borderBottom: '1px solid #f1f5f9',
            }}>
              <span>Order</span><span>Customer</span><span>Status</span>
              <span>Payment</span><span style={{ textAlign: 'right' }}>Amount</span><span />
            </div>

            {loading && (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  border: '3px solid #f1f5f9', borderTopColor: ACCENT,
                  animation: 'spin 0.7s linear infinite', margin: '0 auto 12px',
                }} />
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Loading orders…</p>
              </div>
            )}

            {!loading && orders.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '18px',
                  background: ACCENT_SOFT3, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
                }}>
                  <ShoppingBag size={26} color={ACCENT} style={{ opacity: 0.5 }} />
                </div>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', margin: 0 }}>No orders found</p>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '6px 0 0' }}>
                  {search || statusFilter || paymentFilter ? 'Try adjusting your filters' : 'Orders will appear here once customers start buying'}
                </p>
              </div>
            )}

            {!loading && orders.map((order, i) => {
              const pay = PAYMENT_CONFIG[order.payment] ?? PAYMENT_CONFIG.cod
              return (
                <div key={order._id}
                  style={{
                    display: 'grid', gridTemplateColumns: TABLE_GRID_COLS, columnGap: TABLE_COL_GAP,
                    padding: '14px 20px', borderBottom: i < orders.length - 1 ? '1px solid #f8fafc' : 'none',
                    alignItems: 'center', transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fafbfc')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Order # + date — clipped with ellipsis instead of
                      overflowing visibly into the Customer column */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '11px', flexShrink: 0,
                      background: `linear-gradient(135deg, ${ACCENT_SOFT}, rgba(202,134,93,0.04))`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <ShoppingBag size={14} color={ACCENT} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1e293b', margin: 0, ...ellipsisStyle }}>
                        #{order.orderNumber}
                      </p>
                      <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: '3px', ...ellipsisStyle }}>
                        <Clock size={9} style={{ flexShrink: 0 }} />
                        {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155', margin: 0, ...ellipsisStyle }}>
                      {order.shipping?.fullName ?? 'Guest'}
                    </p>
                    <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '2px 0 0', ...ellipsisStyle }}>
                      {order.shipping?.phone ?? order.guestEmail ?? '—'}
                    </p>
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <StatusBadge status={order.status} />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      fontSize: '0.72rem', fontWeight: 700, padding: '4px 9px',
                      borderRadius: '7px', background: pay.bg, color: pay.color,
                      width: 'fit-content', maxWidth: '100%', ...ellipsisStyle,
                    }}>
                      {pay.label}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: 0, textAlign: 'right', whiteSpace: 'nowrap' }}>
                    ৳{order.total.toLocaleString()}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button suppressHydrationWarning
                      onClick={() => setSelected(order)}
                      style={{
                        width: '34px', height: '34px', borderRadius: '9px',
                        border: '1.5px solid #e2e8f0', background: '#f8fafc',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#64748b', transition: 'all 0.12s', flexShrink: 0,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = ACCENT_SOFT2; e.currentTarget.style.borderColor = ACCENT_BORDER2; e.currentTarget.style.color = ACCENT }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' }}
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Pagination ──
          Trendy pill-style pager. Desktop: single row, "Showing…" on
          the left, control pill on the right, First/Last shortcuts.
          Mobile: stacked, centered, with a slim animated progress
          track under the label (fills as `page` advances through
          `pages`) and a bigger, bolder active-page pill with a glow
          ring — reads more like a native app stepper than a desktop
          table footer. Fully dynamic via buildPaginationRange(), so
          it looks the same whether there are 2 pages or 200. */}
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

      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}