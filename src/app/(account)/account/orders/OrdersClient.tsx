'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  ShoppingBag,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  color: string
  image?: string
}

interface Order {
  _id: string
  orderNumber: string
  createdAt: string
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: OrderItem[]
  total: number
  delivery: string
}

const STATUS_CONFIG = {
  processing: {
    label: 'Processing',
    icon: Clock,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
  },
  shipped: {
    label: 'Shipped',
    icon: Truck,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.2)',
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle2,
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.2)',
  },
  cancelled: {
    label: 'Cancelled',
    icon: Package,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.2)',
  },
} as const

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

type FetchState = 'idle' | 'fetching' | 'done'

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [fetchState, setFetchState] = useState<FetchState>('idle')
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) return
    if (fetchedRef.current) return

    fetchedRef.current = true

    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setOrders(data.orders)
      })
      // eslint-disable-next-line no-console
      .catch((err) => console.error(err))
      .finally(() => setFetchState('done'))
  }, [session, status])

  const isLoading = status === 'loading' || (!!session && fetchState !== 'done')

  if (isLoading) {
    return (
      <div className="orders-page" style={{ paddingTop: '72px' }}>
        <div className="container-bagbliss">
          <div className="orders-skeleton" style={{ paddingTop: '2rem' }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="skeleton"
                style={{
                  height: '140px',
                  borderRadius: '1.25rem',
                  marginBottom: '1rem',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="orders-empty-page">
        <div className="orders-empty-inner">
          <div className="orders-empty-icon">
            <Package size={40} strokeWidth={1.5} />
          </div>
          <h1 className="orders-empty-title">Sign in to view orders</h1>
          <p className="orders-empty-desc">
            Track your purchases from your account.
          </p>
          <div className="orders-empty-actions">
            <Link href="/login" className="btn-primary">
              Sign In
            </Link>
            <Link href="/shop" className="btn-secondary">
              Browse Bags
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="orders-empty-page">
        <div className="orders-empty-inner">
          <div className="orders-empty-icon">
            <ShoppingBag size={40} strokeWidth={1.5} />
          </div>
          <h1 className="orders-empty-title">No orders yet</h1>
          <p className="orders-empty-desc">Start exploring our collection!</p>
          <div className="orders-empty-actions">
            <Link href="/shop" className="btn-primary">
              <ShoppingBag size={18} /> Start Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="orders-page" style={{ paddingTop: '72px' }}>
      <div className="co-breadcrumb-bar">
        <div className="container-bagbliss">
          <nav className="co-breadcrumb">
            <Link href="/" className="co-breadcrumb-link">Home</Link>
            <ChevronRight size={14} className="co-breadcrumb-sep" />
            <Link href="/account" className="co-breadcrumb-link">Account</Link>
            <ChevronRight size={14} className="co-breadcrumb-sep" />
            <span className="co-breadcrumb-current">My Orders</span>
          </nav>
        </div>
      </div>

      <div className="container-bagbliss">
        <div className="orders-header">
          <div>
            <h1 className="orders-title">My Orders</h1>
            <p className="orders-subtitle">
              {orders.length} order{orders.length !== 1 ? 's' : ''} placed
            </p>
          </div>
          <Link href="/shop" className="orders-shop-link">
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
        </div>

        <div className="orders-list">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.processing
            const StatusIcon = cfg.icon
            return (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <div className="order-card-meta">
                    <span className="order-id">#{order.orderNumber}</span>
                    <span className="order-date">{formatDate(order.createdAt)}</span>
                  </div>
                  <span
                    className="order-status-badge"
                    style={{
                      color: cfg.color,
                      background: cfg.bg,
                      border: `1px solid ${cfg.border}`,
                    }}
                  >
                    <StatusIcon size={13} /> {cfg.label}
                  </span>
                </div>

                <div className="order-card-items">
                  {order.items.map((item, i) => (
                    <div key={i} className="order-item-row">
                      <div className="order-item-placeholder-img">
                        <ShoppingBag size={18} strokeWidth={1.5} />
                      </div>
                      <div className="order-item-info">
                        <span className="order-item-name">{item.name}</span>
                        <span className="order-item-qty">
                          Qty: {item.quantity} · {item.color}
                        </span>
                      </div>
                      <span className="order-item-price">
                        ৳{(item.price * item.quantity).toLocaleString('en-BD')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer">
                  <div className="order-delivery-label">
                    <Truck size={14} />
                    {order.delivery === 'express' ? 'Express Delivery' : 'Standard Delivery'}
                  </div>
                  <div className="order-total">
                    Total <strong>৳{order.total.toLocaleString('en-BD')}</strong>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}