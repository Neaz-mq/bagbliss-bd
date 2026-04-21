'use client'

import { Menu, Bell, Search, ExternalLink } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

interface Props {
  onMenuClick: () => void
}

export default function AdminTopbar({ onMenuClick }: Props) {
  const { data: session } = useSession()

  const initials =
    session?.user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? 'AD'

  const firstName = session?.user?.name?.split(' ')[0] ?? 'Admin'

  return (
    <header
      style={{
        height: '60px',
        background: 'white',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
      }}
    >
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onMenuClick}
          className="lg:hidden"
          style={{
            width: '36px', height: '36px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '8px', border: 'none', background: 'transparent',
            color: '#64748b', cursor: 'pointer',
          }}
        >
          <Menu size={20} />
        </button>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: '10px',
            padding: '0 14px',
            height: '38px',
            cursor: 'text',
            minWidth: '280px',
          }}
          className="hidden md:flex"
        >
          <Search size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search orders, products, customers..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '0.85rem',
              color: '#334155',
              width: '100%',
            }}
          />
          <kbd style={{
            fontSize: '11px',
            color: '#cbd5e1',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '5px',
            padding: '1px 6px',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
          }}>
            ⌘K
          </kbd>
        </label>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Link
          href="/"
          target="_blank"
          className="hidden md:flex"
          style={{
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#64748b',
            textDecoration: 'none',
            border: '1.5px solid #e2e8f0',
            background: 'white',
          }}
        >
          <ExternalLink size={13} />
          View Store
        </Link>

        <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 8px' }} className="hidden md:block" />

        <button
          style={{
            position: 'relative',
            width: '38px', height: '38px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '9px', border: 'none', background: 'transparent',
            color: '#64748b', cursor: 'pointer',
          }}
        >
          <Bell size={18} />
          <span style={{
            position: 'absolute', top: '9px', right: '9px',
            width: '7px', height: '7px', borderRadius: '50%',
            background: '#e91e8c', border: '1.5px solid white',
          }} />
        </button>

        <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 8px' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="hidden md:block" style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', margin: 0, lineHeight: 1 }}>
              {firstName}
            </p>
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '2px 0 0', lineHeight: 1 }}>
              Administrator
            </p>
          </div>

          <div style={{
            width: '36px', height: '36px',
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #e91e8c 0%, #f43f5e 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '0.8rem', fontWeight: 800,
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(233,30,140,0.3)',
          }}>
            {initials}
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="hidden md:block"
            style={{
              fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px 10px', borderRadius: '7px',
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}