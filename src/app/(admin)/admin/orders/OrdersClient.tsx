'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Search, Filter, RefreshCw, Eye, ChevronLeft, ChevronRight,
  X, CheckCircle, Package, Truck, XCircle, Clock, ShoppingBag,
  Phone, MapPin, CreditCard, StickyNote, ChevronDown,
} from 'lucide-react'

type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled'
type PaymentMethod = 'bkash' | 'nagad' | 'cod'

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
}

const STATUS_CONFIG: Record<OrderStatus, {
  label: string; bg: string; text: string; dot: string; border: string; icon: React.ElementType
}> = {
  processing: { label: 'Processing', bg: 'rgba(233,30,140,0.08)', text: '#be185d', dot: '#e91e8c', border: 'rgba(233,30,140,0.2)', icon: Clock },
  shipped:    { label: 'Shipped',    bg: 'rgba(59,130,246,0.08)', text: '#1d4ed8', dot: '#3b82f6', border: 'rgba(59,130,246,0.2)', icon: Truck },
  delivered:  { label: 'Delivered',  bg: 'rgba(34,197,94,0.08)',  text: '#15803d', dot: '#22c55e', border: 'rgba(34,197,94,0.2)',  icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  bg: 'rgba(239,68,68,0.08)',  text: '#b91c1c', dot: '#ef4444', border: 'rgba(239,68,68,0.2)',  icon: XCircle },
}

const PAYMENT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  bkash: { label: 'bKash', color: '#e2136e', bg: 'rgba(226,19,110,0.1)' },
  nagad: { label: 'Nagad', color: '#f6a623', bg: 'rgba(246,166,35,0.1)' },
  cod:   { label: 'COD',   color: '#475569', bg: 'rgba(71,85,105,0.1)'  },
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.processing
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px',
      borderRadius: '8px', background: cfg.bg, color: cfg.text,
      border: `1px solid ${cfg.border}`, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
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
          padding: '20px 24px', borderBottom: '1px solid #f1f5f9', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(233,30,140,0.1), rgba(244,63,94,0.05))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShoppingBag size={18} color="#e91e8c" />
            </div>
            <div>
              <p style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Order #{order.orderNumber}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0' }}>
                {new Date(order.createdAt).toLocaleString('en-US', {
                  day: 'numeric', month: 'long', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
          </div>
          {/* ✅ suppressHydrationWarning */}
          <button suppressHydrationWarning onClick={onClose} style={{
            width: '36px', height: '36px', borderRadius: '10px',
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

            <div style={{ marginLeft: 'auto', position: 'relative' }}>
              {/* ✅ suppressHydrationWarning */}
              <button suppressHydrationWarning
                onClick={() => setShowStatusMenu(v => !v)}
                disabled={updating}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', borderRadius: '10px', cursor: 'pointer',
                  fontSize: '0.8rem', fontWeight: 700,
                  background: 'linear-gradient(135deg, #e91e8c, #f43f5e)',
                  color: 'white', border: 'none',
                  boxShadow: '0 4px 12px rgba(233,30,140,0.35)',
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
                  zIndex: 10, minWidth: '160px',
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
                  background: 'rgba(233,30,140,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Package size={16} color="#e91e8c" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 0' }}>
                    Color: {item.color} · Qty: {item.quantity}
                  </p>
                </div>
                <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: 0, flexShrink: 0 }}>
                  ৳{(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Shipping + Summary grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px', border: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Shipping Info
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <Phone size={13} style={{ color: '#94a3b8', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{order.shipping.fullName}</p>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>{order.shipping.phone}</p>
                    {order.shipping.email && <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '1px 0 0' }}>{order.shipping.email}</p>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <MapPin size={13} style={{ color: '#94a3b8', flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                    {order.shipping.address}<br />
                    {order.shipping.thana}, {order.shipping.district}<br />
                    {order.shipping.division}
                    {order.shipping.postalCode && ` - ${order.shipping.postalCode}`}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px', border: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Order Summary
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {[
                  { label: 'Subtotal', value: `৳${order.subtotal.toLocaleString()}` },
                  { label: 'Delivery', value: `৳${order.deliveryFee.toLocaleString()}` },
                  { label: 'Payment',  value: payment.label },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{label}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>{value}</span>
                  </div>
                ))}
                <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>Total</span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#e91e8c' }}>৳{order.total.toLocaleString()}</span>
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
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b45309', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Customer Note</p>
                <p style={{ fontSize: '0.85rem', color: '#92400e', margin: 0, lineHeight: 1.5 }}>{order.orderNote}</p>
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

  const limit = 15

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

  useEffect(() => { fetchOrders() }, [fetchOrders])
  useEffect(() => { setPage(1) }, [search, statusFilter, paymentFilter])

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
    { key: 'processing', label: 'Processing' },
    { key: 'shipped',    label: 'Shipped' },
    { key: 'delivered',  label: 'Delivered' },
    { key: 'cancelled',  label: 'Cancelled' },
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
        {/* ✅ suppressHydrationWarning — line 407, the reported button */}
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

      {/* ── Status Tabs ── */}
      <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {STATUS_TABS.map(tab => {
          const active = statusFilter === tab.key
          const cfg    = tab.key ? STATUS_CONFIG[tab.key as OrderStatus] : null
          return (
            <button suppressHydrationWarning
              key={tab.key}
              onClick={() => setStatus(tab.key)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '10px', border: 'none',
                cursor: 'pointer', fontSize: '0.82rem', fontWeight: active ? 700 : 500,
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
            placeholder="Search order #, customer name, phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.85rem', color: '#334155' }}
          />
          {search && (
            <button suppressHydrationWarning onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Filter size={14} style={{ position: 'absolute', left: '12px', color: '#94a3b8', pointerEvents: 'none' }} />
          <select suppressHydrationWarning
            value={paymentFilter}
            onChange={e => setPayment(e.target.value)}
            style={{
              height: '42px', paddingLeft: '34px', paddingRight: '32px',
              border: '1.5px solid #e8edf5', borderRadius: '12px',
              background: '#fff', fontSize: '0.82rem', color: '#334155',
              outline: 'none', cursor: 'pointer', appearance: 'none',
            }}
          >
            <option value="">All Payments</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="cod">COD</option>
          </select>
          <ChevronDown size={13} style={{ position: 'absolute', right: '10px', color: '#94a3b8', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{
        background: '#ffffff', borderRadius: '20px',
        border: '1px solid #f1f5f9', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', overflow: 'hidden',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 160px 140px 110px 90px 56px',
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
              border: '3px solid #f1f5f9', borderTopColor: '#e91e8c',
              animation: 'spin 0.7s linear infinite', margin: '0 auto 12px',
            }} />
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Loading orders…</p>
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '18px',
              background: 'rgba(233,30,140,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
            }}>
              <ShoppingBag size={26} color="#e91e8c" style={{ opacity: 0.5 }} />
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
                display: 'grid', gridTemplateColumns: '1fr 160px 140px 110px 90px 56px',
                padding: '14px 20px', borderBottom: i < orders.length - 1 ? '1px solid #f8fafc' : 'none',
                alignItems: 'center', transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#fafbfc')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '11px', flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(233,30,140,0.08), rgba(244,63,94,0.04))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ShoppingBag size={14} color="#e91e8c" />
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                    #{order.orderNumber}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={9} />
                    {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {order.shipping?.fullName ?? 'Guest'}
                </p>
                <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {order.shipping?.phone ?? order.guestEmail ?? '—'}
                </p>
              </div>

              <StatusBadge status={order.status} />

              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                fontSize: '0.72rem', fontWeight: 700, padding: '4px 9px',
                borderRadius: '7px', background: pay.bg, color: pay.color, width: 'fit-content',
              }}>
                {pay.label}
              </span>

              <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: 0, textAlign: 'right' }}>
                ৳{order.total.toLocaleString()}
              </p>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {/* ✅ suppressHydrationWarning */}
                <button suppressHydrationWarning
                  onClick={() => setSelected(order)}
                  style={{
                    width: '34px', height: '34px', borderRadius: '9px',
                    border: '1.5px solid #e2e8f0', background: '#f8fafc',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#64748b', transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(233,30,140,0.07)'; e.currentTarget.style.borderColor = 'rgba(233,30,140,0.25)'; e.currentTarget.style.color = '#e91e8c' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' }}
                >
                  <Eye size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Pagination ── */}
      {pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
            Showing <strong style={{ color: '#1e293b' }}>{(page - 1) * limit + 1}–{Math.min(page * limit, total)}</strong> of <strong style={{ color: '#1e293b' }}>{total}</strong> orders
          </p>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {/* ✅ suppressHydrationWarning on all pagination buttons */}
            <button suppressHydrationWarning
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                border: '1.5px solid #e2e8f0', background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, color: '#475569',
              }}
            >
              <ChevronLeft size={15} />
            </button>

            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              let p = i + 1
              if (pages > 5) {
                if (page <= 3) p = i + 1
                else if (page >= pages - 2) p = pages - 4 + i
                else p = page - 2 + i
              }
              return (
                <button suppressHydrationWarning
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    border: `1.5px solid ${page === p ? 'rgba(233,30,140,0.3)' : '#e2e8f0'}`,
                    background: page === p ? 'rgba(233,30,140,0.08)' : '#fff',
                    color: page === p ? '#e91e8c' : '#475569',
                    fontWeight: page === p ? 800 : 500, fontSize: '0.82rem', cursor: 'pointer',
                  }}
                >
                  {p}
                </button>
              )
            })}

            <button suppressHydrationWarning
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                border: '1.5px solid #e2e8f0', background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: page === pages ? 'not-allowed' : 'pointer', opacity: page === pages ? 0.4 : 1, color: '#475569',
              }}
            >
              <ChevronRight size={15} />
            </button>
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