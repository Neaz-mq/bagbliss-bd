import {
  ShoppingBag, Package, Users, TrendingUp,
  ArrowUpRight, ArrowDownRight, Clock, ChevronRight,
  Zap, BarChart3, Activity,
} from 'lucide-react'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import QuickActions from '@/components/admin/QuickActions'

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

const STATUS_CONFIG: Record<StatusKey, { bg: string; text: string; dot: string; border: string; label: string }> = {
  pending:    { bg: 'rgba(234,179,8,0.08)',  text: '#b45309', dot: '#f59e0b', border: 'rgba(234,179,8,0.2)',   label: 'Pending'    },
  processing: { bg: 'rgba(233,30,140,0.08)', text: '#be185d', dot: '#e91e8c', border: 'rgba(233,30,140,0.2)', label: 'Processing' },
  shipped:    { bg: 'rgba(59,130,246,0.08)', text: '#1d4ed8', dot: '#3b82f6', border: 'rgba(59,130,246,0.2)', label: 'Shipped'    },
  delivered:  { bg: 'rgba(34,197,94,0.08)',  text: '#15803d', dot: '#22c55e', border: 'rgba(34,197,94,0.2)',  label: 'Delivered'  },
  cancelled:  { bg: 'rgba(239,68,68,0.08)',  text: '#b91c1c', dot: '#ef4444', border: 'rgba(239,68,68,0.2)',  label: 'Cancelled'  },
}

const STAT_CARDS = [
  { label: 'Total Revenue',   key: 'totalRevenue',   icon: TrendingUp,  accent: '#e91e8c', accentBg: 'rgba(233,30,140,0.1)', gradient: 'linear-gradient(135deg, #e91e8c 0%, #f43f5e 100%)', isCurrency: true,  change: '+12.5%', up: true, desc: 'vs last month' },
  { label: 'Total Orders',    key: 'totalOrders',    icon: ShoppingBag, accent: '#6366f1', accentBg: 'rgba(99,102,241,0.1)', gradient: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', isCurrency: false, change: '+8.2%',  up: true, desc: 'vs last month' },
  { label: 'Active Products', key: 'totalProducts',  icon: Package,     accent: '#a855f7', accentBg: 'rgba(168,85,247,0.1)', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)', isCurrency: false, change: '+3',     up: true, desc: 'new this month' },
  { label: 'Customers',       key: 'totalCustomers', icon: Users,       accent: '#10b981', accentBg: 'rgba(16,185,129,0.1)', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', isCurrency: false, change: '+18.7%', up: true, desc: 'vs last month' },
] as const

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
  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', padding: '4px 0 8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(233,30,140,0.08)', border: '1px solid rgba(233,30,140,0.18)', borderRadius: '999px', padding: '3px 12px 3px 8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#e91e8c', boxShadow: '0 0 6px rgba(233,30,140,0.8)', display: 'inline-block' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#e91e8c', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Live Dashboard</span>
            </div>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            {greeting}, {firstName}
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '6px 0 0' }}>
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
        <Link href="/admin/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, color: 'white', textDecoration: 'none', background: 'linear-gradient(135deg, #e91e8c, #f43f5e)', boxShadow: '0 4px 16px rgba(233,30,140,0.4)' }}>
          <Zap size={14} strokeWidth={2.5} /> View Orders <ArrowUpRight size={14} strokeWidth={2.5} />
        </Link>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {STAT_CARDS.map(({ label, key, icon: Icon, accent, accentBg, gradient, isCurrency, change, up, desc }) => {
          const raw   = stats?.[key as keyof StatsData] ?? 0
          const value = isCurrency ? `৳${Number(raw).toLocaleString('en-BD')}` : String(raw)
          return (
            <div key={label} style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-28px', right: '-28px', width: '90px', height: '90px', borderRadius: '50%', background: accentBg, pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color="white" strokeWidth={2} />
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', fontWeight: 700, padding: '4px 9px', borderRadius: '999px', background: up ? 'rgba(34,197,94,0.09)' : 'rgba(239,68,68,0.09)', color: up ? '#15803d' : '#b91c1c', border: `1px solid ${up ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                  {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />} {change}
                </span>
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1, letterSpacing: '-0.04em' }}>{value}</p>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '6px 0 0', fontWeight: 500 }}>{label}</p>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '10px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Activity size={11} style={{ color: accent }} /> {desc}
              </p>
            </div>
          )
        })}
      </div>

      {/* Bottom Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px' }} className="admin-dashboard-grid">

        {/* Recent Orders */}
        <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(233,30,140,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart3 size={16} color="#e91e8c" />
              </div>
              <div>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Recent Orders</p>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 0' }}>Last 5 transactions</p>
              </div>
            </div>
            <Link href="/admin/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 700, color: '#e91e8c', textDecoration: 'none', background: 'rgba(233,30,140,0.07)', border: '1px solid rgba(233,30,140,0.15)', padding: '6px 12px', borderRadius: '8px' }}>
              View all <ChevronRight size={12} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 120px 100px', padding: '10px 24px', fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', background: '#fafbfc', borderBottom: '1px solid #f1f5f9' }}>
            <span>Order</span><span>Customer</span><span>Status</span><span style={{ textAlign: 'right' }}>Amount</span>
          </div>

          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            stats.recentOrders.map((order, i) => {
              const cfg = STATUS_CONFIG[order.status as StatusKey] ?? STATUS_CONFIG.processing
              return (
                <div key={order._id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 120px 100px', padding: '14px 24px', borderBottom: i < stats.recentOrders.length - 1 ? '1px solid #f8fafc' : 'none', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, background: 'linear-gradient(135deg, rgba(233,30,140,0.07), rgba(244,63,94,0.04))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShoppingBag size={13} color="#e91e8c" />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>#{order.orderNumber}</p>
                      <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={9} />
                        {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0 }}>{order.shipping?.fullName ?? 'Customer'}</p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, padding: '5px 10px', borderRadius: '8px', background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`, width: 'fit-content' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} /> {cfg.label}
                  </span>
                  <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: 0, textAlign: 'right' }}>৳{order.total.toLocaleString('en-BD')}</p>
                </div>
              )
            })
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(233,30,140,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <ShoppingBag size={22} color="#cbd5e1" />
              </div>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', margin: 0 }}>No orders yet</p>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0' }}>Orders will appear here once customers start buying</p>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Order Status */}
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid #f8fafc' }}>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Order Status</p>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '3px 0 0' }}>Breakdown by status</p>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {stats?.ordersByStatus && stats.ordersByStatus.length > 0 ? (
                stats.ordersByStatus.map(s => {
                  const cfg   = STATUS_CONFIG[s._id as StatusKey] ?? STATUS_CONFIG.processing
                  const total = stats.ordersByStatus.reduce((a, b) => a + b.count, 0)
                  const pct   = total > 0 ? Math.round((s.count / total) * 100) : 0
                  return (
                    <div key={s._id}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: cfg.text }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: cfg.dot }} /> {cfg.label}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{pct}%</span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b' }}>{s.count}</span>
                        </div>
                      </div>
                      <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: cfg.dot, borderRadius: '999px', width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })
              ) : (
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', padding: '12px 0', margin: 0 }}>No data yet</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid #f8fafc' }}>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Quick Actions</p>
            </div>
            <QuickActions />
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .admin-dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}