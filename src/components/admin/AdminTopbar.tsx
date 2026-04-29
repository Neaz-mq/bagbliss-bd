'use client'

import { useRef, useState, useEffect } from 'react'
import { Menu, Search, ExternalLink, ChevronDown, LogOut } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import AdminNotifications from './AdminNotifications'

interface Props { onMenuClick: () => void }

export default function AdminTopbar({ onMenuClick }: Props) {
  const { data: session } = useSession()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const initials  = session?.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'AD'
  const firstName = session?.user?.name?.split(' ')[0] ?? 'Admin'
  const fullName  = session?.user?.name  ?? 'Admin'
  const email     = session?.user?.email ?? ''

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
        <button
          onClick={onMenuClick}
          className="lg:hidden"
          style={{ width: '38px', height: '38px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#475569', cursor: 'pointer' }}
        >
          <Menu size={18} strokeWidth={2} />
        </button>

        <label className="hidden md:flex"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', border: '1.5px solid #e8edf5', borderRadius: '12px', padding: '0 14px', height: '40px', cursor: 'text', maxWidth: '320px', width: '100%' }}>
          <Search size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <input type="text" placeholder="Search orders, products, customers…"
            style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.83rem', color: '#334155', width: '100%' }} />
          <kbd style={{ fontSize: '11px', color: '#cbd5e1', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '2px 7px', fontFamily: 'monospace', whiteSpace: 'nowrap', flexShrink: 0 }}>⌘K</kbd>
        </label>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>

        {/* View Store */}
        <Link href="/" target="_blank" className="hidden md:flex"
          style={{ alignItems: 'center', gap: '6px', padding: '0 14px', height: '36px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, color: '#e91e8c', textDecoration: 'none', border: '1.5px solid rgba(233,30,140,0.2)', background: 'rgba(233,30,140,0.05)' }}>
          <ExternalLink size={13} strokeWidth={2.5} />
          View Store
        </Link>

        <div className="hidden md:block"
          style={{ width: '1px', height: '28px', background: '#e8edf5', margin: '0 6px' }} />

        {/* ── Real-time Notifications Bell ── */}
        <AdminNotifications />

        <div style={{ width: '1px', height: '28px', background: '#e8edf5', margin: '0 6px' }} />

        {/* Profile dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '5px 10px 5px 6px', borderRadius: '12px',
              border: `1.5px solid ${dropdownOpen ? 'rgba(233,30,140,0.3)' : '#e8edf5'}`,
              background: dropdownOpen ? 'rgba(233,30,140,0.04)' : '#f8fafc',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg, #e91e8c 0%, #f43f5e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0, boxShadow: '0 2px 8px rgba(233,30,140,0.35)' }}>
              {initials}
            </div>
            <div className="hidden md:block" style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', margin: 0, lineHeight: 1, whiteSpace: 'nowrap' }}>{firstName}</p>
              <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: '2px 0 0', lineHeight: 1 }}>Administrator</p>
            </div>
            <ChevronDown size={14} strokeWidth={2.5} className="hidden md:block"
              style={{ color: '#94a3b8', flexShrink: 0, transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
          </button>

          {dropdownOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '220px', background: '#ffffff', borderRadius: '14px', border: '1px solid #f1f5f9', boxShadow: '0 8px 32px rgba(0,0,0,0.10)', overflow: 'hidden', zIndex: 50 }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #f8fafc', background: 'linear-gradient(135deg, rgba(233,30,140,0.04), rgba(244,63,94,0.02))' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0, background: 'linear-gradient(135deg, #e91e8c, #f43f5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.85rem', fontWeight: 800 }}>
                    {initials}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fullName}</p>
                    <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</p>
                  </div>
                </div>
              </div>
              <div style={{ padding: '6px' }}>
                <button
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