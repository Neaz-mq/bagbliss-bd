import { ShoppingBag, Package, Users, TrendingUp, ArrowUpRight, Clock, ChevronRight } from 'lucide-react'
import { auth } from '@/lib/auth'
import Link from 'next/link'

interface RecentOrder {
  _id: string
  orderNumber: string
  total: number
  status: string
  createdAt: string
}

interface StatsData {
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  totalRevenue: number
  recentOrders: RecentOrder[]
  ordersByStatus: { _id: string; count: number }[]
}

type StatusKey = 'processing' | 'shipped' | 'delivered' | 'cancelled'

const STATUS_CONFIG: Record<StatusKey, { bg: string; text: string; dot: string }> = {
  processing: { bg: '#fef9c3', text: '#92400e', dot: '#f59e0b' },
  shipped:    { bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6' },
  delivered:  { bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
  cancelled:  { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
}

const STAT_CARDS = [
  { label: 'Total Revenue',   key: 'totalRevenue',  icon: TrendingUp, iconBg: '#fff1f2', iconColor: '#e11d48', isCurrency: true },
  { label: 'Total Orders',    key: 'totalOrders',   icon: ShoppingBag, iconBg: '#eff6ff', iconColor: '#2563eb', isCurrency: false },
  { label: 'Active Products', key: 'totalProducts', icon: Package,    iconBg: '#f5f3ff', iconColor: '#7c3aed', isCurrency: false },
  { label: 'Customers',       key: 'totalCustomers',icon: Users,      iconBg: '#ecfdf5', iconColor: '#059669', isCurrency: false },
] as const

const CHANGES = ['+12.5%', '+8.2%', '+3.1%', '+18.7%']

async function getStats(): Promise<StatsData | null> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/admin/stats`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

export default async function AdminDashboard() {
  const [stats, session] = await Promise.all([getStats(), auth()])
  const firstName = session?.user?.name?.split(' ')[0] ?? 'Admin'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0, fontFamily: 'var(--font-body)' }}>
            Good morning, {firstName} 👋
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0', fontFamily: 'var(--font-body)' }}>
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
        <Link
          href="/admin/orders"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            fontSize: '0.85rem', fontWeight: 600, padding: '0.5rem 1rem',
            borderRadius: '0.75rem', color: 'white', textDecoration: 'none',
            background: 'linear-gradient(135deg, #e91e8c, #f43f5e)',
          }}
        >
          View Orders <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {STAT_CARDS.map(({ label, key, icon: Icon, iconBg, iconColor, isCurrency }, i) => {
          const raw = stats?.[key] ?? 0
          const value = isCurrency ? `৳${Number(raw).toLocaleString()}` : raw
          return (
            <div key={label} style={{
              background: '#ffffff', borderRadius: '1rem', padding: '1.25rem',
              border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex', flexDirection: 'column', gap: '0.75rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{
                  width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem',
                  background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={18} color={iconColor} />
                </div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '2px',
                  fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.5rem',
                  borderRadius: '0.5rem', background: '#f0fdf4', color: '#15803d',
                }}>
                  <ArrowUpRight size={11} /> {CHANGES[i]}
                </span>
              </div>
              <div>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2, fontFamily: 'var(--font-body)' }}>
                  {value}
                </p>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.25rem 0 0', fontWeight: 500, fontFamily: 'var(--font-body)' }}>
                  {label}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Bottom Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>

          {/* Recent Orders */}
          <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid #f8fafc' }}>
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0, fontFamily: 'var(--font-body)' }}>Recent Orders</p>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 0', fontFamily: 'var(--font-body)' }}>Last 5 transactions</p>
              </div>
              <Link href="/admin/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '0.78rem', fontWeight: 600, color: '#e91e8c', textDecoration: 'none' }}>
                View all <ChevronRight size={13} />
              </Link>
            </div>

            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <div>
                {stats.recentOrders.map((order) => {
                  const cfg = STATUS_CONFIG[order.status as StatusKey] ?? { bg: '#f8fafc', text: '#475569', dot: '#94a3b8' }
                  return (
                    <div key={order._id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1.25rem', borderBottom: '1px solid #f8fafc' }}>
                      <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.75rem', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ShoppingBag size={15} color="#94a3b8" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', margin: 0, fontFamily: 'var(--font-body)' }}>
                          #{order.orderNumber}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '2px' }}>
                          <Clock size={11} color="#94a3b8" />
                          <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0, fontFamily: 'var(--font-body)' }}>
                            {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.72rem', fontWeight: 600, padding: '0.25rem 0.625rem', borderRadius: '0.5rem', background: cfg.bg, color: cfg.text, textTransform: 'capitalize', fontFamily: 'var(--font-body)' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
                          {order.status}
                        </span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-body)' }}>
                          ৳{order.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', textAlign: 'center' }}>
                <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <ShoppingBag size={20} color="#cbd5e1" />
                </div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b', margin: 0, fontFamily: 'var(--font-body)' }}>No orders yet</p>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.25rem 0 0', fontFamily: 'var(--font-body)' }}>Orders will appear here once customers start buying</p>
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Orders by Status */}
            <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden', flex: 1 }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f8fafc' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0, fontFamily: 'var(--font-body)' }}>By Status</p>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 0', fontFamily: 'var(--font-body)' }}>Current breakdown</p>
              </div>

              <div style={{ padding: '1rem 1.25rem' }}>
                {stats?.ordersByStatus && stats.ordersByStatus.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    {stats.ordersByStatus.map((s) => {
                      const cfg = STATUS_CONFIG[s._id as StatusKey] ?? { bg: '#f8fafc', text: '#475569', dot: '#94a3b8' }
                      const total = stats.ordersByStatus.reduce((a, b) => a + b.count, 0)
                      const pct = total > 0 ? Math.round((s.count / total) * 100) : 0
                      return (
                        <div key={s._id}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.78rem', fontWeight: 600, color: cfg.text, textTransform: 'capitalize', fontFamily: 'var(--font-body)' }}>
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cfg.dot }} />
                              {s._id}
                            </span>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', fontFamily: 'var(--font-body)' }}>{s.count}</span>
                          </div>
                          <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: cfg.dot, borderRadius: '99px', width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', padding: '1rem 0', fontFamily: 'var(--font-body)' }}>No data yet</p>
                )}
              </div>

              {/* Quick links */}
              <div style={{ padding: '0 1.25rem 1rem', borderTop: '1px solid #f8fafc' }}>
                {[
                  { label: 'Manage Products', href: '/admin/products' },
                  { label: 'View Customers', href: '/admin/customers' },
                  { label: 'Flash Sale Setup', href: '/admin/flash-sale' },
                ].map(({ label, href }) => (
                  <Link key={href} href={href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.78rem', fontWeight: 500, color: '#64748b', textDecoration: 'none', borderBottom: '1px solid #f8fafc', fontFamily: 'var(--font-body)' }}>
                    {label} <ChevronRight size={12} color="#cbd5e1" />
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}