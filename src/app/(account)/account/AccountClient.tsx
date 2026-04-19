'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
  ShoppingBag,
  Star,
  Truck,
  Shield,
  Edit3,
  Mail,
  Phone,
  Calendar,
  Award,
  Clock,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Order {
  _id: string
  orderNumber: string
  createdAt: string
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: { name: string; price: number; quantity: number }[]
  total: number
}

const STATUS_CONFIG = {
  processing: {
    label: 'Processing',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    icon: Clock,
  },
  shipped: {
    label: 'Shipped',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.1)',
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    icon: Package,
  },
} as const

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatJoinDate(iso?: string | null) {
  if (!iso) return 'Recently joined'
  return new Date(iso).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })
}

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (!session?.user?.id) return
    fetch('/api/orders')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setOrders(d.orders)
      })
      .catch(console.error)
      .finally(() => setOrdersLoading(false))
  }, [session])

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut({ callbackUrl: '/' })
  }

  if (status === 'loading') {
    return (
      <div
        style={{
          paddingTop: '72px',
          minHeight: '100vh',
          background: 'var(--color-surface)',
        }}
      >
        <div className="container-bagbliss" style={{ paddingTop: '3rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '280px 1fr',
              gap: '2rem',
            }}
          >
            <div
              className="skeleton"
              style={{ height: '480px', borderRadius: 'var(--radius-xl)' }}
            />
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="skeleton"
                  style={{ height: '120px', borderRadius: 'var(--radius-xl)' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) return null

  const user = session.user
  const totalSpent = orders.reduce((acc, o) => acc + o.total, 0)
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length
  const recentOrders = orders.slice(0, 3)

  const NAV_ITEMS = [
    {
      icon: User,
      label: 'My Profile',
      href: '/account/profile',
      desc: 'Edit personal info',
    },
    {
      icon: Package,
      label: 'My Orders',
      href: '/account/orders',
      desc: `${orders.length} orders`,
    },
    { icon: Heart, label: 'Wishlist', href: '/wishlist', desc: 'Saved items' },
    {
      icon: MapPin,
      label: 'Addresses',
      href: '/account/addresses',
      desc: 'Delivery addresses',
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/account/settings',
      desc: 'Account preferences',
    },
  ]

  return (
    <div
      style={{
        paddingTop: '72px',
        minHeight: '100vh',
        background: 'var(--color-surface)',
        paddingBottom: '5rem',
      }}
    >
      {/* ── Hero Banner ─────────────────────────────────────────────── */}
      <div
        style={{
          background:
            'linear-gradient(135deg, var(--color-primary) 0%, #2d1b4e 60%, #1e0a2e 100%)',
          padding: '2.5rem 0',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '2rem',
        }}
      >
        {/* decorative blobs */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(233,30,140,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-40px',
            left: '10%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container-bagbliss">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              position: 'relative',
              zIndex: 1,
              flexWrap: 'wrap',
            }}
          >
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name ?? ''}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid rgba(233,30,140,0.5)',
                    boxShadow: '0 0 0 4px rgba(233,30,140,0.15)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background:
                      'linear-gradient(135deg, var(--color-accent), #c2185b)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: 'white',
                    border: '3px solid rgba(233,30,140,0.5)',
                    boxShadow: '0 0 0 4px rgba(233,30,140,0.15)',
                  }}
                >
                  {user.name?.[0]?.toUpperCase() ?? 'U'}
                </div>
              )}
              {/* online dot */}
              <span
                style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  border: '2px solid #1a1a2e',
                }}
              />
            </div>

            {/* Name & info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                  marginBottom: '0.35rem',
                }}
              >
                <h1
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.5rem,3vw,2rem)',
                    fontWeight: 700,
                    color: 'white',
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {user.name ?? 'Welcome'}
                </h1>
                {(user as { role?: string }).role === 'admin' && (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      background: 'var(--color-gold)',
                      color: 'var(--color-primary)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Admin
                  </span>
                )}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  flexWrap: 'wrap',
                }}
              >
                {user.email && (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.85rem',
                      color: 'rgba(255,255,255,0.6)',
                    }}
                  >
                    <Mail size={13} /> {user.email}
                  </span>
                )}
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  <Calendar size={13} /> Member since{' '}
                  {formatJoinDate((user as { createdAt?: string }).createdAt)}
                </span>
              </div>
            </div>

            {/* Edit Profile button */}
            <Link
              href="/account/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.25rem',
                border: '2px solid rgba(255,255,255,0.2)',
                borderRadius: '9999px',
                color: 'white',
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: '0.85rem',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                background: 'transparent',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLAnchorElement).style.background =
                  'rgba(255,255,255,0.1)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLAnchorElement).style.background =
                  'transparent'
              }}
            >
              <Edit3 size={15} /> Edit Profile
            </Link>
          </div>
        </div>
      </div>

      <div className="container-bagbliss">
        {/* ── Stats Row ──────────────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            marginBottom: '2rem',
          }}
          className="account-stats-grid"
        >
          {[
            {
              icon: Package,
              label: 'Total Orders',
              value: orders.length,
              color: 'var(--color-accent)',
            },
            {
              icon: TrendingUp,
              label: 'Total Spent',
              value: `৳${totalSpent.toLocaleString('en-BD')}`,
              color: 'var(--color-gold)',
            },
            {
              icon: CheckCircle2,
              label: 'Delivered',
              value: deliveredCount,
              color: '#22c55e',
            },
            {
              icon: Award,
              label: 'Member Status',
              value: totalSpent >= 5000 ? 'Gold' : 'Silver',
              color: '#c9a84c',
            },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                style={{
                  background: 'white',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid rgba(26,26,46,0.06)',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    background: `${stat.color}18`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={22} color={stat.color} />
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.75rem',
                      color: 'var(--color-text-muted)',
                      margin: '0 0 0.2rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {stat.label}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: stat.color,
                      margin: 0,
                    }}
                  >
                    {stat.value}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Main Layout ─────────────────────────────────────────────── */}
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}
          className="account-layout"
        >
          {/* Left: Navigation Menu */}
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            className="account-nav-col"
          >
            {/* Quick Nav Card */}
            <div
              style={{
                background: 'white',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid rgba(26,26,46,0.06)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid rgba(26,26,46,0.06)',
                }}
              >
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    color: 'var(--color-primary)',
                    margin: 0,
                  }}
                >
                  My Account
                </h2>
              </div>
              <div style={{ padding: '0.5rem 0' }}>
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.875rem 1.5rem',
                        textDecoration: 'none',
                        transition: 'all 0.15s ease',
                        borderLeft: '3px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLAnchorElement
                        el.style.background = 'rgba(233,30,140,0.04)'
                        el.style.borderLeftColor = 'var(--color-accent)'
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLAnchorElement
                        el.style.background = 'transparent'
                        el.style.borderLeftColor = 'transparent'
                      }}
                    >
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(233,30,140,0.07)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={18} color="var(--color-accent)" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            color: 'var(--color-primary)',
                            margin: 0,
                          }}
                        >
                          {item.label}
                        </p>
                        <p
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.75rem',
                            color: 'var(--color-text-muted)',
                            margin: 0,
                          }}
                        >
                          {item.desc}
                        </p>
                      </div>
                      <ChevronRight size={16} color="var(--color-text-muted)" />
                    </Link>
                  )
                })}
              </div>

              {/* Sign Out */}
              <div
                style={{
                  padding: '0.5rem 0.75rem 0.75rem',
                  borderTop: '1px solid rgba(26,26,46,0.06)',
                }}
              >
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.875rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    color: 'var(--color-error)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = 'none')
                  }
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(239,68,68,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <LogOut size={18} color="var(--color-error)" />
                  </div>
                  {signingOut ? 'Signing out…' : 'Sign Out'}
                </button>
              </div>
            </div>

            {/* Trust badges */}
            <div
              style={{
                background: 'white',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid rgba(26,26,46,0.06)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.875rem',
              }}
            >
              {[
                { icon: Shield, text: 'Secure & Encrypted Account' },
                { icon: Truck, text: 'Free shipping on ৳1500+' },
                { icon: Star, text: 'Earn rewards on every order' },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <Icon size={16} color="var(--color-accent)" />
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.8rem',
                      color: 'var(--color-text-secondary)',
                      fontWeight: 600,
                    }}
                  >
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Content Area */}
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            className="account-content-col"
          >
            {/* Recent Orders */}
            <div
              style={{
                background: 'white',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid rgba(26,26,46,0.06)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid rgba(26,26,46,0.06)',
                }}
              >
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    color: 'var(--color-primary)',
                    margin: 0,
                  }}
                >
                  Recent Orders
                </h2>
                <Link
                  href="/account/orders"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    color: 'var(--color-accent)',
                    textDecoration: 'none',
                  }}
                >
                  View All <ChevronRight size={14} />
                </Link>
              </div>

              {ordersLoading ? (
                <div
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="skeleton"
                      style={{
                        height: '72px',
                        borderRadius: 'var(--radius-md)',
                      }}
                    />
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'rgba(233,30,140,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem',
                      color: 'var(--color-accent)',
                    }}
                  >
                    <ShoppingBag size={28} strokeWidth={1.5} />
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.1rem',
                      color: 'var(--color-primary)',
                      margin: '0 0 0.5rem',
                    }}
                  >
                    No orders yet
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.875rem',
                      color: 'var(--color-text-muted)',
                      margin: '0 0 1.25rem',
                    }}
                  >
                    Start exploring our bag collection!
                  </p>
                  <Link
                    href="/shop"
                    className="btn-primary"
                    style={{ fontSize: '0.82rem', padding: '0.625rem 1.5rem' }}
                  >
                    Browse Shop
                  </Link>
                </div>
              ) : (
                <div>
                  {recentOrders.map((order) => {
                    const cfg =
                      STATUS_CONFIG[order.status] ?? STATUS_CONFIG.processing
                    const StatusIcon = cfg.icon
                    return (
                      <div
                        key={order._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '1rem 1.5rem',
                          borderBottom: '1px solid rgba(26,26,46,0.05)',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            'rgba(26,26,46,0.015)')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = 'transparent')
                        }
                      >
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--color-surface)',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(26,26,46,0.06)',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          <ShoppingBag size={18} strokeWidth={1.5} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              marginBottom: '0.2rem',
                              flexWrap: 'wrap',
                            }}
                          >
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                color: 'var(--color-primary)',
                              }}
                            >
                              #{order.orderNumber}
                            </span>
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                color: cfg.color,
                                background: cfg.bg,
                                padding: '0.15rem 0.5rem',
                                borderRadius: '9999px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                              }}
                            >
                              <StatusIcon size={11} /> {cfg.label}
                            </span>
                          </div>
                          <p
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: '0.78rem',
                              color: 'var(--color-text-muted)',
                              margin: 0,
                            }}
                          >
                            {order.items.length} item
                            {order.items.length !== 1 ? 's' : ''} ·{' '}
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            color: 'var(--color-accent)',
                            flexShrink: 0,
                          }}
                        >
                          ৳{order.total.toLocaleString('en-BD')}
                        </span>
                      </div>
                    )
                  })}
                  <div style={{ padding: '1rem 1.5rem' }}>
                    <Link
                      href="/account/orders"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-full)',
                        border: '2px solid rgba(26,26,46,0.1)',
                        color: 'var(--color-text-secondary)',
                        fontFamily: 'var(--font-body)',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLAnchorElement
                        el.style.borderColor = 'var(--color-accent)'
                        el.style.color = 'var(--color-accent)'
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLAnchorElement
                        el.style.borderColor = 'rgba(26,26,46,0.1)'
                        el.style.color = 'var(--color-text-secondary)'
                      }}
                    >
                      View All Orders <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions Grid */}
            <div
              style={{
                background: 'white',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid rgba(26,26,46,0.06)',
                padding: '1.5rem',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  margin: '0 0 1.25rem',
                }}
              >
                Quick Actions
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.875rem',
                }}
              >
                {[
                  {
                    icon: ShoppingBag,
                    label: 'Shop Now',
                    href: '/shop',
                    bg: 'var(--color-accent)',
                    color: 'white',
                  },
                  {
                    icon: Heart,
                    label: 'My Wishlist',
                    href: '/wishlist',
                    bg: 'rgba(233,30,140,0.08)',
                    color: 'var(--color-accent)',
                  },
                  {
                    icon: Package,
                    label: 'Track Orders',
                    href: '/account/orders',
                    bg: 'rgba(59,130,246,0.08)',
                    color: '#3b82f6',
                  },
                  {
                    icon: MapPin,
                    label: 'Manage Address',
                    href: '/account/addresses',
                    bg: 'rgba(201,168,76,0.1)',
                    color: 'var(--color-gold)',
                  },
                ].map(({ icon: Icon, label, href, bg, color }) => (
                  <Link
                    key={href}
                    href={href}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.625rem',
                      padding: '1.25rem 1rem',
                      borderRadius: 'var(--radius-lg)',
                      background: bg,
                      textDecoration: 'none',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      border: '1px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLAnchorElement).style.transform =
                        'translateY(-2px)'
                      ;(e.currentTarget as HTMLAnchorElement).style.boxShadow =
                        '0 8px 24px rgba(0,0,0,0.1)'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLAnchorElement).style.transform =
                        'none'
                      ;(e.currentTarget as HTMLAnchorElement).style.boxShadow =
                        'none'
                    }}
                  >
                    <Icon size={22} color={color} />
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        color,
                      }}
                    >
                      {label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Account Info Card */}
            <div
              style={{
                background: 'white',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid rgba(26,26,46,0.06)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid rgba(26,26,46,0.06)',
                }}
              >
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    color: 'var(--color-primary)',
                    margin: 0,
                  }}
                >
                  Account Information
                </h2>
                <Link
                  href="/account/profile"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    color: 'var(--color-accent)',
                    textDecoration: 'none',
                  }}
                >
                  <Edit3 size={13} /> Edit
                </Link>
              </div>
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1.25rem',
                }}
              >
                {[
                  { icon: User, label: 'Full Name', value: user.name ?? '—' },
                  {
                    icon: Mail,
                    label: 'Email Address',
                    value: user.email ?? '—',
                  },
                  { icon: Phone, label: 'Phone', value: 'Not added yet' },
                  {
                    icon: Shield,
                    label: 'Account Type',
                    value:
                      (user as { role?: string }).role === 'admin'
                        ? 'Administrator'
                        : 'Customer',
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <Icon size={13} color="var(--color-text-muted)" />
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: 'var(--color-text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {label}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: 'var(--color-primary)',
                        wordBreak: 'break-all',
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (min-width: 768px) {
          .account-stats-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
        @media (min-width: 1024px) {
          .account-layout {
            grid-template-columns: 300px 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
