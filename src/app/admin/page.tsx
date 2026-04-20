import { ShoppingBag, Package, Users, TrendingUp } from 'lucide-react'
import { auth } from '@/lib/auth'

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

const STATUS_STYLES: Record<string, string> = {
  processing: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
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

  const statCards = [
    {
      label: 'Total Revenue',
      value: `৳${(stats?.totalRevenue ?? 0).toLocaleString('en-BD')}`,
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders ?? 0,
      icon: ShoppingBag,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Active Products',
      value: stats?.totalProducts ?? 0,
      icon: Package,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'Customers',
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      color: 'text-rose-600 bg-rose-50',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Welcome back, {session?.user?.name?.split(' ')[0]}! Here&apos;s what&apos;s happening.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-sm text-slate-500">{label}</p>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Recent Orders</h2>
          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {stats.recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      #{order.orderNumber}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-BD', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${
                        STATUS_STYLES[order.status] ?? 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      ৳{order.total.toLocaleString('en-BD')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-10">No orders yet</p>
          )}
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">By Status</h2>
          {stats?.ordersByStatus && stats.ordersByStatus.length > 0 ? (
            <div className="space-y-3">
              {stats.ordersByStatus.map((s) => (
                <div key={s._id} className="flex items-center justify-between">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${
                      STATUS_STYLES[s._id] ?? 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {s._id}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{s.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">No data</p>
          )}
        </div>
      </div>
    </div>
  )
}