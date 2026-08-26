'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import {
  LayoutDashboard, ShoppingBag, Package,
  Users, Tag, Zap, Settings, X,
  ShoppingCart, ExternalLink,
} from 'lucide-react'

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

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function AdminSidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname()
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const asideRef = useRef<HTMLElement>(null)

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  // Close on route change happens via onClick on each Link already,
  // but also close whenever the pathname changes for safety (e.g. back/forward nav).
  useEffect(() => {
    onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Lock background scroll while the drawer is open on mobile.
  useEffect(() => {
    if (!isOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [isOpen])

  // Close on Escape, and move focus into the drawer for keyboard/a11y users.
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    closeBtnRef.current?.focus()

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        ref={asideRef}
        role="navigation"
        aria-label="Admin sidebar"
        className={`
          fixed top-0 left-0 z-30 flex h-full w-[260px] flex-col
          bg-[#0d1117] border-r border-white/10
          transition-transform duration-300 ease-in-out
          lg:static lg:z-auto lg:shrink-0 lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* ── Logo header ──────────────────────── */}
        <div className="flex-shrink-0 border-b border-white/10 px-4 pb-3.5 pt-4">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 min-w-9 items-center justify-center rounded-[10px] shadow-[0_4px_12px_rgba(202,134,93,0.4)]"
              style={{ background: 'linear-gradient(135deg, #CA865D 0%, #c9a84c 100%)' }}
            >
              <ShoppingCart size={17} color="white" strokeWidth={2.2} />
            </div>

            <div className="min-w-0 flex-1">
              {/* Inline color forces contrast regardless of Tailwind class resolution */}
              <p
                className="m-0 whitespace-nowrap text-[0.92rem] font-bold tracking-tight"
                style={{ color: '#ffffff' }}
              >
                BagBliss BD
              </p>
              <p
                className="m-0 mt-[3px] whitespace-nowrap text-[0.62rem] font-semibold uppercase tracking-[0.08em]"
                style={{ color: '#f0b98a' }}
              >
                Admin Panel
              </p>
            </div>

            {/* Close button — larger tap target, real hover/active/focus feedback, always clickable */}
            <button
              ref={closeBtnRef}
              type="button"
              suppressHydrationWarning
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              aria-label="Close sidebar"
              className="
                relative z-10 flex h-10 w-10 min-w-10 shrink-0 cursor-pointer
                items-center justify-center rounded-lg border border-white/10
                bg-white/10 text-white/80 outline-none
                transition-colors duration-150
                hover:bg-white/20 hover:text-white
                active:scale-95 active:bg-white/25
                focus-visible:ring-2 focus-visible:ring-[#e8c96e]
                lg:hidden
              "
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* ── Navigation ───────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3.5 [scrollbar-width:none]">
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.label} className={gi < NAV_GROUPS.length - 1 ? 'mb-[22px]' : ''}>
              <p
                className="mb-1.5 px-2.5 text-[0.66rem] font-bold uppercase tracking-[0.09em]"
                style={{ color: '#8b98ac' }}
              >
                {group.label}
              </p>

              <div className="flex flex-col gap-px">
                {group.items.map((item) => {
                  const { href, label, icon: Icon, exact, badge } = item
                  const active = isActive(href, exact)
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      aria-current={active ? 'page' : undefined}
                      className={`
                        relative flex items-center gap-2.5 rounded-lg py-2.5 pl-3.5 pr-2.5
                        text-[0.875rem] no-underline transition-colors duration-150
                        ${active ? 'bg-[rgba(202,134,93,0.18)] font-semibold' : 'font-normal hover:bg-white/10'}
                      `}
                      style={{ color: active ? '#ffffff' : '#c3cad6' }}
                    >
                      {active && (
                        <span
                          className="absolute left-0 top-1/2 h-[18px] w-[3px] -translate-y-1/2 rounded-r-[3px]"
                          style={{ background: 'linear-gradient(to bottom, #CA865D, #c9a84c)' }}
                        />
                      )}

                      <Icon
                        size={17}
                        className="shrink-0"
                        style={{ color: active ? '#e8c96e' : '#8b98ac' }}
                      />

                      <span className="flex-1">{label}</span>

                      {badge != null && (
                        <span
                          className="shrink-0 rounded-[5px] bg-[rgba(202,134,93,0.25)] px-[7px] py-0.5 text-[0.6rem] font-bold tracking-[0.04em]"
                          style={{ color: '#f0d18f' }}
                        >
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
        <div className="flex-shrink-0 border-t border-white/10 px-3 pb-3.5 pt-2.5">
          <div className="rounded-[10px] border border-white/10 bg-white/[0.04] px-3.5 py-3">
            <div className="mb-[7px] flex items-center justify-between">
              <span className="text-[0.78rem] font-semibold" style={{ color: '#e2e8f0' }}>
                Store Status
              </span>
              <div className="flex items-center gap-[5px]">
                <span className="inline-block h-[7px] w-[7px] rounded-full bg-[#22c55e] shadow-[0_0_7px_rgba(34,197,94,0.7)]" />
                <span className="text-[0.72rem] font-semibold" style={{ color: '#4ade80' }}>
                  Live
                </span>
              </div>
            </div>

            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1 text-[0.72rem] no-underline transition-colors"
              style={{ color: '#9aa5b5' }}
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