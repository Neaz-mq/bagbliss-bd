'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  ShoppingBag,
  Heart,
  Search,
  User,
  Menu,
  X,
  LogOut,
  Package,
  Settings,
  ChevronDown,
  Home,
  Grid3X3,
} from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'New Arrivals', href: '/shop?sort=newest' },
  { label: 'Flash Sale', href: '/shop?filter=flash-sale' },
]

export default function Navbar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session, status } = useSession() // ← also grab status
  const cartCount = useCartStore((s) => s.getItemCount())
  const wishlistCount = useWishlistStore((s) => s.getCount())
  const openCart = useCartStore((s) => s.openCart)

  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMounted, setIsMounted] = useState(false)

  const userMenuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // ── Active link check (supports query params) ──
  const isLinkActive = (href: string) => {
    const [hrefPath, hrefQuery] = href.split('?')
    if (hrefQuery) {
      const params = new URLSearchParams(hrefQuery)
      return (
        pathname === hrefPath &&
        [...params.entries()].every(
          ([key, val]) => searchParams.get(key) === val
        )
      )
    }
    return pathname === href && searchParams.toString() === ''
  }

  // Mount check — fixes hydration error with persisted Zustand store
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchRef.current) {
      searchRef.current.focus()
    }
  }, [isSearchOpen])

  // Close mobile menu on route change
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMobileMenuOpen(false)
      setIsSearchOpen(false)
    }, 0)
    return () => clearTimeout(timer)
  }, [pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  // ── Determines what to render for the auth section ──
  // Both server and client render the placeholder until isMounted + status resolved,
  // which eliminates the SSR/CSR mismatch.
  const renderAuthSection = () => {
    if (!isMounted || status === 'loading') {
      // Invisible placeholder — same layout footprint as "Sign In" link
      return (
        <div
          className="navbar-login-btn opacity-0 pointer-events-none select-none"
          aria-hidden="true"
        >
          Sign In
        </div>
      )
    }

    if (session) {
      return (
        <div className="navbar-user-menu" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="navbar-user-btn"
          >
            {session.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name ?? ''}
                className="navbar-avatar"
              />
            ) : (
              <div className="navbar-avatar-placeholder">
                {session.user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
            )}
            <ChevronDown
              size={14}
              className={`navbar-chevron ${isUserMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown */}
          {isUserMenuOpen && (
            <div className="navbar-dropdown">
              <div className="navbar-dropdown-header">
                <p className="navbar-dropdown-name">{session.user?.name}</p>
                <p className="navbar-dropdown-email">{session.user?.email}</p>
              </div>
              <div className="navbar-dropdown-divider" />
              <Link
                href="/account"
                className="navbar-dropdown-item"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <User size={16} />
                My Account
              </Link>
              <Link
                href="/account/orders"
                className="navbar-dropdown-item"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <Package size={16} />
                My Orders
              </Link>
              {session.user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="navbar-dropdown-item"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <Settings size={16} />
                  Admin Panel
                </Link>
              )}
              <div className="navbar-dropdown-divider" />
              <button
                onClick={handleSignOut}
                className="navbar-dropdown-item navbar-dropdown-signout"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      )
    }

    return (
      <Link href="/login" className="navbar-login-btn">
        Sign In
      </Link>
    )
  }

  return (
    <>
      {/* ── Main Navbar ─────────────────────── */}
      <header
        className={`navbar ${isScrolled ? 'navbar-scrolled' : 'navbar-top'}`}
      >
        <div className="navbar-inner">
          {/* Logo */}
          <Link href="/" className="navbar-logo">
            <ShoppingBag size={22} strokeWidth={1.5} />
            <span>BagBliss BD</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="navbar-links">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`navbar-link ${
                  isLinkActive(link.href) ? 'navbar-link-active' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="navbar-actions">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="navbar-icon-btn"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="navbar-icon-btn navbar-icon-relative"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {isMounted && wishlistCount > 0 && (
                <span className="navbar-badge">{wishlistCount}</span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={openCart}
              className="navbar-icon-btn navbar-icon-relative"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {isMounted && cartCount > 0 && (
                <span className="navbar-badge navbar-badge-accent">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth — guarded to prevent SSR/CSR mismatch */}
            {renderAuthSection()}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="navbar-icon-btn navbar-mobile-toggle"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="navbar-search">
            <form onSubmit={handleSearch} className="navbar-search-form">
              <Search size={18} className="navbar-search-icon" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search for bags, colors, styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="navbar-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="navbar-search-clear"
                >
                  <X size={16} />
                </button>
              )}
              <button type="submit" className="navbar-search-btn">
                Search
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="navbar-mobile-menu">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`navbar-mobile-link ${
                  isLinkActive(link.href) ? 'navbar-mobile-link-active' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
            {/* Guard mobile auth buttons the same way */}
            {isMounted && !session && (
              <div className="navbar-mobile-auth">
                <Link href="/login" className="btn-primary">
                  Sign In
                </Link>
                <Link href="/register" className="btn-secondary">
                  Create Account
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ── Mobile Bottom Navigation ─────────── */}
      <nav className="mobile-bottom-nav">
        <Link
          href="/"
          className={`mobile-nav-item ${
            pathname === '/' && searchParams.toString() === ''
              ? 'mobile-nav-item-active'
              : ''
          }`}
        >
          <Home size={22} />
          <span>Home</span>
        </Link>
        <Link
          href="/shop"
          className={`mobile-nav-item ${
            pathname === '/shop' && searchParams.toString() === ''
              ? 'mobile-nav-item-active'
              : ''
          }`}
        >
          <Grid3X3 size={22} />
          <span>Shop</span>
        </Link>
        <button onClick={openCart} className="mobile-nav-item mobile-nav-cart">
          <div className="mobile-nav-cart-btn">
            <ShoppingBag size={24} color="white" />
            {isMounted && cartCount > 0 && (
              <span className="mobile-nav-cart-badge">{cartCount}</span>
            )}
          </div>
        </button>
        <Link
          href="/wishlist"
          className={`mobile-nav-item ${
            pathname === '/wishlist' ? 'mobile-nav-item-active' : ''
          }`}
        >
          <Heart size={22} />
          <span>Wishlist</span>
        </Link>
        {/* Guard href and label — server always sees /login, client resolves after mount */}
        <Link
          href={isMounted && session ? '/account' : '/login'}
          className={`mobile-nav-item ${
            pathname === '/account' || pathname === '/login'
              ? 'mobile-nav-item-active'
              : ''
          }`}
        >
          <User size={22} />
          <span>{isMounted && session ? 'Account' : 'Sign In'}</span>
        </Link>
      </nav>
    </>
  )
}