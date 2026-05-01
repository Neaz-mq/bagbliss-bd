'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import {
  Search, RefreshCw, X, ChevronLeft, ChevronRight,
  ChevronDown, Users, ShoppingBag, TrendingUp,
  Mail, Calendar, Eye, Package, Clock,
} from 'lucide-react'

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
  processing: { bg: 'rgba(233,30,140,0.08)', text: '#be185d', dot: '#e91e8c' },
  shipped:    { bg: 'rgba(59,130,246,0.08)', text: '#1d4ed8', dot: '#3b82f6' },
  delivered:  { bg: 'rgba(34,197,94,0.08)',  text: '#15803d', dot: '#22c55e' },
  cancelled:  { bg: 'rgba(239,68,68,0.08)',  text: '#b91c1c', dot: '#ef4444' },
}

const SORT_OPTS = [
  { v: '-createdAt',  l: 'Newest First' },
  { v: 'createdAt',   l: 'Oldest First' },
  { v: '-totalSpent', l: 'Top Spenders' },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

// ✅ Always format dates with explicit locale 'en-GB' to avoid server/client mismatch
function fmt(dateStr: string, opts: Intl.DateTimeFormatOptions) {
  return new Date(dateStr).toLocaleDateString('en-GB', opts)
}

// ── Avatar ─────────────────────────────────────────────────────────────────────

function Avatar({ name, image, size = 40 }: { name: string; image?: string; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const colors   = ['#e91e8c', '#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6']
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

// ── Customer Detail Modal ──────────────────────────────────────────────────────

function CustomerModal({
  customerId, customerName, onClose,
}: { customerId: string; customerName: string; onClose: () => void }) {
  const [detail, setDetail]   = useState<CustomerDetail | null>(null)
  const [loading, setLoading] = useState(true)

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
          padding: '20px 24px', borderBottom: '1px solid #f1f5f9', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {detail && <Avatar name={detail.user.name} image={detail.user.image} size={44} />}
            <div>
              <p style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{customerName}</p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0' }}>Customer Profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
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
                border: '3px solid #f1f5f9', borderTopColor: '#e91e8c',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Mail size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.875rem', color: '#334155', fontWeight: 500 }}>{detail.user.email}</span>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { label: 'Total Orders', value: detail.orders.length,          icon: ShoppingBag, color: '#6366f1', bg: 'rgba(99,102,241,0.08)'  },
                  { label: 'Total Spent',  value: `৳${totalSpent.toLocaleString('en-US')}`, icon: TrendingUp,  color: '#e91e8c', bg: 'rgba(233,30,140,0.08)' },
                  { label: 'Delivered',    value: delivered,                      icon: Package,     color: '#10b981', bg: 'rgba(16,185,129,0.08)'  },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} style={{
                    background: '#f8fafc', borderRadius: '14px', padding: '16px',
                    border: '1px solid #f1f5f9', textAlign: 'center',
                  }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px', background: bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px',
                    }}>
                      <Icon size={16} style={{ color }} />
                    </div>
                    {/* ✅ span instead of p to avoid invalid nesting */}
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{value}</div>
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
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '14px 16px', background: '#f8fafc',
                          borderRadius: '12px', border: '1px solid #f1f5f9',
                        }}>
                          <div style={{
                            width: '38px', height: '38px', borderRadius: '10px',
                            background: 'rgba(233,30,140,0.07)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            <ShoppingBag size={14} color="#e91e8c" />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                              #{order.orderNumber}
                            </div>
                            <div style={{
                              fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 0',
                              display: 'flex', alignItems: 'center', gap: '4px',
                            }}>
                              <Clock size={10} />
                              {fmt(order.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}
                              {' · '}
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            fontSize: '0.72rem', fontWeight: 700, padding: '4px 9px',
                            borderRadius: '8px', background: cfg.bg, color: cfg.text, whiteSpace: 'nowrap',
                          }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: cfg.dot }} />
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

  useEffect(() => { fetchCustomers() }, [fetchCustomers])
  useEffect(() => { setPage(1) }, [search, sort])

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
            border: '1.5px solid #e2e8f0', background: '#f8fafc',
            color: '#475569', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
          }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
        {[
          { label: 'Total Customers', value: total,                                    icon: Users,       gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', bg: 'rgba(99,102,241,0.08)'  },
          { label: 'With Orders',     value: withOrders,                               icon: ShoppingBag, gradient: 'linear-gradient(135deg, #e91e8c, #f43f5e)', bg: 'rgba(233,30,140,0.08)' },
          { label: 'Total Revenue',   value: `৳${totalSpent.toLocaleString('en-US')}`, icon: TrendingUp,  gradient: 'linear-gradient(135deg, #10b981, #059669)', bg: 'rgba(16,185,129,0.08)'  },
        ].map(({ label, value, icon: Icon, gradient, bg }) => (
          <div key={label} style={{
            background: '#fff', borderRadius: '16px', padding: '20px',
            border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px', background: gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, boxShadow: `0 4px 12px ${bg}`,
            }}>
              <Icon size={20} color="white" strokeWidth={2} />
            </div>
            <div>
              {/* ✅ div instead of p — avoids invalid nesting if this renders inside another p */}
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          flex: '1 1 220px', background: '#fff',
          border: '1.5px solid #e8edf5', borderRadius: '12px',
          padding: '0 14px', height: '42px',
        }}>
          <Search size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <input
          suppressHydrationWarning
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.85rem', color: '#334155' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <select
          suppressHydrationWarning
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{
              height: '42px', paddingLeft: '12px', paddingRight: '32px',
              border: '1.5px solid #e8edf5', borderRadius: '12px',
              background: '#fff', fontSize: '0.82rem', color: '#334155',
              outline: 'none', cursor: 'pointer', appearance: 'none',
            }}
          >
            {SORT_OPTS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
          <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: '#fff', borderRadius: '20px',
        border: '1px solid #f1f5f9', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', overflow: 'hidden',
      }}>
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
              width: '36px', height: '36px', borderRadius: '50%',
              border: '3px solid #f1f5f9', borderTopColor: '#e91e8c',
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
              background: 'rgba(99,102,241,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <Users size={26} color="#6366f1" style={{ opacity: 0.5 }} />
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
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
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
                background: c.orderCount > 0 ? 'rgba(233,30,140,0.08)' : '#f8fafc',
                fontSize: '0.8rem', fontWeight: 800,
                color: c.orderCount > 0 ? '#e91e8c' : '#94a3b8',
              }}>
                {c.orderCount}
              </div>
            </div>

            {/* Spent */}
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: c.totalSpent > 0 ? '#0f172a' : '#94a3b8' }}>
              {c.totalSpent > 0 ? `৳${c.totalSpent.toLocaleString('en-US')}` : '—'}
            </div>

            {/* Joined */}
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              {/* ✅ explicit locale */}
              {fmt(c.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>

            {/* View */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => openModal(c)}
                style={{
                  width: '32px', height: '32px', borderRadius: '9px',
                  border: '1.5px solid #e2e8f0', background: '#f8fafc',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#64748b',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background     = 'rgba(99,102,241,0.07)'
                  e.currentTarget.style.borderColor    = 'rgba(99,102,241,0.3)'
                  e.currentTarget.style.color          = '#6366f1'
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

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
            Showing{' '}
            <strong style={{ color: '#1e293b' }}>{(page - 1) * limit + 1}–{Math.min(page * limit, total)}</strong>
            {' '}of{' '}
            <strong style={{ color: '#1e293b' }}>{total}</strong> customers
          </p>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                border: '1.5px solid #e2e8f0', background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                opacity: page === 1 ? 0.4 : 1, color: '#475569',
              }}
            >
              <ChevronLeft size={15} />
            </button>

            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              let n = i + 1
              if (pages > 5) {
                if      (page <= 3)       n = i + 1
                else if (page >= pages - 2) n = pages - 4 + i
                else                      n = page - 2 + i
              }
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    border: `1.5px solid ${page === n ? 'rgba(99,102,241,0.3)' : '#e2e8f0'}`,
                    background: page === n ? 'rgba(99,102,241,0.08)' : '#fff',
                    color: page === n ? '#6366f1' : '#475569',
                    fontWeight: page === n ? 800 : 500,
                    fontSize: '0.82rem', cursor: 'pointer',
                  }}
                >
                  {n}
                </button>
              )
            })}

            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                border: '1.5px solid #e2e8f0', background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: page === pages ? 'not-allowed' : 'pointer',
                opacity: page === pages ? 0.4 : 1, color: '#475569',
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