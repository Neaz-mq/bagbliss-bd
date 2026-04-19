'use client'

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

// ── Mock order data — replace with real API fetch ──────────────────────────
const MOCK_ORDERS = [
  {
    id: 'BB303832',
    date: '19 Apr 2026',
    status: 'processing',
    items: [{ name: 'Pearl Mini Crossbody', qty: 1, price: 1199 }],
    total: 1259,
    delivery: 'Standard Delivery',
  },
]

const STATUS_CONFIG = {
  processing: { label: 'Processing',  icon: Clock,         color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)'  },
  shipped:    { label: 'Shipped',      icon: Truck,         color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)'  },
  delivered:  { label: 'Delivered',   icon: CheckCircle2,  color: '#22c55e', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)'   },
  cancelled:  { label: 'Cancelled',   icon: Package,       color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)'   },
} as const

type OrderStatus = keyof typeof STATUS_CONFIG

export default function OrdersPage() {
  const { data: session, status } = useSession()

  // ── Loading ──────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="orders-page">
        <div className="container-bagbliss">
          <div className="orders-skeleton">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '1.25rem' }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Not signed in ─────────────────────────────────────────────────────────
  if (!session) {
    return (
      <div className="orders-empty-page">
        <div className="orders-empty-inner">
          <div className="orders-empty-icon">
            <Package size={40} strokeWidth={1.5} />
          </div>
          <h1 className="orders-empty-title">Sign in to view orders</h1>
          <p className="orders-empty-desc">
            Track your purchases and manage returns from your account.
          </p>
          <div className="orders-empty-actions">
            <Link href="/login" className="btn-primary">Sign In</Link>
            <Link href="/shop" className="btn-secondary">Browse Bags</Link>
          </div>
        </div>
      </div>
    )
  }

  // ── No orders ─────────────────────────────────────────────────────────────
  if (MOCK_ORDERS.length === 0) {
    return (
      <div className="orders-empty-page">
        <div className="orders-empty-inner">
          <div className="orders-empty-icon">
            <ShoppingBag size={40} strokeWidth={1.5} />
          </div>
          <h1 className="orders-empty-title">No orders yet</h1>
          <p className="orders-empty-desc">
            Looks like you haven&apos;t placed any orders. Start exploring our
            collection!
          </p>
          <div className="orders-empty-actions">
            <Link href="/shop" className="btn-primary">
              <ShoppingBag size={18} /> Start Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Orders list ───────────────────────────────────────────────────────────
  return (
    <div className="orders-page">
      {/* Breadcrumb */}
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
        {/* Header */}
        <div className="orders-header">
          <div>
            <h1 className="orders-title">My Orders</h1>
            <p className="orders-subtitle">
              {MOCK_ORDERS.length} order{MOCK_ORDERS.length !== 1 ? 's' : ''} placed
            </p>
          </div>
          <Link href="/shop" className="orders-shop-link">
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
        </div>

        {/* Order cards */}
        <div className="orders-list">
          {MOCK_ORDERS.map((order) => {
            const cfg = STATUS_CONFIG[order.status as OrderStatus]
            const StatusIcon = cfg.icon
            return (
              <div key={order.id} className="order-card">
                {/* Card header */}
                <div className="order-card-header">
                  <div className="order-card-meta">
                    <span className="order-id">#{order.id}</span>
                    <span className="order-date">{order.date}</span>
                  </div>
                  <span
                    className="order-status-badge"
                    style={{
                      color:            cfg.color,
                      background:       cfg.bg,
                      border:           `1px solid ${cfg.border}`,
                    }}
                  >
                    <StatusIcon size={13} />
                    {cfg.label}
                  </span>
                </div>

                {/* Items */}
                <div className="order-card-items">
                  {order.items.map((item, i) => (
                    <div key={i} className="order-item-row">
                      <div className="order-item-placeholder-img">
                        <ShoppingBag size={18} strokeWidth={1.5} />
                      </div>
                      <div className="order-item-info">
                        <span className="order-item-name">{item.name}</span>
                        <span className="order-item-qty">Qty: {item.qty}</span>
                      </div>
                      <span className="order-item-price">
                        ৳{item.price.toLocaleString('en-BD')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="order-card-footer">
                  <div className="order-delivery-label">
                    <Truck size={14} />
                    {order.delivery}
                  </div>
                  <div className="order-total">
                    Total&nbsp;
                    <strong>৳{order.total.toLocaleString('en-BD')}</strong>
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