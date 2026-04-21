'use client'

import Link from 'next/link'
import { Plus, ShoppingBag, Users, Zap, Settings, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const ACTIONS = [
  { label: 'Add New Product',  href: '/admin/products',   icon: Plus,        color: '#e91e8c', bg: 'rgba(233,30,140,0.08)' },
  { label: 'Manage Orders',    href: '/admin/orders',     icon: ShoppingBag, color: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
  { label: 'View Customers',   href: '/admin/customers',  icon: Users,       color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  { label: 'Flash Sale Setup', href: '/admin/flash-sale', icon: Zap,         color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  { label: 'Store Settings',   href: '/admin/settings',   icon: Settings,    color: '#64748b', bg: 'rgba(100,116,139,0.08)' },
]

export default function QuickActions() {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div style={{ padding: '8px' }}>
      {ACTIONS.map(({ label, href, icon: Icon, color, bg }) => (
        <Link
          key={href}
          href={href}
          onMouseEnter={() => setHovered(href)}
          onMouseLeave={() => setHovered(null)}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '10px',
            textDecoration: 'none',
            background: hovered === href ? '#f8fafc' : 'transparent',
            transition: 'background 0.12s',
          }}
        >
          <div style={{
            width: '30px', height: '30px', borderRadius: '8px',
            background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon size={14} style={{ color }} strokeWidth={2.2} />
          </div>
          <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155', flex: 1 }}>
            {label}
          </span>
          <ChevronRight size={13} style={{ color: hovered === href ? '#e91e8c' : '#cbd5e1', transition: 'color 0.12s' }} />
        </Link>
      ))}
    </div>
  )
}