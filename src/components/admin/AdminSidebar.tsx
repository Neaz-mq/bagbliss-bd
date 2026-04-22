'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, Package,
  Users, Tag, Zap, Settings, X,
  ShoppingCart, ExternalLink,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  exact?: boolean
  badge?: string | null
}

interface NavGroup {
  label: string
  items: NavItem[]
}

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Store',
    items: [
      { href: '/admin/orders',     label: 'Orders',     icon: ShoppingBag },
      { href: '/admin/products',   label: 'Products',   icon: Package     },
      { href: '/admin/customers',  label: 'Customers',  icon: Users       },
      { href: '/admin/categories', label: 'Categories', icon: Tag         },
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
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  isOpen: boolean
  onClose: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

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

      <aside
        className={`
          fixed top-0 left-0 z-30 h-full flex flex-col
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:z-auto lg:shrink-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          width: '260px',
          background: '#0d1117',
          borderRight: '1px solid rgba(255,255,255,0.07)',
        }}
      >

        {/* ── Logo header ──────────────────────── */}
        <div style={{
          padding: '16px 16px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', minWidth: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #e91e8c 0%, #f43f5e 100%)',
              boxShadow: '0 4px 12px rgba(233,30,140,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShoppingCart size={17} color="white" strokeWidth={2.2} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                color: '#ffffff', fontWeight: 700, fontSize: '0.92rem',
                margin: 0, letterSpacing: '-0.01em', whiteSpace: 'nowrap',
              }}>
                BagBliss BD
              </p>
              <p style={{
                color: 'rgba(244, 114, 182, 0.85)', fontWeight: 600,
                fontSize: '0.62rem', margin: '3px 0 0',
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                Admin Panel
              </p>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden"
              style={{
                width: '32px', height: '32px', minWidth: '32px',
                borderRadius: '8px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.7)',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
              }}
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* ── Navigation ───────────────────────── */}
        <nav style={{
          flex: 1, overflowY: 'auto',
          padding: '14px 10px', scrollbarWidth: 'none',
        }}>
          {NAV_GROUPS.map((group, gi) => (
            <div
              key={group.label}
              style={{ marginBottom: gi < NAV_GROUPS.length - 1 ? '22px' : 0 }}
            >
              <p style={{
                fontSize: '0.62rem', fontWeight: 700,
                letterSpacing: '0.09em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.28)',
                padding: '0 10px', marginBottom: '5px',
              }}>
                {group.label}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {group.items.map((item) => {
                  const { href, label, icon: Icon, exact, badge } = item
                  const active = isActive(href, exact)
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '9px 10px 9px 14px', borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: active ? 600 : 400,
                        textDecoration: 'none', position: 'relative',
                        color: active ? '#ffffff' : 'rgba(255,255,255,0.6)',
                        background: active ? 'rgba(233,30,140,0.15)' : 'transparent',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      {active && (
                        <span style={{
                          position: 'absolute', left: 0, top: '50%',
                          transform: 'translateY(-50%)',
                          width: '3px', height: '18px',
                          borderRadius: '0 3px 3px 0',
                          background: 'linear-gradient(to bottom, #e91e8c, #f43f5e)',
                        }} />
                      )}

                      <Icon
                        size={17}
                        style={{
                          color: active ? '#f472b6' : 'rgba(255,255,255,0.45)',
                          flexShrink: 0,
                        }}
                      />

                      <span style={{ flex: 1 }}>{label}</span>

                      {badge != null && (
                        <span style={{
                          fontSize: '0.6rem', fontWeight: 700,
                          padding: '2px 7px', borderRadius: '5px',
                          background: 'rgba(233,30,140,0.25)',
                          color: '#fb7185', letterSpacing: '0.04em', flexShrink: 0,
                        }}>
                          {badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Footer ───────────────────────────── */}
        <div style={{
          padding: '10px 12px 14px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}>
          <div style={{
            borderRadius: '10px', padding: '12px 14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: '7px',
            }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                Store Status
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: '#22c55e', boxShadow: '0 0 7px rgba(34,197,94,0.7)',
                  display: 'inline-block',
                }} />
                <span style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 600 }}>
                  Live
                </span>
              </div>
            </div>

            <Link
              href="/"
              target="_blank"
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: '0.72rem', color: 'rgba(255,255,255,0.38)',
                textDecoration: 'none',
              }}
            >
              <span>bagbliss-bd.vercel.app</span>
              <ExternalLink size={11} />
            </Link>
          </div>
        </div>

      </aside>
    </>
  )
}