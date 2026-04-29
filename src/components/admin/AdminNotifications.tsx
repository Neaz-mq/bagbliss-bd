'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Bell, ShoppingBag, X,
  CheckCheck, Trash2, Wifi, WifiOff,
  Users, AlertTriangle, CreditCard,
} from 'lucide-react'
import { useAdminSocket, OrderNotification } from '@/hooks/useAdminSocket'
import Link from 'next/link'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  if (mins  < 1)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}

function NotificationIcon({ type }: { type: string }) {
  if (type === 'alert') return (
    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <AlertTriangle size={16} color="#f59e0b" />
    </div>
  )
  if (type === 'bkash' || type === 'nagad' || type === 'card') return (
    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <CreditCard size={16} color="#6366f1" />
    </div>
  )
  return (
    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(233,30,140,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <ShoppingBag size={16} color="#e91e8c" />
    </div>
  )
}

function NotifItem({ notif, onRead }: { notif: OrderNotification; onRead: () => void }) {
  const isAlert   = notif.payment === 'alert'
  
  const title     = isAlert
    ? `⚠️ Low Stock: ${notif.customerName}`
    : `New Order #${notif.orderNumber}`
  const subtitle  = isAlert
    ? `Only ${notif.total} items remaining`
    : `৳${notif.total.toLocaleString()} · ${notif.customerName} · ${notif.items} item${notif.items !== 1 ? 's' : ''}`

  return (
    <div
      onClick={onRead}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '10px',
        padding: '12px 16px',
        background: notif.read ? 'transparent' : 'rgba(233,30,140,0.03)',
        borderLeft: notif.read ? '3px solid transparent' : '3px solid #e91e8c',
        cursor: 'pointer', transition: 'background 0.15s',
        borderBottom: '1px solid #f8fafc',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
      onMouseLeave={e => (e.currentTarget.style.background = notif.read ? 'transparent' : 'rgba(233,30,140,0.03)')}
    >
      <NotificationIcon type={notif.payment} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.82rem', fontWeight: notif.read ? 500 : 700, color: '#1e293b', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </p>
        <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {subtitle}
        </p>
        <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: '3px 0 0' }}>
          {timeAgo(notif.createdAt)}
        </p>
      </div>
      {!notif.read && (
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#e91e8c', flexShrink: 0, marginTop: '4px' }} />
      )}
    </div>
  )
}

export default function AdminNotifications() {
  const [open, setOpen] = useState(false)
  const ref             = useRef<HTMLDivElement>(null)

  const {
    connected, notifications, unreadCount,
    visitors, lastActivity,
    markAllRead, markRead, clearAll,
    requestNotificationPermission,
  } = useAdminSocket()

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Request permission on mount
  useEffect(() => {
    requestNotificationPermission()
  }, [requestNotificationPermission])

  return (
    <div ref={ref} style={{ position: 'relative' }}>

      {/* ── Bell Button ─────────────────────────────────────────── */}
      <button
        onClick={() => { setOpen(v => !v); if (!open && unreadCount > 0) markAllRead() }}
        style={{
          position: 'relative', width: '40px', height: '40px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '11px',
          border: `1.5px solid ${open ? 'rgba(233,30,140,0.3)' : '#e8edf5'}`,
          background: open ? 'rgba(233,30,140,0.05)' : '#f8fafc',
          color: '#475569', cursor: 'pointer', transition: 'all 0.15s',
        }}
      >
        <Bell size={17} strokeWidth={2} />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '6px', right: '6px',
            minWidth: '16px', height: '16px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #e91e8c, #f43f5e)',
            color: 'white', fontSize: '0.6rem', fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px', border: '2px solid white',
            animation: 'pulse 2s infinite',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}

        {/* Connection indicator */}
        <span style={{
          position: 'absolute', bottom: '6px', right: '6px',
          width: '6px', height: '6px', borderRadius: '50%',
          background: connected ? '#22c55e' : '#ef4444',
          border: '1.5px solid white',
        }} />
      </button>

      {/* ── Dropdown Panel ──────────────────────────────────────── */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0,
          width: '360px', background: 'white', borderRadius: '16px',
          border: '1px solid #f1f5f9',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
          zIndex: 200, overflow: 'hidden',
          animation: 'dropIn 0.15s ease',
        }}>

          {/* Header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={15} color="#e91e8c" />
              <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Notifications</p>
              {unreadCount > 0 && (
                <span style={{ background: '#e91e8c', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '1px 7px', borderRadius: '99px' }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {notifications.length > 0 && (
                <>
                  <button onClick={markAllRead} title="Mark all read"
                    style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                    <CheckCheck size={13} />
                  </button>
                  <button onClick={clearAll} title="Clear all"
                    style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444' }}>
                    <Trash2 size={13} />
                  </button>
                </>
              )}
              <button onClick={() => setOpen(false)}
                style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Live stats bar */}
          <div style={{
            display: 'flex', gap: '0', borderBottom: '1px solid #f1f5f9',
            background: '#fafbfc',
          }}>
            {[
              {
                icon: connected ? Wifi : WifiOff,
                label: connected ? 'Connected' : 'Offline',
                color: connected ? '#22c55e' : '#ef4444',
                value: null,
              },
              {
                icon: Users,
                label: 'Online',
                color: '#6366f1',
                value: visitors.count,
              },
            ].map(({ icon: Icon, label, color, value }) => (
              <div key={label} style={{
                flex: 1, padding: '8px 12px',
                display: 'flex', alignItems: 'center', gap: '6px',
                borderRight: '1px solid #f1f5f9',
              }}>
                <Icon size={12} style={{ color, flexShrink: 0 }} />
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{label}</span>
                {value !== null && (
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color, marginLeft: 'auto' }}>{value}</span>
                )}
              </div>
            ))}
          </div>

          {/* Last activity */}
          {lastActivity && (
            <div style={{ padding: '8px 16px', background: 'rgba(233,30,140,0.03)', borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#e91e8c', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                {lastActivity}
              </p>
            </div>
          )}

          {/* Notifications list */}
          <div style={{ maxHeight: '340px', overflowY: 'auto', scrollbarWidth: 'thin' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(233,30,140,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Bell size={22} color="#e91e8c" style={{ opacity: 0.4 }} />
                </div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b', margin: 0 }}>No notifications yet</p>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 0' }}>New orders will appear here in real-time</p>
              </div>
            ) : (
              notifications.map(n => (
                <NotifItem key={n.id} notif={n} onRead={() => markRead(n.id)} />
              ))
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f5f9', background: '#fafbfc' }}>
            <Link
              href="/admin/orders"
              onClick={() => setOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                fontSize: '0.8rem', fontWeight: 700, color: '#e91e8c', textDecoration: 'none',
              }}
            >
              View all orders →
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse   { 0%,100%{opacity:1}50%{opacity:0.5} }
        @keyframes dropIn  { from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}