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

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  processing: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  shipped:    { bg: 'bg-blue-50',  text: 'text-blue-700',  dot: 'bg-blue-400'  },
  delivered:  { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  cancelled:  { bg: 'bg-red-50',   text: 'text-red-700',   dot: 'bg-red-400'   },
}

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

  const statCards = [
    {
      label: 'Total Revenue',
      value: `৳${(stats?.totalRevenue ?? 0).toLocaleString()}`,
      icon: TrendingUp,
      change: '+12.5%',
      positive: true,
      gradient: 'from-rose-500 to-pink-600',
      bg: 'bg-rose-50',
      iconColor: 'text-rose-600',
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders ?? 0,
      icon: ShoppingBag,
      change: '+8.2%',
      positive: true,
      gradient: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Active Products',
      value: stats?.totalProducts ?? 0,
      icon: Package,
      change: '+3.1%',
      positive: true,
      gradient: 'from-violet-500 to-purple-600',
      bg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      label: 'Customers',
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      change: '+18.7%',
      positive: true,
      gradient: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Good morning, {firstName} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #e91e8c, #f43f5e)' }}
        >
          View Orders <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, change, positive, bg, iconColor }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon size={19} className={iconColor} />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-lg ${
                positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}>
                <ArrowUpRight size={11} />
                {change}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-0.5">{value}</p>
            <p className="text-xs text-slate-500 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Orders</h2>
              <p className="text-xs text-slate-400 mt-0.5">Last 5 transactions</p>
            </div>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
            >
              View all <ChevronRight size={13} />
            </Link>
          </div>

          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {stats.recentOrders.map((order) => {
                const cfg = STATUS_CONFIG[order.status] ?? { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400' }
                return (
                  <div key={order._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                    {/* Order icon */}
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <ShoppingBag size={15} className="text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800">#{order.orderNumber}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock size={11} className="text-slate-400" />
                        <p className="text-xs text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg capitalize ${cfg.bg} ${cfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {order.status}
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        ৳{order.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <ShoppingBag size={20} className="text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-500">No orders yet</p>
              <p className="text-xs text-slate-400 mt-0.5">Orders will appear here once customers start buying</p>
            </div>
          )}
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50">
            <h2 className="text-sm font-bold text-slate-900">Orders by Status</h2>
            <p className="text-xs text-slate-400 mt-0.5">Current breakdown</p>
          </div>

          {stats?.ordersByStatus && stats.ordersByStatus.length > 0 ? (
            <div className="p-5 space-y-3">
              {stats.ordersByStatus.map((s) => {
                const cfg = STATUS_CONFIG[s._id] ?? { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400' }
                const total = stats.ordersByStatus.reduce((a, b) => a + b.count, 0)
                const pct = total > 0 ? Math.round((s.count / total) * 100) : 0
                return (
                  <div key={s._id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`flex items-center gap-1.5 text-xs font-semibold capitalize ${cfg.text}`}>
                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        {s._id}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{pct}%</span>
                        <span className="text-xs font-bold text-slate-800">{s.count}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${cfg.dot}`}
                        style={{ width: `${pct}%`, transition: 'width 0.8s ease' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm text-slate-400">No data yet</p>
            </div>
          )}

          {/* Quick links */}
          <div className="px-5 pb-5 space-y-2">
            <div className="h-px bg-slate-50 mb-3" />
            {[
              { label: 'Manage Products', href: '/admin/products' },
              { label: 'View Customers', href: '/admin/customers' },
              { label: 'Flash Sale Setup', href: '/admin/flash-sale' },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between text-xs font-medium text-slate-500 hover:text-rose-500 transition-colors py-0.5 group"
              >
                {label}
                <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}