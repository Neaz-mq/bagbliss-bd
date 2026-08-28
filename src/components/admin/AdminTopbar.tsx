'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useHydrated } from '@/hooks/useHydrated'
import { Menu, Search, ExternalLink, ChevronDown, LogOut, Loader2, Package, ShoppingBag, User as UserIcon } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import AdminNotifications from './AdminNotifications'

interface Props { onMenuClick: () => void }

interface SearchResult {
  type: 'product' | 'order' | 'customer'
  id: string
  title: string
  subtitle?: string
  image?: string
  href: string
}

export default function AdminTopbar({ onMenuClick }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const mounted = useHydrated()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // ── Search state ─────────────────────────────
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [error, setError] = useState<string | null>(null)
  const searchWrapRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const initials  = mounted ? (session?.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'AD') : 'AD'
  const firstName = mounted ? (session?.user?.name?.split(' ')[0] ?? 'Admin') : 'Admin'
  const fullName  = mounted ? (session?.user?.name  ?? 'Admin') : 'Admin'
  const email     = mounted ? (session?.user?.email ?? '') : ''

  // ── Close profile / search dropdowns on outside click ─────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false)
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node))
        setSearchOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── ⌘K / Ctrl+K focuses search from anywhere ───────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
        searchInputRef.current?.select()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // ── Debounced live search ──────────────────────────────────
  const runSearch = useCallback(async (q: string) => {
    if (abortRef.current) {
      abortRef.current.abort()
    }

    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)

    try {
      const url = `/api/admin/search?q=${encodeURIComponent(q)}`
      const res = await fetch(url, {
        signal: controller.signal,
      })

      if (!res.ok) {
        throw new Error(`Search request failed: ${res.status}`)
      }

      const json = await res.json()

      setResults(Array.isArray(json?.data) ? json.data : [])
      setError(null)
    } catch (err) {
      const error = err as Error
      if (error.name !== 'AbortError') {
        console.error('Admin search error:', error.message)
        setError(error.message)
        setResults([])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const trimmed = query.trim()

    if (trimmed.length < 2) {
      setResults([])
      setLoading(false)
      setError(null)
      return
    }

    debounceRef.current = setTimeout(() => runSearch(trimmed), 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, runSearch])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSearchOpen(true)
    setActiveIndex(-1)
  }

  const goToResult = (result: SearchResult) => {
    setSearchOpen(false)
    setQuery('')
    setResults([])
    router.push(result.href)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setSearchOpen(false)
      searchInputRef.current?.blur()
      return
    }
    if (!results.length) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const newIndex = (activeIndex + 1) % results.length
      setActiveIndex(newIndex)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const newIndex = activeIndex <= 0 ? results.length - 1 : activeIndex - 1
      setActiveIndex(newIndex)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const chosen = activeIndex >= 0 ? results[activeIndex] : results[0]
      if (chosen) goToResult(chosen)
    }
  }

  const iconFor = (type: SearchResult['type']) => {
    if (type === 'product') return <Package size={14} />
    if (type === 'order') return <ShoppingBag size={14} />
    return <UserIcon size={14} />
  }

  return (
    <header style={{
      height: '64px', background: '#ffffff',
      borderBottom: '1px solid #f1f5f9',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px 0 24px', flexShrink: 0,
      position: 'sticky', top: 0, zIndex: 10, gap: '12px',
    }}>

      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
        {/*
          FIX: previously this button had an inline `style={{ display: 'flex', ... }}`
          alongside `className="lg:hidden"`. Inline styles always win over class-based
          rules (including responsive/media-query classes), so `lg:hidden` could never
          actually hide the button at the lg breakpoint (1024px+) — it stayed visible
          at every viewport width, even when the sidebar was already docked.
          `display` is now controlled purely via Tailwind classes (`flex ... lg:hidden`)
          so the responsive variant can correctly override it.
        */}
        <button
          suppressHydrationWarning
          onClick={onMenuClick}
          className="flex items-center justify-center lg:hidden"
          style={{ width: '38px', height: '38px', flexShrink: 0, borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#475569', cursor: 'pointer' }}
        >
          <Menu size={18} strokeWidth={2} />
        </button>

        <div ref={searchWrapRef} className="hidden md:flex" style={{ position: 'relative', maxWidth: '360px', width: '100%' }}>
          <div
            style={{ alignItems: 'center', gap: '10px', background: '#f8fafc', border: `1.5px solid ${searchOpen ? '#cbd5e1' : '#e8edf5'}`, borderRadius: '12px', padding: '0 14px', height: '40px', display: 'flex', width: '100%' }}
          >
            {loading
              ? <Loader2 size={14} className="animate-spin" style={{ color: '#94a3b8', flexShrink: 0 }} />
              : <Search size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />}
            <input
              ref={searchInputRef}
              suppressHydrationWarning
              type="text"
              value={query}
              onChange={handleChange}
              onFocus={() => query.trim().length >= 2 && setSearchOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search orders, products…"
              autoComplete="off"
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.83rem', color: '#334155', width: '100%' }}
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setResults([])
                  setError(null)
                  searchInputRef.current?.focus()
                }}
                style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem', padding: 0, lineHeight: 1 }}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
            {!query && (
              <kbd style={{ fontSize: '11px', color: '#cbd5e1', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '2px 7px', fontFamily: 'monospace', whiteSpace: 'nowrap', flexShrink: 0 }}>⌘K</kbd>
            )}
          </div>

          {/* Results dropdown */}
          {searchOpen && query.trim().length >= 2 && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, background: '#ffffff', borderRadius: '14px', border: '1px solid #f1f5f9', boxShadow: '0 8px 32px rgba(0,0,0,0.10)', overflow: 'hidden', zIndex: 50, maxHeight: '360px', overflowY: 'auto' }}>
              {/* Error state */}
              {error && (
                <div style={{ padding: '18px 16px', fontSize: '0.8rem', color: '#e11d48', textAlign: 'center', background: '#fff1f2' }}>
                  {error}
                </div>
              )}

              {loading && results.length === 0 && (
                <div style={{ padding: '18px 16px', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
                  Searching…
                </div>
              )}

              {!loading && results.length === 0 && !error && (
                <div style={{ padding: '18px 16px', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
                  No results for "{query}"
                </div>
              )}

              {results.map((r, i) => (
                <button
                  key={`${r.type}-${r.id}`}
                  type="button"
                  onClick={() => goToResult(r)}
                  onMouseEnter={() => setActiveIndex(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                    padding: '10px 14px', border: 'none', textAlign: 'left', cursor: 'pointer',
                    background: activeIndex === i ? '#f8fafc' : 'transparent',
                  }}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', overflow: 'hidden' }}>
                    {r.image
                      ? <img src={r.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : iconFor(r.type)}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</p>
                    {r.subtitle && (
                      <p style={{ margin: '1px 0 0', fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.subtitle}</p>
                    )}
                  </div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', color: '#cbd5e1', flexShrink: 0 }}>{r.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>

        <Link href="/" target="_blank" className="hidden md:flex"
          style={{ alignItems: 'center', gap: '6px', padding: '0 14px', height: '36px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-accent-dark)', textDecoration: 'none', border: '1.5px solid rgba(var(--color-accent-rgb),0.25)', background: 'rgba(var(--color-accent-rgb),0.06)' }}>
          <ExternalLink size={13} strokeWidth={2.5} />
          View Store
        </Link>

        <div className="hidden md:block"
          style={{ width: '1px', height: '28px', background: '#e8edf5', margin: '0 6px' }} />

        <AdminNotifications />

        <div style={{ width: '1px', height: '28px', background: '#e8edf5', margin: '0 6px' }} />

        {/* Profile dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            suppressHydrationWarning
            onClick={() => setDropdownOpen(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '5px 10px 5px 6px', borderRadius: '12px',
              border: `1.5px solid ${dropdownOpen ? 'rgba(var(--color-accent-rgb),0.35)' : '#e8edf5'}`,
              background: dropdownOpen ? 'rgba(var(--color-accent-rgb),0.05)' : '#f8fafc',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <div suppressHydrationWarning style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0, boxShadow: '0 2px 8px rgba(var(--color-accent-rgb),0.4)' }}>
              {initials}
            </div>
            <div className="hidden md:block" style={{ textAlign: 'left' }}>
              <p suppressHydrationWarning style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', margin: 0, lineHeight: 1, whiteSpace: 'nowrap' }}>{firstName}</p>
              <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: '2px 0 0', lineHeight: 1 }}>Administrator</p>
            </div>
            <ChevronDown size={14} strokeWidth={2.5} className="hidden md:block"
              style={{ color: '#94a3b8', flexShrink: 0, transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
          </button>

          {dropdownOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '220px', background: '#ffffff', borderRadius: '14px', border: '1px solid #f1f5f9', boxShadow: '0 8px 32px rgba(0,0,0,0.10)', overflow: 'hidden', zIndex: 50 }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #f8fafc', background: 'linear-gradient(135deg, rgba(var(--color-accent-rgb),0.05), rgba(var(--color-accent-dark-rgb),0.02))' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div suppressHydrationWarning style={{ width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0, background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.85rem', fontWeight: 800 }}>
                    {initials}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p suppressHydrationWarning style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fullName}</p>
                    <p suppressHydrationWarning style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</p>
                  </div>
                </div>
              </div>
              <div style={{ padding: '6px' }}>
                <button
                  suppressHydrationWarning
                  onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: '/login' }) }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '9px', width: '100%', fontSize: '0.84rem', fontWeight: 500, color: '#e11d48', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fff1f2')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <LogOut size={15} style={{ color: '#e11d48' }} />
                  </div>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}