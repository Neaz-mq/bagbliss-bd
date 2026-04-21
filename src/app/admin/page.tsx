import {
  ShoppingBag, Package, Users, TrendingUp,
  ArrowUpRight, ArrowDownRight, Clock, ChevronRight,
  Zap, BarChart3,
} from 'lucide-react'
import { auth } from '@/lib/auth'
import Link from 'next/link'

interface RecentOrder {
  _id: string
  orderNumber: string
  total: number
  status: string
  createdAt: string
  shipping?: { fullName?: string }
}

interface StatsData {
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  totalRevenue: number
  recentOrders: RecentOrder[]
  ordersByStatus: { _id: string; count: number }[]
}

type StatusKey = 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'pending'

const STATUS_CONFIG: Record<StatusKey, { bg: string; text: string; dot: string; label: string }> = {
  pending:    { bg: '#fef9c3', text: '#854d0e', dot: '#eab308', label: 'Pending' },
  processing: { bg: '#fce7f3', text: '#9d174d', dot: '#e91e8c', label: 'Processing' },
  shipped:    { bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6', label: 'Shipped' },
  delivered:  { bg: '#dcfce7', text: '#166534', dot: '#22c55e', label: 'Delivered' },
  cancelled:  { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444', label: 'Cancelled' },
}

const STAT_CARDS = [
  {
    label: 'Total Revenue',
    key: 'totalRevenue',
    icon: TrendingUp,
    gradient: 'linear-gradient(135deg, #e91e8c 0%, #f43f5e 100%)',
    glow: 'rgba(233,30,140,0.25)',
    isCurrency: true,
    change: '+12.5%',
    up: true,
    desc: 'vs last month',
  },
  {
    label: 'Total Orders',
    key: 'totalOrders',
    icon: ShoppingBag,
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    glow: 'rgba(99,102,241,0.2)',
    isCurrency: false,
    change: '+8.2%',
    up: true,
    desc: 'vs last month',
  },
  {
    label: 'Active Products',
    key: 'totalProducts',
    icon: Package,
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
    glow: 'rgba(139,92,246,0.2)',
    isCurrency: false,
    change: '+3',
    up: true,
    desc: 'new this month',
  },
  {
    label: 'Customers',
    key: 'totalCustomers',
    icon: Users,
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    glow: 'rgba(16,185,129,0.2)',
    isCurrency: false,
    change: '+18.7%',
    up: true,
    desc: 'vs last month',
  },
] as const

async function getStats(): Promise<StatsData | null> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/admin/stats`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function AdminDashboard() {
  const [stats, session] = await Promise.all([getStats(), auth()])
  const firstName = session?.user?.name?.split(' ')[0] ?? 'Admin'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">

      {/* ── Page Header ────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e91e8c', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Admin Dashboard
          </p>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            {greeting}, {firstName} 👋
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.3rem 0 0' }}>
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #e91e8c, #f43f5e)', boxShadow: '0 4px 14px rgba(233,30,140,0.35)' }}
        >
          <Zap size={14} />
          View Orders
          <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* ── Stat Cards ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, key, icon: Icon, gradient, glow, isCurrency, change, up, desc }) => {
          const raw = stats?.[key as keyof StatsData] ?? 0
          const value = isCurrency
            ? `৳${Number(raw).toLocaleString('en-BD')}`
            : raw
          return (
            <div
              key={label}
              style={{
                background: 'white',
                borderRadius: '1.25rem',
                padding: '1.5rem',
                border: '1px solid #f1f5f9',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle glow blob */}
              <div style={{
                position: 'absolute', top: '-20px', right: '-20px',
                width: '80px', height: '80px', borderRadius: '50%',
                background: glow, filter: 'blur(20px)',
                pointerEvents: 'none',
              }} />

              {/* Icon */}
              <div style={{
                width: '2.75rem', height: '2.75rem', borderRadius: '0.875rem',
                background: gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1rem',
                boxShadow: `0 4px 12px ${glow}`,
              }}>
                <Icon size={18} color="white" />
              </div>

              {/* Value */}
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1, letterSpacing: '-0.03em' }}>
                {value}
              </p>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.35rem 0 0.75rem', fontWeight: 600 }}>
                {label}
              </p>

              {/* Change badge */}
              <span
                className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg"
                style={up
                  ? { background: '#f0fdf4', color: '#16a34a' }
                  : { background: '#fef2f2', color: '#dc2626' }
                }
              >
                {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                {change}
                <span style={{ fontWeight: 500, color: up ? '#86efac' : '#fca5a5' }}>{desc}</span>
              </span>
            </div>
          )
        })}
      </div>

      {/* ── Bottom Grid ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Orders — 2 cols */}
        <div
          className="lg:col-span-2"
          style={{
            background: 'white',
            borderRadius: '1.25rem',
            border: '1px solid #f1f5f9',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f8fafc' }}>
            <div className="flex items-center gap-2.5">
              <div style={{ width: 32, height: 32, borderRadius: '0.625rem', background: 'rgba(233,30,140,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart3 size={15} color="#e91e8c" />
              </div>
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Recent Orders</p>
                <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>Last 5 transactions</p>
              </div>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-bold transition-opacity hover:opacity-70 px-3 py-1.5 rounded-lg"
              style={{ color: '#e91e8c', background: 'rgba(233,30,140,0.06)' }}
            >
              View all <ChevronRight size={12} />
            </Link>
          </div>

          {/* Table header */}
          <div
            className="grid px-6 py-3"
            style={{
              gridTemplateColumns: '1fr 130px 110px 90px',
              fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8',
              textTransform: 'uppercase', letterSpacing: '0.07em',
              background: '#f8fafc', borderBottom: '1px solid #f1f5f9',
            }}
          >
            <span>Order</span>
            <span>Customer</span>
            <span>Status</span>
            <span style={{ textAlign: 'right' }}>Amount</span>
          </div>

          {/* Rows */}
          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            stats.recentOrders.map((order) => {
              const cfg = STATUS_CONFIG[order.status as StatusKey] ?? STATUS_CONFIG.processing
              return (
                <div
                  key={order._id}
                  className="grid px-6 py-4 hover:bg-slate-50 transition-colors"
                  style={{ gridTemplateColumns: '1fr 130px 110px 90px', borderBottom: '1px solid #f8fafc' }}
                >
                  <div className="flex items-center gap-3">
                    <div style={{
                      width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem',
                      background: 'linear-gradient(135deg, rgba(233,30,140,0.08), rgba(244,63,94,0.04))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <ShoppingBag size={12} color="#e91e8c" />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                        #{order.orderNumber}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock size={9} color="#cbd5e1" />
                        <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0 }}>
                          {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0, fontWeight: 500 }}>
                      {order.shipping?.fullName ?? 'Customer'}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg capitalize"
                      style={{ background: cfg.bg, color: cfg.text }}
                    >
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
                      {cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-end">
                    <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      ৳{order.total.toLocaleString('en-BD')}
                    </p>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div style={{
                width: '3.5rem', height: '3.5rem', borderRadius: '1rem',
                background: 'linear-gradient(135deg, rgba(233,30,140,0.06), rgba(244,63,94,0.03))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.875rem',
              }}>
                <ShoppingBag size={20} color="#cbd5e1" />
              </div>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#64748b', margin: 0 }}>No orders yet</p>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.25rem 0 0' }}>
                Orders will appear here once customers start buying
              </p>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">

          {/* Orders by Status */}
          <div style={{
            background: 'white', borderRadius: '1.25rem',
            border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden',
          }}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid #f8fafc' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>By Status</p>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '2px 0 0' }}>Order breakdown</p>
            </div>
            <div className="px-5 py-4 space-y-3.5">
              {stats?.ordersByStatus && stats.ordersByStatus.length > 0 ? (
                stats.ordersByStatus.map((s) => {
                  const cfg = STATUS_CONFIG[s._id as StatusKey] ?? STATUS_CONFIG.processing
                  const total = stats.ordersByStatus.reduce((a, b) => a + b.count, 0)
                  const pct = total > 0 ? Math.round((s.count / total) * 100) : 0
                  return (
                    <div key={s._id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold capitalize"
                          style={{ color: cfg.text }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot }} />
                          {cfg.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{pct}%</span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e293b' }}>{s.count}</span>
                        </div>
                      </div>
                      <div style={{ height: '5px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', background: cfg.dot, borderRadius: '99px',
                          width: `${pct}%`, transition: 'width 0.8s ease',
                        }} />
                      </div>
                    </div>
                  )
                })
              ) : (
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', padding: '1rem 0' }}>
                  No data yet
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            background: 'white', borderRadius: '1.25rem',
            border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden',
          }}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid #f8fafc' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Quick Actions</p>
            </div>
            <div className="p-3 space-y-0.5">
              {[
                { label: '➕ Add New Product',   href: '/admin/products'  },
                { label: '📦 Manage Orders',      href: '/admin/orders'    },
                { label: '👥 View Customers',     href: '/admin/customers' },
                { label: '⚡ Flash Sale Setup',   href: '/admin/flash-sale'},
                { label: '⚙️ Store Settings',     href: '/admin/settings'  },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-slate-50 group"
                  style={{ color: '#475569' }}
                >
                  {label}
                  <ChevronRight size={13} className="text-slate-300 group-hover:text-pink-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}