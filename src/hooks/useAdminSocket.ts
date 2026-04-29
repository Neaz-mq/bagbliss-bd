'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSocket }                         from './useSocket'

export interface OrderNotification {
  id:          string
  orderNumber: string
  customerName: string
  total:       number
  payment:     string
  items:       number
  createdAt:   string
  read:        boolean
}

export interface VisitorData {
  count:    number
  visitors: { page: string; joinedAt: string }[]
}

export function useAdminSocket() {
  const { socket, connected }               = useSocket()
  const [notifications, setNotifications]   = useState<OrderNotification[]>([])
  const [visitors,      setVisitors]        = useState<VisitorData>({ count: 0, visitors: [] })
  const [isAdminJoined, setIsAdminJoined]   = useState(false)
  const [lastActivity,  setLastActivity]    = useState<string | null>(null)

  // Join admin room
  useEffect(() => {
    if (!connected || isAdminJoined) return

    const secret = process.env.NEXT_PUBLIC_SOCKET_URL
      ? 'bagbliss-socket-secret-2026'
      : 'bagbliss-socket-secret-2026'

    socket.emit('join:admin', { secret: 'bagbliss-socket-secret-2026' })
    setIsAdminJoined(true)
  }, [connected, socket, isAdminJoined])

  // Reset joined state on disconnect
  useEffect(() => {
    if (!connected) setIsAdminJoined(false)
  }, [connected])

  // Listen to events
  useEffect(() => {
    // ── New order ──────────────────────────────────────────────────
    const onNewOrder = (data: Omit<OrderNotification, 'read'>) => {
      const notification: OrderNotification = { ...data, read: false }
      setNotifications(prev => [notification, ...prev].slice(0, 50))
      setLastActivity(`New order #${data.orderNumber} — ৳${data.total.toLocaleString()}`)

      // Browser notification
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('🛍️ New BagBliss Order!', {
            body: `#${data.orderNumber} — ৳${data.total.toLocaleString()} from ${data.customerName}`,
            icon: '/favicon.svg',
          })
        }
      }
    }

    // ── Visitor update ─────────────────────────────────────────────
    const onVisitorUpdate = (data: VisitorData) => {
      setVisitors(data)
    }

    // ── Stock alert ────────────────────────────────────────────────
    const onLowStock = (data: { productName: string; stock: number }) => {
      setLastActivity(`⚠️ Low stock: ${data.productName} (${data.stock} left)`)
      const lowStockNotif: OrderNotification = {
        id:           `stock-${Date.now()}`,
        orderNumber:  'STOCK ALERT',
        customerName: data.productName,
        total:        data.stock,
        payment:      'alert',
        items:        data.stock,
        createdAt:    new Date().toISOString(),
        read:         false,
      }
      setNotifications(prev => [lowStockNotif, ...prev].slice(0, 50))
    }

    // ── Payment confirmed ──────────────────────────────────────────
    const onPaymentConfirmed = (data: { orderNumber: string; total: number; payment: string }) => {
      setLastActivity(`💳 Payment confirmed: #${data.orderNumber}`)
    }

    socket.on('order:new',           onNewOrder)
    socket.on('visitors:update',     onVisitorUpdate)
    socket.on('stock:low',           onLowStock)
    socket.on('payment:confirmed',   onPaymentConfirmed)

    return () => {
      socket.off('order:new',         onNewOrder)
      socket.off('visitors:update',   onVisitorUpdate)
      socket.off('stock:low',         onLowStock)
      socket.off('payment:confirmed', onPaymentConfirmed)
    }
  }, [socket])

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      await Notification.requestPermission()
    }
  }, [])

  return {
    connected,
    notifications,
    unreadCount,
    visitors,
    lastActivity,
    markAllRead,
    markRead,
    clearAll,
    requestNotificationPermission,
  }
}