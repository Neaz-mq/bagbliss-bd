'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Tag,
  Zap,
  Settings,
  X,
  TrendingUp,
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/flash-sale', label: 'Flash Sale', icon: Zap },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function AdminSidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-60 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #e91e8c, #f43f5e)' }}>
              <TrendingUp size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">BagBliss</p>
              <p className="text-xs mt-0.5" style={{ color: '#e91e8c' }}>Admin Panel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav label */}
        <p className="px-5 pt-5 pb-2 text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Navigation
        </p>

        {/* Nav Items */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-4">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact)
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  active
                    ? 'text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/8'
                }`}
                style={active ? {
                  background: 'linear-gradient(135deg, rgba(233,30,140,0.25), rgba(244,63,94,0.15))',
                  boxShadow: 'inset 0 0 0 1px rgba(233,30,140,0.3)',
                } : {}}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full" style={{ background: '#e91e8c' }} />
                )}
                <Icon size={17} className={active ? 'text-rose-400' : 'text-white/40 group-hover:text-white/70 transition-colors'} />
                {label}
                {label === 'Flash Sale' && (
                  <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(233,30,140,0.3)', color: '#fb7185' }}>
                    HOT
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="px-4 py-4 border-t border-white/8">
          <div className="rounded-xl p-3" style={{ background: 'rgba(233,30,140,0.1)', border: '1px solid rgba(233,30,140,0.2)' }}>
            <p className="text-xs font-semibold text-white/80 mb-0.5">Store Status</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs text-white/50">Live & Running</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}