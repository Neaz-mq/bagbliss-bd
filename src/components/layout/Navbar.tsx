'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  ShoppingBag, Heart, Search, User, Menu, X,
  LogOut, Package, Settings, ChevronDown,
  Home, Grid3X3,
} from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'

/* ─── constants ────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Home',         href: '/'                       },
  { label: 'Shop',         href: '/shop'                   },
  { label: 'New Arrivals', href: '/shop?sort=newest'       },
  { label: 'Flash Sale',   href: '/shop?filter=flash-sale' },
] as const

const C    = '#CA865D'
const CD   = '#b5724a'
const BG   = '#F4F0EB'
const DARK = '#1a1a2e'
const FONT = 'Nunito, system-ui, sans-serif'
const SERIF = '"Cormorant Garamond", Georgia, serif'

/* ─── component ────────────────────────────────────────────── */
function NavbarInner() {
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const router       = useRouter()
  const { data: session, status } = useSession()

  const cartCount     = useCartStore((s) => s.getItemCount())
  const wishlistCount = useWishlistStore((s) => s.getCount())
  const openCart      = useCartStore((s) => s.openCart)

  const [isScrolled,       setIsScrolled]       = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen,     setIsSearchOpen]     = useState(false)
  const [isUserMenuOpen,   setIsUserMenuOpen]   = useState(false)
  const [searchQuery,      setSearchQuery]      = useState('')
  const [isMounted,        setIsMounted]        = useState(false)
  const [isDesktop,        setIsDesktop]        = useState(false)
  const [hovered,          setHovered]          = useState<string | null>(null)

  const userMenuRef = useRef<HTMLDivElement>(null)
  const searchRef   = useRef<HTMLInputElement>(null)

  const safeCart     = typeof cartCount     === 'number' ? cartCount     : 0
  const safeWishlist = typeof wishlistCount === 'number' ? wishlistCount : 0

  /* active link check */
  const isActive = (href: string) => {
    const [p, q] = href.split('?')
    if (q) {
      const params = new URLSearchParams(q)
      return pathname === p && [...params.entries()].every(([k, v]) => searchParams.get(k) === v)
    }
    return pathname === p && searchParams.toString() === ''
  }

  /* mount / breakpoint */
  useEffect(() => {
    setIsMounted(true)
    const mq = window.matchMedia('(min-width: 1024px)')
    setIsDesktop(mq.matches)
    const h = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])

  /* scroll */
  useEffect(() => {
    const h = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  /* outside click for user menu */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setIsUserMenuOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  /* focus search input */
  useEffect(() => {
    if (isSearchOpen && searchRef.current) searchRef.current.focus()
  }, [isSearchOpen])

  /* close menus on route change */
  useEffect(() => {
    const t = setTimeout(() => { setIsMobileMenuOpen(false); setIsSearchOpen(false) }, 0)
    return () => clearTimeout(t)
  }, [pathname])

  /* search submit */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  /* ── Shared style helpers ─────────────────────────────────── */
  const navLinkSt = (href: string): React.CSSProperties => ({
    fontFamily: FONT,
    fontSize: '0.775rem',
    fontWeight: 700,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    color: isActive(href) || hovered === href ? C : '#7c7c8a',
    transition: 'color 150ms ease',
  })

  const actionSt = (key: string): React.CSSProperties => ({
    fontFamily: FONT,
    fontSize: '0.775rem',
    fontWeight: 700,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    color: hovered === key ? C : '#7c7c8a',
    transition: 'color 150ms ease',
  })

  /* ── Mobile bottom-nav helper ─────────────────────────────── */
  const mobileNavSt = (active: boolean): React.CSSProperties => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    fontSize: '0.57rem',
    fontFamily: FONT,
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: active ? '#fff' : 'rgba(255,255,255,0.38)',
    textDecoration: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.3rem 0',
    minWidth: 48,
    transition: 'color 200ms ease',
  })

  const mobilePillSt = (active: boolean): React.CSSProperties => ({
    padding: '6px',
    borderRadius: '12px',
    background: active ? `rgba(202,134,93,0.22)` : 'transparent',
    transition: 'background 200ms ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  })

  /* ── Desktop Auth block ───────────────────────────────────── */
  const renderDesktopAuth = () => {
    if (!isMounted || status === 'loading')
      return (
        <span style={{ ...actionSt('auth'), opacity: 0, pointerEvents: 'none' }}>
          <User size={15} /> Sign In
        </span>
      )

    if (session)
      return (
        <div ref={userMenuRef} style={{ position: 'relative' }} suppressHydrationWarning>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(v => !v)}
            suppressHydrationWarning
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt=""
                suppressHydrationWarning
                style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: `1.5px solid rgba(202,134,93,.35)` }}
              />
            ) : (
              <div suppressHydrationWarning style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(202,134,93,.12)', color: C, fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid rgba(202,134,93,.25)`, fontFamily: FONT }}>
                {session.user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
            )}
            <ChevronDown size={12} style={{ color: '#aaa', transition: 'transform 150ms', transform: isUserMenuOpen ? 'rotate(180deg)' : 'none' }} />
          </button>

          {isUserMenuOpen && (
            <div suppressHydrationWarning style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0, background: '#fff', border: '1px solid rgba(26,26,46,.08)', borderRadius: '1.25rem', minWidth: 215, boxShadow: '0 8px 32px rgba(26,26,46,.12)', zIndex: 200, overflow: 'hidden' }}>
              <div style={{ padding: '0.875rem 1rem', background: BG }}>
                <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.9rem', color: DARK, margin: 0 }}>{session.user?.name ?? ''}</p>
                <p style={{ fontFamily: FONT, fontSize: '0.75rem', color: '#9ca3af', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.user?.email ?? ''}</p>
              </div>
              <div style={{ height: 1, background: 'rgba(26,26,46,.06)' }} />
              {[
                { href: '/account',        icon: <User size={15} />,    label: 'My Account' },
                { href: '/account/orders', icon: <Package size={15} />, label: 'My Orders'  },
                ...(session.user?.role === 'admin'
                  ? [{ href: '/admin', icon: <Settings size={15} />, label: 'Admin Panel' }]
                  : []),
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsUserMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.7rem 1rem', fontFamily: FONT, fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', textDecoration: 'none' }}
                  onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'rgba(202,134,93,.06)', color: C })}
                  onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: '', color: '#6b7280' })}
                >
                  {item.icon} {item.label}
                </Link>
              ))}
              <div style={{ height: 1, background: 'rgba(26,26,46,.06)' }} />
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                suppressHydrationWarning
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.7rem 1rem', fontFamily: FONT, fontSize: '0.875rem', fontWeight: 500, color: '#ef4444', background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,.06)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '' }}
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      )

    return (
      <Link
        href="/login"
        suppressHydrationWarning
        style={actionSt('signin') as React.CSSProperties}
        onMouseEnter={() => setHovered('signin')}
        onMouseLeave={() => setHovered(null)}
      >
        <User size={15} />
        Sign In
      </Link>
    )
  }

  /* ── JSX ──────────────────────────────────────────────────── */
  return (
    <>
      {/* ══════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════ */}
      <header
        suppressHydrationWarning
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: isScrolled ? `rgba(244,240,235,0.95)` : BG,
          backdropFilter: isScrolled ? 'blur(18px)' : 'none',
          WebkitBackdropFilter: isScrolled ? 'blur(18px)' : 'none',
          borderBottom: `1px solid ${isScrolled ? 'rgba(26,26,46,.09)' : 'rgba(26,26,46,.07)'}`,
          boxShadow: isScrolled ? '0 2px 20px rgba(26,26,46,.06)' : 'none',
          transition: 'background 300ms, box-shadow 300ms, border-color 300ms',
        }}
      >
        {/* inner grid */}
        <div
          style={{
            display: 'grid',
            /* Desktop: nav | logo | actions */
            /* Mobile:  hamburger | logo | cart */
            gridTemplateColumns: isDesktop ? '1fr auto 1fr' : '44px 1fr 44px',
            alignItems: 'center',
            maxWidth: 1280,
            margin: '0 auto',
            padding: isDesktop ? '0 1.5rem' : '0 1rem',
            height: isDesktop ? 68 : 58,
          }}
        >
          {/* ── LEFT ──────────────────────────────────── */}
          {isDesktop ? (
            /* Desktop: nav links */
            <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  style={navLinkSt(href)}
                  onMouseEnter={() => setHovered(href)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {label}
                </Link>
              ))}
            </nav>
          ) : (
            /* Mobile: hamburger only */
            <button
              type="button"
              onClick={() => { setIsMobileMenuOpen(v => !v); setIsSearchOpen(false) }}
              aria-label="Menu"
              suppressHydrationWarning
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: DARK,
                borderRadius: 8,
              }}
            >
              {isMobileMenuOpen
                ? <X size={22} strokeWidth={2} />
                : <Menu size={22} strokeWidth={2} />
              }
            </button>
          )}

          {/* ── CENTER: Logo ─────────────────────────── */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              textDecoration: 'none',
              color: DARK,
              fontFamily: SERIF,
              fontSize: isDesktop ? '1.4rem' : '1.2rem',
              fontWeight: 600,
              letterSpacing: '.01em',
              whiteSpace: 'nowrap',
              justifySelf: 'center',
            }}
          >
            <ShoppingBag size={isDesktop ? 20 : 18} strokeWidth={1.5} style={{ color: C }} />
            BagBliss BD
          </Link>

          {/* ── RIGHT ────────────────────────────────── */}
          {isDesktop ? (
            /* Desktop right side */
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 24 }}>
              {/* Search */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(v => !v)}
                aria-label="Search"
                suppressHydrationWarning
                style={actionSt('search')}
                onMouseEnter={() => setHovered('search')}
                onMouseLeave={() => setHovered(null)}
              >
                <Search size={14} strokeWidth={2.2} />
                Search
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                style={actionSt('wishlist') as React.CSSProperties}
                onMouseEnter={() => setHovered('wishlist')}
                onMouseLeave={() => setHovered(null)}
                suppressHydrationWarning
              >
                <Heart size={14} strokeWidth={2.2} />
                Wishlist
                {isMounted && safeWishlist > 0 && (
                  <span style={{ color: C, fontWeight: 800, fontSize: '0.72rem' }}>({safeWishlist})</span>
                )}
              </Link>

              {/* Cart */}
              <button
                type="button"
                onClick={openCart}
                aria-label="Cart"
                suppressHydrationWarning
                style={actionSt('cart')}
                onMouseEnter={() => setHovered('cart')}
                onMouseLeave={() => setHovered(null)}
              >
                <ShoppingBag size={14} strokeWidth={2.2} />
                Cart
                {isMounted && safeCart > 0 && (
                  <span style={{ color: C, fontWeight: 800, fontSize: '0.72rem' }}>({safeCart})</span>
                )}
              </button>

              {/* Auth */}
              {renderDesktopAuth()}
            </div>
          ) : (
            /* ── Mobile right: cart icon only ── */
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              {isMounted ? (
                <button
                  type="button"
                  onClick={openCart}
                  aria-label="Cart"
                  suppressHydrationWarning
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    color: DARK,
                    borderRadius: 8,
                  }}
                >
                  <ShoppingBag size={22} strokeWidth={1.8} style={{ color: safeCart > 0 ? C : DARK }} />
                  {safeCart > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 0, right: 0,
                        minWidth: 16, height: 16,
                        background: C,
                        color: '#fff',
                        fontSize: '0.5rem',
                        fontWeight: 800,
                        borderRadius: 9999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 3px',
                        fontFamily: FONT,
                        border: `1.5px solid ${BG}`,
                        lineHeight: 1,
                      }}
                    >
                      {safeCart}
                    </span>
                  )}
                </button>
              ) : (
                /* Skeleton placeholder to avoid layout shift */
                <div style={{ width: 30, height: 30 }} />
              )}
            </div>
          )}
        </div>

        {/* ── Search bar ─────────────────────────────── */}
        {isSearchOpen && (
          <div
            suppressHydrationWarning
            style={{ borderTop: '1px solid rgba(26,26,46,.07)', padding: '0.75rem 1rem', background: BG }}
          >
            <form
              onSubmit={handleSearch}
              style={{ display: 'flex', alignItems: 'center', gap: 8, maxWidth: 580, margin: '0 auto', background: '#fff', border: '1.5px solid rgba(26,26,46,.1)', borderRadius: 9999, padding: '0.4rem 0.5rem 0.4rem 1rem', transition: 'border-color 150ms' }}
            >
              <Search size={16} style={{ color: '#bbb', flexShrink: 0 }} />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search for bags, colors, styles…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                suppressHydrationWarning
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.875rem', color: DARK, background: 'transparent', fontFamily: FONT }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  suppressHydrationWarning
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', padding: 0, display: 'flex' }}
                >
                  <X size={15} />
                </button>
              )}
              <button
                type="submit"
                suppressHydrationWarning
                style={{ background: C, color: '#fff', border: 'none', borderRadius: 9999, padding: '0.35rem 1rem', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: FONT, whiteSpace: 'nowrap', transition: 'background 150ms' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = CD }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C }}
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* ── Mobile slide-down menu ─────────────────── */}
        {isMobileMenuOpen && !isDesktop && (
          <div
            suppressHydrationWarning
            style={{
              borderTop: '1px solid rgba(26,26,46,.07)',
              background: BG,
              display: 'flex',
              flexDirection: 'column',
              animation: 'mobileMenuIn 200ms ease both',
            }}
          >
            {/* Search row inside drawer */}
            <div style={{ padding: '0.75rem 1rem 0' }}>
              <form
                onSubmit={handleSearch}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid rgba(26,26,46,.1)', borderRadius: 9999, padding: '0.4rem 0.5rem 0.4rem 1rem' }}
              >
                <Search size={15} style={{ color: '#bbb', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search bags…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  suppressHydrationWarning
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.875rem', color: DARK, background: 'transparent', fontFamily: FONT }}
                />
                <button
                  type="submit"
                  suppressHydrationWarning
                  style={{ background: C, color: '#fff', border: 'none', borderRadius: 9999, padding: '0.3rem 0.875rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}
                >
                  Go
                </button>
              </form>
            </div>

            {/* Nav links */}
            <nav style={{ padding: '0.5rem 0' }}>
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  style={{
                    padding: '0.8rem 1.25rem',
                    fontFamily: FONT,
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: isActive(href) ? C : '#4b4b5e',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    borderLeft: isActive(href) ? `3px solid ${C}` : '3px solid transparent',
                    transition: 'all 150ms',
                  }}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Auth CTA in drawer (only when not logged in) */}
            {isMounted && !session && (
              <div style={{ display: 'flex', gap: 8, padding: '0.75rem 1.25rem 1.25rem' }}>
                <Link
                  href="/login"
                  style={{
                    flex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0.65rem',
                    background: C,
                    color: '#fff',
                    borderRadius: 9999,
                    fontFamily: FONT,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                  }}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  style={{
                    flex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0.65rem',
                    background: 'transparent',
                    color: DARK,
                    border: `1.5px solid rgba(26,26,46,.2)`,
                    borderRadius: 9999,
                    fontFamily: FONT,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                  }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════════
          MOBILE FLOATING PILL BOTTOM NAV
          Home · Shop · [Cart FAB] · Wishlist · Account
      ══════════════════════════════════════════ */}
      {isMounted && !isDesktop && (
        <nav
          suppressHydrationWarning
          style={{
            position: 'fixed',
            bottom: `calc(0.875rem + env(safe-area-inset-bottom, 0px))`,
            left: '0.875rem',
            right: '0.875rem',
            zIndex: 100,
            background: DARK,
            borderRadius: '26px',
            padding: '0.45rem 0.5rem',
            boxShadow: '0 12px 48px rgba(26,26,46,.35), 0 2px 8px rgba(26,26,46,.2)',
            border: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
          }}
        >
          {/* Home */}
          <Link href="/" style={mobileNavSt(pathname === '/' && searchParams.toString() === '')}>
            <div style={mobilePillSt(pathname === '/' && searchParams.toString() === '')}>
              <Home
                size={20}
                strokeWidth={pathname === '/' && searchParams.toString() === '' ? 2.5 : 1.8}
                color={pathname === '/' && searchParams.toString() === '' ? C : 'rgba(255,255,255,0.38)'}
              />
            </div>
            <span>Home</span>
          </Link>

          {/* Shop */}
          <Link href="/shop" style={mobileNavSt(pathname === '/shop' && searchParams.toString() === '')}>
            <div style={mobilePillSt(pathname === '/shop' && searchParams.toString() === '')}>
              <Grid3X3
                size={20}
                strokeWidth={pathname === '/shop' && searchParams.toString() === '' ? 2.5 : 1.8}
                color={pathname === '/shop' && searchParams.toString() === '' ? C : 'rgba(255,255,255,0.38)'}
              />
            </div>
            <span>Shop</span>
          </Link>

          {/* Cart FAB — raised center button */}
          <button
            type="button"
            onClick={openCart}
            suppressHydrationWarning
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginTop: '-1.5rem',
              padding: '0.2rem 0',
              minWidth: 52,
              gap: 3,
            }}
          >
            <div
              style={{
                position: 'relative',
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${C} 0%, ${CD} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 6px 24px rgba(202,134,93,.55), 0 2px 6px rgba(202,134,93,.3)`,
                border: `3px solid ${DARK}`,
              }}
            >
              <ShoppingBag size={21} color="white" strokeWidth={2} />
              {safeCart > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -3, right: -3,
                    minWidth: 17, height: 17,
                    background: '#fff',
                    color: DARK,
                    fontSize: '0.58rem',
                    fontWeight: 800,
                    borderRadius: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 3px',
                    border: `2px solid ${DARK}`,
                    fontFamily: FONT,
                  }}
                >
                  {safeCart}
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.57rem', fontFamily: FONT, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>
              Cart
            </span>
          </button>

          {/* Wishlist */}
          <Link href="/wishlist" style={mobileNavSt(pathname === '/wishlist')}>
            <div style={{ ...mobilePillSt(pathname === '/wishlist'), position: 'relative' }}>
              <Heart
                size={20}
                strokeWidth={pathname === '/wishlist' ? 2.5 : 1.8}
                color={pathname === '/wishlist' ? C : 'rgba(255,255,255,0.38)'}
              />
              {safeWishlist > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 0, right: 0,
                    minWidth: 14, height: 14,
                    background: C,
                    color: '#fff',
                    fontSize: '0.5rem',
                    fontWeight: 800,
                    borderRadius: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 2px',
                    border: `2px solid ${DARK}`,
                    fontFamily: FONT,
                  }}
                >
                  {safeWishlist}
                </span>
              )}
            </div>
            <span>Wishlist</span>
          </Link>

          {/* Account */}
          <Link
            href={session ? '/account' : '/login'}
            suppressHydrationWarning
            style={mobileNavSt(pathname === '/account' || pathname === '/login')}
          >
            <div style={mobilePillSt(pathname === '/account' || pathname === '/login')}>
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt=""
                  suppressHydrationWarning
                  style={{
                    width: 20, height: 20, borderRadius: '50%', objectFit: 'cover',
                    border: pathname === '/account' ? `2px solid ${C}` : '2px solid rgba(255,255,255,0.2)',
                  }}
                />
              ) : (
                <User
                  size={20}
                  strokeWidth={(pathname === '/account' || pathname === '/login') ? 2.5 : 1.8}
                  color={(pathname === '/account' || pathname === '/login') ? C : 'rgba(255,255,255,0.38)'}
                />
              )}
            </div>
            <span suppressHydrationWarning>{session ? 'Account' : 'Sign In'}</span>
          </Link>
        </nav>
      )}
    </>
  )
}

export default function Navbar() {
  return (
    <Suspense
      fallback={
        <div style={{ height: 58, background: BG, borderBottom: '1px solid rgba(26,26,46,.07)' }} />
      }
    >
      <NavbarInner />
    </Suspense>
  )
}