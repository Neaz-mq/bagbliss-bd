'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, Package,
  Users, Tag, Zap, Settings, X,
  TrendingUp, ChevronRight,
} from 'lucide-react'

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Store',
    items: [
      { href: '/admin/orders',     label: 'Orders',     icon: ShoppingBag, badge: null },
      { href: '/admin/products',   label: 'Products',   icon: Package,     badge: null },
      { href: '/admin/customers',  label: 'Customers',  icon: Users,       badge: null },
      { href: '/admin/categories', label: 'Categories', icon: Tag,         badge: null },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { href: '/admin/flash-sale', label: 'Flash Sale', icon: Zap, badge: 'HOT' },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/settings', label: 'Settings', icon: Settings, badge: null },
    ],
  },
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
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-30 h-full flex flex-col
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:z-auto lg:shrink-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          width: '260px',
          background: 'linear-gradient(180deg, #0d1117 0%, #0f172a 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >

        {/* ── Logo ─────────────────────────────── */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #e91e8c 0%, #f43f5e 100%)',
                boxShadow: '0 4px 12px rgba(233,30,140,0.4)',
              }}
            >
              <TrendingUp size={18} color="white" />
            </div>
            <div>
              <p style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1, margin: 0 }}>
                BagBliss
              </p>
              <p style={{ color: '#e91e8c', fontWeight: 600, fontSize: '0.7rem', marginTop: '3px', letterSpacing: '0.02em', margin: 0 }}>
                Admin Panel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden flex items-center justify-center rounded-lg transition-colors hover:bg-white/10"
            style={{ width: '30px', height: '30px', color: 'rgba(255,255,255,0.4)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Navigation ───────────────────────── */}
        <nav
          className="flex-1 overflow-y-auto py-5 px-4"
          style={{ scrollbarWidth: 'none' }}
        >
          {NAV_GROUPS.map((group) => (
            <div key={group.label} style={{ marginBottom: '28px' }}>

              {/* Group label */}
              <p style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.2)',
                paddingLeft: '12px',
                marginBottom: '6px',
                margin: '0 0 6px 0',
              }}>
                {group.label}
              </p>

              {/* Nav items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {group.items.map(({ href, label, icon: Icon, exact, badge }) => {
                  const active = isActive(href, exact)
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      className="admin-nav-link"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '11px 12px',
                        borderRadius: '10px',
                        fontSize: '0.875rem',
                        fontWeight: active ? 600 : 500,
                        textDecoration: 'none',
                        position: 'relative',
                        color: active ? 'white' : 'rgba(255,255,255,0.45)',
                        background: active
                          ? 'linear-gradient(135deg, rgba(233,30,140,0.18) 0%, rgba(244,63,94,0.08) 100%)'
                          : 'transparent',
                        boxShadow: active
                          ? 'inset 0 0 0 1px rgba(233,30,140,0.22)'
                          : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {/* Active left bar */}
                      {active && (
                        <span style={{
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '3px',
                          height: '20px',
                          borderRadius: '0 3px 3px 0',
                          background: 'linear-gradient(to bottom, #e91e8c, #f43f5e)',
                        }} />
                      )}

                      {/* Icon */}
                      <Icon
                        size={18}
                        style={{
                          color: active ? '#f472b6' : 'rgba(255,255,255,0.3)',
                          flexShrink: 0,
                          transition: 'color 0.15s',
                        }}
                      />

                      {/* Label */}
                      <span style={{ flex: 1 }}>{label}</span>

                      {/* Badge */}
                      {badge && (
                        <span style={{
                          fontSize: '0.6rem',
                          fontWeight: 800,
                          padding: '2px 7px',
                          borderRadius: '6px',
                          background: 'rgba(233,30,140,0.25)',
                          color: '#fb7185',
                          letterSpacing: '0.03em',
                        }}>
                          {badge}
                        </span>
                      )}

                      {/* Chevron */}
                      {active && !badge && (
                        <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.25)' }} />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Store Status ─────────────────────── */}
        <div
          className="px-4 py-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div style={{
            borderRadius: '12px',
            padding: '14px',
            background: 'rgba(233,30,140,0.07)',
            border: '1px solid rgba(233,30,140,0.16)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                Store Live
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: '#34d399',
                  boxShadow: '0 0 6px rgba(52,211,153,0.6)',
                  display: 'inline-block',
                }} />
                <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>Online</span>
              </div>
            </div>
            <Link
              href="/"
              target="_blank"
              style={{
                fontSize: '0.72rem',
                color: 'rgba(255,255,255,0.3)',
                textDecoration: 'none',
              }}
            >
              bagbliss-bd.vercel.app ↗
            </Link>
          </div>
        </div>

      </aside>
    </>
  )
}