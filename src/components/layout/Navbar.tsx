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

const NAV_LINKS = [
  { label: 'Home',         href: '/'                       },
  { label: 'Shop',         href: '/shop'                   },
  { label: 'New Arrivals', href: '/shop?sort=newest'       },
  { label: 'Flash Sale',   href: '/shop?filter=flash-sale' },
] as const

const C     = '#CA865D'
const CD    = '#b5724a'
const BG    = '#F4F0EB'
const DARK  = '#1a1a2e'
const FONT  = 'Inter, system-ui, sans-serif'
const SERIF = '"Poppins", system-ui, sans-serif'

// Menu link color (idle state)
const MENU_COLOR = '#333333'

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

  const isActive = (href: string) => {
    const [p, q] = href.split('?')
    if (q) {
      const params = new URLSearchParams(q)
      return pathname === p && [...params.entries()].every(([k, v]) => searchParams.get(k) === v)
    }
    return pathname === p && searchParams.toString() === ''
  }

  useEffect(() => {
    setIsMounted(true)
    const mq = window.matchMedia('(min-width: 1024px)')
    setIsDesktop(mq.matches)
    const h = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])

  useEffect(() => {
    const h = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setIsUserMenuOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    if (isSearchOpen && searchRef.current) searchRef.current.focus()
  }, [isSearchOpen])

  useEffect(() => {
    const t = setTimeout(() => { setIsMobileMenuOpen(false); setIsSearchOpen(false) }, 0)
    return () => clearTimeout(t)
  }, [pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  const renderDesktopAuth = () => {
    if (!isMounted || status === 'loading')
      return (
        <span
          className="flex items-center gap-[0.35rem] text-[0.775rem] font-bold tracking-[0.07em] uppercase opacity-0 pointer-events-none"
          style={{ color: MENU_COLOR, fontFamily: FONT }}
        >
          <User size={15} /> Sign In
        </span>
      )

    if (session)
      return (
        <div ref={userMenuRef} className="relative" suppressHydrationWarning>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(v => !v)}
            suppressHydrationWarning
            className="flex items-center gap-[6px] bg-transparent border-none cursor-pointer p-0"
          >
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt=""
                suppressHydrationWarning
                className="w-[30px] h-[30px] rounded-full object-cover"
                style={{ border: `1.5px solid rgba(202,134,93,.35)` }}
              />
            ) : (
              <div
                suppressHydrationWarning
                className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[0.75rem] font-bold"
                style={{
                  background: 'rgba(202,134,93,.12)',
                  color: C,
                  border: `1.5px solid rgba(202,134,93,.25)`,
                  fontFamily: FONT,
                }}
              >
                {session.user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
            )}
            <ChevronDown
              size={12}
              style={{
                color: '#aaa',
                transition: 'transform 150ms',
                transform: isUserMenuOpen ? 'rotate(180deg)' : 'none',
              }}
            />
          </button>

          {isUserMenuOpen && (
            <div
              suppressHydrationWarning
              className="absolute top-[calc(100%+12px)] right-0 bg-white border border-[rgba(26,26,46,0.08)] rounded-[1.25rem] min-w-[215px] shadow-[0_8px_32px_rgba(26,26,46,0.12)] z-[200] overflow-hidden"
            >
              <div className="px-4 py-[0.875rem]" style={{ background: BG }}>
                <p
                  className="font-bold text-[0.9rem] m-0"
                  style={{ color: DARK, fontFamily: FONT }}
                >
                  {session.user?.name ?? ''}
                </p>
                <p
                  className="text-[0.75rem] text-[#9ca3af] mt-[2px] overflow-hidden text-ellipsis whitespace-nowrap m-0"
                  style={{ fontFamily: FONT }}
                >
                  {session.user?.email ?? ''}
                </p>
              </div>
              <div className="h-px bg-[rgba(26,26,46,0.06)]" />
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
                  className="flex items-center gap-[10px] px-4 py-[0.7rem] text-[0.875rem] font-medium no-underline transition-[background,color] duration-150"
                  style={{ color: '#6b7280', fontFamily: FONT }}
                  onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'rgba(202,134,93,.06)', color: C })}
                  onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: '', color: '#6b7280' })}
                >
                  {item.icon} {item.label}
                </Link>
              ))}
              <div className="h-px bg-[rgba(26,26,46,0.06)]" />
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                suppressHydrationWarning
                className="flex items-center gap-[10px] px-4 py-[0.7rem] text-[0.875rem] font-medium text-[#ef4444] bg-transparent border-none w-full cursor-pointer text-left transition-[background] duration-150"
                style={{ fontFamily: FONT }}
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
        className="flex items-center gap-[0.35rem] text-[0.775rem] font-medium tracking-[0.07em] uppercase no-underline transition-colors duration-150"
        style={{ color: hovered === 'signin' ? C : MENU_COLOR, fontFamily: FONT }}
        onMouseEnter={() => setHovered('signin')}
        onMouseLeave={() => setHovered(null)}
      >
        <User size={15} />
        Sign In
      </Link>
    )
  }

  return (
    <>
      {/* ── Animation keyframes ── */}
      <style>{`
        @keyframes menuIconIn {
          from { opacity: 0; transform: rotate(-90deg) scale(0.6); }
          to   { opacity: 1; transform: rotate(0deg)   scale(1);   }
        }
        @keyframes mobileDropdownIn {
          0%   { opacity: 0; transform: scaleY(0.92) translateY(-6px); }
          60%  { opacity: 1; }
          100% { opacity: 1; transform: scaleY(1)    translateY(0px);  }
        }
        @keyframes mobileDropdownItemIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .mobile-menu-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          animation: menuIconIn 220ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .mobile-dropdown {
          transform-origin: top center;
          animation: mobileDropdownIn 320ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .mobile-dropdown-item {
          opacity: 0;
          animation: mobileDropdownItemIn 260ms cubic-bezier(0.22, 1, 0.36, 1) both;
          transition: background 150ms ease, color 150ms ease, border-color 150ms ease;
        }
        .mobile-dropdown-item:active {
          background: rgba(202,134,93,0.08) !important;
        }
      `}</style>

      {/* ── Header ── */}
      <header
        suppressHydrationWarning
        className={`sticky top-0 z-[100] border-b transition-[background,box-shadow,border-color] duration-300 ${
          isScrolled
            ? 'bg-[rgba(244,240,235,0.95)] backdrop-blur-[18px] shadow-[0_2px_20px_rgba(26,26,46,0.06)] border-[rgba(26,26,46,0.09)]'
            : 'bg-[#F4F0EB] border-[rgba(26,26,46,0.07)]'
        }`}
      >
        {/* Inner grid */}
        <div
          className={`grid w-full mx-auto items-center box-border ${
            isDesktop
              ? 'grid-cols-[1fr_auto_1fr] h-[68px]'
              : 'grid-cols-[44px_1fr_44px] h-[58px]'
          }`}
          style={{ padding: isDesktop ? '0 clamp(1.5rem, 5vw, 7rem)' : '0 1rem' }}
        >
          {/* ── LEFT — Desktop nav links ── */}
          {isDesktop ? (
            <nav className="flex items-center gap-7">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-[0.775rem] font-medium tracking-[0.07em] uppercase no-underline whitespace-nowrap flex items-center gap-[0.35rem] transition-colors duration-150"
                  style={{ color: isActive(href) || hovered === href ? C : MENU_COLOR, fontFamily: FONT }}
                  onMouseEnter={() => setHovered(href)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {label}
                </Link>
              ))}
            </nav>
          ) : (
            <button
              type="button"
              onClick={() => { setIsMobileMenuOpen(v => !v); setIsSearchOpen(false) }}
              aria-label="Menu"
              suppressHydrationWarning
              className="bg-transparent border-none cursor-pointer p-1 flex items-center justify-center rounded-lg w-9 h-9"
              style={{ color: DARK }}
            >
              <span key={isMobileMenuOpen ? 'close' : 'open'} className="mobile-menu-icon">
                {isMobileMenuOpen
                  ? <X size={22} strokeWidth={2} color={DARK} />
                  : <Menu size={22} strokeWidth={2} color={DARK} />
                }
              </span>
            </button>
          )}

          {/* ── CENTER — Logo ── */}
          <Link
            href="/"
            className="flex items-center gap-[7px] no-underline whitespace-nowrap justify-self-center"
            style={{
              color: DARK,
              fontFamily: SERIF,
              fontSize: isDesktop ? '1.4rem' : '1.2rem',
              fontWeight: 600,
              letterSpacing: '.01em',
            }}
          >
            <ShoppingBag size={isDesktop ? 20 : 18} strokeWidth={1.5} style={{ color: C }} />
            BagBliss BD
          </Link>

          {/* ── RIGHT — Desktop actions ── */}
          {isDesktop ? (
            <div className="flex items-center justify-end gap-6">
              {/* Search */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(v => !v)}
                aria-label="Search"
                suppressHydrationWarning
                className="text-[0.775rem] font-medium tracking-[0.07em] uppercase bg-transparent border-none cursor-pointer p-0 flex items-center gap-[0.35rem] whitespace-nowrap transition-colors duration-150"
                style={{ color: hovered === 'search' ? C : MENU_COLOR, fontFamily: FONT }}
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
                suppressHydrationWarning
                className="text-[0.775rem] font-medium tracking-[0.07em] uppercase no-underline flex items-center gap-[0.35rem] whitespace-nowrap transition-colors duration-150"
                style={{ color: hovered === 'wishlist' ? C : MENU_COLOR, fontFamily: FONT }}
                onMouseEnter={() => setHovered('wishlist')}
                onMouseLeave={() => setHovered(null)}
              >
                <Heart size={14} strokeWidth={2.2} />
                Wishlist
                {isMounted && safeWishlist > 0 && (
                  <span className="font-extrabold text-[0.72rem]" style={{ color: C }}>
                    ({safeWishlist})
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                type="button"
                onClick={openCart}
                aria-label="Cart"
                suppressHydrationWarning
                className="text-[0.775rem] font-medium tracking-[0.07em] uppercase bg-transparent border-none cursor-pointer p-0 flex items-center gap-[0.35rem] whitespace-nowrap transition-colors duration-150"
                style={{ color: hovered === 'cart' ? C : MENU_COLOR, fontFamily: FONT }}
                onMouseEnter={() => setHovered('cart')}
                onMouseLeave={() => setHovered(null)}
              >
                <ShoppingBag size={14} strokeWidth={2.2} />
                Cart
                {isMounted && safeCart > 0 && (
                  <span className="font-extrabold text-[0.72rem]" style={{ color: C }}>
                    ({safeCart})
                  </span>
                )}
              </button>

              {renderDesktopAuth()}
            </div>
          ) : (
            /* Mobile — cart icon top-right */
            <div className="flex items-center justify-end">
              {isMounted ? (
                <button
                  type="button"
                  onClick={openCart}
                  aria-label="Cart"
                  suppressHydrationWarning
                  className="bg-transparent border-none cursor-pointer p-1 flex items-center justify-center relative rounded-lg"
                >
                  <ShoppingBag
                    size={22}
                    strokeWidth={1.8}
                    style={{ color: safeCart > 0 ? C : DARK }}
                  />
                  {safeCart > 0 && (
                    <span
                      className="absolute top-0 right-0 min-w-[16px] h-4 text-white text-[0.5rem] font-extrabold rounded-full flex items-center justify-center px-[3px] leading-none"
                      style={{ background: C, fontFamily: FONT, border: `1.5px solid ${BG}` }}
                    >
                      {safeCart}
                    </span>
                  )}
                </button>
              ) : (
                <div className="w-[30px] h-[30px]" />
              )}
            </div>
          )}
        </div>

        {/* ── Search bar (desktop) ── */}
        {isSearchOpen && (
          <div
            suppressHydrationWarning
            className="border-t border-[rgba(26,26,46,0.07)] py-3 px-4"
            style={{ background: BG }}
          >
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2 max-w-[580px] mx-auto bg-white border-[1.5px] border-[rgba(26,26,46,0.1)] rounded-full pl-4 pr-2 py-[0.4rem] transition-[border-color] duration-150"
            >
              <Search size={16} className="text-[#bbb] shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search for bags, colors, styles…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                suppressHydrationWarning
                className="flex-1 border-none outline-none text-sm bg-transparent"
                style={{ color: DARK, fontFamily: FONT }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  suppressHydrationWarning
                  className="bg-transparent border-none cursor-pointer text-[#bbb] p-0 flex"
                >
                  <X size={15} />
                </button>
              )}
              <button
                type="submit"
                suppressHydrationWarning
                className="text-white border-none rounded-full px-4 py-[0.35rem] text-[0.78rem] font-bold tracking-[0.05em] uppercase cursor-pointer whitespace-nowrap transition-colors duration-150"
                style={{ background: C, fontFamily: FONT }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = CD }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C }}
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* ── Mobile dropdown menu ── */}
        {isMobileMenuOpen && !isDesktop && (
          <div
            suppressHydrationWarning
            className="mobile-dropdown border-t border-[rgba(26,26,46,0.07)] flex flex-col"
            style={{ background: BG }}
          >
            {/* Search in dropdown */}
            <div style={{ padding: '0.75rem 1rem 0' }}>
              <form
                onSubmit={handleSearch}
                className="flex items-center gap-2 bg-white rounded-full"
                style={{ border: '1.5px solid rgba(26,26,46,0.1)', padding: '0.4rem 0.5rem 0.4rem 1rem' }}
              >
                <Search size={15} className="text-[#bbb] shrink-0" />
                <input
                  type="text"
                  placeholder="Search bags…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  suppressHydrationWarning
                  className="flex-1 border-none outline-none text-sm bg-transparent"
                  style={{ color: DARK, fontFamily: FONT }}
                />
                <button
                  type="submit"
                  suppressHydrationWarning
                  className="text-white border-none rounded-full text-[0.75rem] font-bold cursor-pointer"
                  style={{ background: C, fontFamily: FONT, padding: '0.3rem 0.875rem' }}
                >
                  Go
                </button>
              </form>
            </div>

            {/* Nav links */}
            <nav style={{ padding: '0.5rem 0' }}>
              {NAV_LINKS.map(({ label, href }, i) => (
                <Link
                  key={href}
                  href={href}
                  className="mobile-dropdown-item text-[0.875rem] font-medium tracking-[0.04em] uppercase no-underline flex items-center"
                  style={{
                    animationDelay: `${40 + i * 45}ms`,
                    padding: '0.8rem 1.25rem',
                    color: isActive(href) ? C : MENU_COLOR,
                    borderLeft: isActive(href) ? `3px solid ${C}` : '3px solid transparent',
                    fontFamily: FONT,
                  }}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Auth buttons */}
            {isMounted && !session && (
              <div className="flex gap-2" style={{ padding: '0.75rem 1.25rem 1.25rem' }}>
                <Link
                  href="/login"
                  className="flex-1 flex items-center justify-center text-white rounded-full text-[0.8rem] font-medium tracking-[0.05em] no-underline uppercase"
                  style={{ background: C, fontFamily: FONT, padding: '0.65rem' }}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex-1 flex items-center justify-center bg-transparent rounded-full text-[0.8rem] font-medium tracking-[0.05em] no-underline uppercase"
                  style={{ color: DARK, fontFamily: FONT, padding: '0.65rem', border: '1.5px solid rgba(26,26,46,0.2)' }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ── Mobile bottom nav ── */}
      {isMounted && !isDesktop && (
        <nav
          suppressHydrationWarning
          className="fixed bottom-0 left-0 right-0 z-[100] border-t border-[rgba(255,255,255,0.07)] flex items-center justify-around shadow-[0_-4px_24px_rgba(26,26,46,0.25)]"
          style={{
            background: DARK,
            padding: `0.6rem 0.5rem calc(0.6rem + env(safe-area-inset-bottom, 0px))`,
          }}
        >
          {/* Home */}
          <Link
            href="/"
            className="flex-1 flex flex-col items-center gap-[3px] text-[0.57rem] font-bold tracking-[0.05em] uppercase no-underline min-w-[48px] py-[0.3rem] transition-colors duration-200"
            style={{ color: isActive('/') ? '#fff' : 'rgba(255,255,255,0.38)', fontFamily: FONT }}
          >
            <div
              className="p-[6px] rounded-xl flex items-center justify-center relative transition-[background] duration-200"
              style={{ background: isActive('/') ? 'rgba(202,134,93,0.22)' : 'transparent' }}
            >
              <Home
                size={20}
                strokeWidth={isActive('/') ? 2.5 : 1.8}
                color={isActive('/') ? C : 'rgba(255,255,255,0.38)'}
              />
            </div>
            <span>Home</span>
          </Link>

          {/* Shop */}
          <Link
            href="/shop"
            className="flex-1 flex flex-col items-center gap-[3px] text-[0.57rem] font-bold tracking-[0.05em] uppercase no-underline min-w-[48px] py-[0.3rem] transition-colors duration-200"
            style={{ color: isActive('/shop') ? '#fff' : 'rgba(255,255,255,0.38)', fontFamily: FONT }}
          >
            <div
              className="p-[6px] rounded-xl flex items-center justify-center relative transition-[background] duration-200"
              style={{ background: isActive('/shop') ? 'rgba(202,134,93,0.22)' : 'transparent' }}
            >
              <Grid3X3
                size={20}
                strokeWidth={isActive('/shop') ? 2.5 : 1.8}
                color={isActive('/shop') ? C : 'rgba(255,255,255,0.38)'}
              />
            </div>
            <span>Shop</span>
          </Link>

          {/* Cart — floating center FAB */}
          <button
            type="button"
            onClick={openCart}
            suppressHydrationWarning
            className="flex-1 flex flex-col items-center bg-transparent border-none cursor-pointer min-w-[52px] gap-[3px]"
            style={{ marginTop: '-1.5rem', padding: '0.2rem 0' }}
          >
            <div
              className="relative w-[52px] h-[52px] rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${C} 0%, ${CD} 100%)`,
                boxShadow: `0 6px 24px rgba(202,134,93,.55), 0 2px 6px rgba(202,134,93,.3)`,
                border: `3px solid ${DARK}`,
              }}
            >
              <ShoppingBag size={21} color="white" strokeWidth={2} />
              {safeCart > 0 && (
                <span
                  className="absolute -top-[3px] -right-[3px] min-w-[17px] h-[17px] text-[0.58rem] font-extrabold rounded-full flex items-center justify-center px-[3px]"
                  style={{ background: '#fff', color: DARK, border: `2px solid ${DARK}`, fontFamily: FONT }}
                >
                  {safeCart}
                </span>
              )}
            </div>
            <span
              className="text-[0.57rem] font-bold tracking-[0.05em] uppercase"
              style={{ color: 'rgba(255,255,255,0.45)', fontFamily: FONT }}
            >
              Cart
            </span>
          </button>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="flex-1 flex flex-col items-center gap-[3px] text-[0.57rem] font-bold tracking-[0.05em] uppercase no-underline min-w-[48px] py-[0.3rem] transition-colors duration-200"
            style={{ color: pathname === '/wishlist' ? '#fff' : 'rgba(255,255,255,0.38)', fontFamily: FONT }}
          >
            <div
              className="p-[6px] rounded-xl flex items-center justify-center relative transition-[background] duration-200"
              style={{ background: pathname === '/wishlist' ? 'rgba(202,134,93,0.22)' : 'transparent' }}
            >
              <Heart
                size={20}
                strokeWidth={pathname === '/wishlist' ? 2.5 : 1.8}
                color={pathname === '/wishlist' ? C : 'rgba(255,255,255,0.38)'}
              />
              {safeWishlist > 0 && (
                <span
                  className="absolute top-0 right-0 min-w-[14px] h-[14px] text-white text-[0.5rem] font-extrabold rounded-full flex items-center justify-center px-[2px]"
                  style={{ background: C, border: `2px solid ${DARK}`, fontFamily: FONT }}
                >
                  {safeWishlist}
                </span>
              )}
            </div>
            <span>Wishlist</span>
          </Link>

          {/* Account / Sign In */}
          <Link
            href={session ? '/account' : '/login'}
            suppressHydrationWarning
            className="flex-1 flex flex-col items-center gap-[3px] text-[0.57rem] font-bold tracking-[0.05em] uppercase no-underline min-w-[48px] py-[0.3rem] transition-colors duration-200"
            style={{
              color: (pathname === '/account' || pathname === '/login') ? '#fff' : 'rgba(255,255,255,0.38)',
              fontFamily: FONT,
            }}
          >
            <div
              className="p-[6px] rounded-xl flex items-center justify-center transition-[background] duration-200"
              style={{
                background: (pathname === '/account' || pathname === '/login')
                  ? 'rgba(202,134,93,0.22)'
                  : 'transparent',
              }}
            >
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt=""
                  suppressHydrationWarning
                  className="w-5 h-5 rounded-full object-cover"
                  style={{
                    border: pathname === '/account'
                      ? `2px solid ${C}`
                      : '2px solid rgba(255,255,255,0.2)',
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
    <Suspense fallback={<div className="h-[58px] bg-[#F4F0EB] border-b border-[rgba(26,26,46,0.07)]" />}>
      <NavbarInner />
    </Suspense>
  )
}