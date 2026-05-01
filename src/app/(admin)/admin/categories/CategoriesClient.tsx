'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Tag, Package, TrendingUp, RefreshCw, ShoppingBag,
  Star, Zap, BarChart3, ArrowRight, Search,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

// ── Types ──────────────────────────────────────────────────────────────────

interface CategoryStats {
  total:      number
  active:     number
  featured:   number
  flashSale:  number
  totalStock: number
  totalSold:  number
  avgPrice:   number
  minPrice:   number
  maxPrice:   number
}

interface Category {
  value:       string
  label:       string
  emoji:       string
  description: string
  stats:       CategoryStats
}

// ── Config ─────────────────────────────────────────────────────────────────

const CAT_GRADIENTS: Record<string, { from: string; to: string; light: string; border: string }> = {
  'mini-crossbody': { from: '#e91e8c', to: '#f43f5e', light: 'rgba(233,30,140,0.07)', border: 'rgba(233,30,140,0.18)' },
  'chain-strap':    { from: '#6366f1', to: '#8b5cf6', light: 'rgba(99,102,241,0.07)',  border: 'rgba(99,102,241,0.18)'  },
  'leather':        { from: '#b45309', to: '#d97706', light: 'rgba(180,83,9,0.07)',    border: 'rgba(180,83,9,0.18)'    },
  'canvas':         { from: '#059669', to: '#10b981', light: 'rgba(5,150,105,0.07)',   border: 'rgba(5,150,105,0.18)'   },
  'party':          { from: '#db2777', to: '#ec4899', light: 'rgba(219,39,119,0.07)', border: 'rgba(219,39,119,0.18)'  },
}

// ── Stat Pill ──────────────────────────────────────────────────────────────

function StatPill({
  icon: Icon, label, value, color,
}: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '4px', padding: '10px 8px', borderRadius: '10px',
      background: '#f8fafc', border: '1px solid #f1f5f9', flex: 1,
    }}>
      <Icon size={14} style={{ color }} />
      <p style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: '0.62rem', color: '#94a3b8', margin: 0, fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{label}</p>
    </div>
  )
}

// ── Category Card ──────────────────────────────────────────────────────────

function CategoryCard({ cat, rank }: { cat: Category; rank: number }) {
  const g   = CAT_GRADIENTS[cat.value] ?? CAT_GRADIENTS['mini-crossbody']
  const pct = cat.stats.total > 0 ? Math.round((cat.stats.active / cat.stats.total) * 100) : 0
  const sold = cat.stats.totalSold ?? 0

  return (
    <div style={{
      background: 'white', borderRadius: '20px',
      border: `1px solid ${g.border}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      transition: 'box-shadow 0.2s, transform 0.2s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.1)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Card header */}
      <div style={{
        padding: '20px 20px 16px',
        background: `linear-gradient(135deg, ${g.light}, transparent)`,
        borderBottom: `1px solid ${g.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '16px', flexShrink: 0,
              background: `linear-gradient(135deg, ${g.from}, ${g.to})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', boxShadow: `0 4px 14px ${g.light}`,
            }}>
              {cat.emoji}
            </div>
            <div>
              <p style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{cat.label}</p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '3px 0 0' }}>{cat.description}</p>
            </div>
          </div>

          {/* Rank badge */}
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
            background: rank === 1
              ? 'linear-gradient(135deg, #f59e0b, #d97706)'
              : rank === 2
              ? 'linear-gradient(135deg, #94a3b8, #64748b)'
              : rank === 3
              ? 'linear-gradient(135deg, #b45309, #92400e)'
              : '#f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.72rem', fontWeight: 800,
            color: rank <= 3 ? 'white' : '#94a3b8',
          }}>
            #{rank}
          </div>
        </div>

        {/* Active progress bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>Active products</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: g.from }}>{pct}%</span>
          </div>
          <div style={{ height: '5px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '99px', width: `${pct}%`,
              background: `linear-gradient(90deg, ${g.from}, ${g.to})`,
              transition: 'width 0.8s ease',
            }} />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <StatPill icon={Package} label="Total"    value={cat.stats.total}      color={g.from}    />
          <StatPill icon={Tag}     label="Active"   value={cat.stats.active}     color="#10b981"   />
          <StatPill icon={Star}    label="Featured" value={cat.stats.featured}   color="#f59e0b"   />
          <StatPill icon={Zap}     label="On Sale"  value={cat.stats.flashSale}  color="#e91e8c"   />
        </div>

        {/* Price range */}
        {cat.stats.total > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 12px', background: '#f8fafc', borderRadius: '10px',
            border: '1px solid #f1f5f9', marginBottom: '14px',
          }}>
            <div>
              <p style={{ fontSize: '0.62rem', color: '#94a3b8', margin: '0 0 2px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Price Range</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                ৳{cat.stats.minPrice.toLocaleString('en-US')}
                {' '}–{' '}
                ৳{cat.stats.maxPrice.toLocaleString('en-US')}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.62rem', color: '#94a3b8', margin: '0 0 2px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Avg Price</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 800, color: g.from, margin: 0 }}>
                ৳{Math.round(cat.stats.avgPrice).toLocaleString('en-US')}
              </p>
            </div>
          </div>
        )}

        {/* Stock + Sold */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <div style={{ flex: 1, padding: '10px 12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <p style={{ fontSize: '0.62rem', color: '#94a3b8', margin: '0 0 3px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>In Stock</p>
            <p style={{ fontSize: '1rem', fontWeight: 800, color: '#15803d', margin: 0 }}>{cat.stats.totalStock}</p>
          </div>
          <div style={{ flex: 1, padding: '10px 12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <p style={{ fontSize: '0.62rem', color: '#94a3b8', margin: '0 0 3px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Sold</p>
            <p style={{ fontSize: '1rem', fontWeight: 800, color: '#6366f1', margin: 0 }}>{sold}</p>
          </div>
        </div>

        {/* View products link */}
        <Link
          href={`/admin/products?category=${cat.value}`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: '10px', borderRadius: '10px', textDecoration: 'none',
            fontSize: '0.82rem', fontWeight: 700,
            background: `linear-gradient(135deg, ${g.from}, ${g.to})`,
            color: 'white', boxShadow: `0 3px 10px ${g.border}`,
          }}
        >
          <Package size={14} />
          View Products
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  )
}

// ── Summary Bar ────────────────────────────────────────────────────────────

function SummaryBar({ categories }: { categories: Category[] }) {
  const totals = categories.reduce((acc, cat) => ({
    products:  acc.products  + cat.stats.total,
    active:    acc.active    + cat.stats.active,
    stock:     acc.stock     + cat.stats.totalStock,
    sold:      acc.sold      + cat.stats.totalSold,
    featured:  acc.featured  + cat.stats.featured,
    flashSale: acc.flashSale + cat.stats.flashSale,
  }), { products: 0, active: 0, stock: 0, sold: 0, featured: 0, flashSale: 0 })

  const items = [
    { label: 'Total Products', value: totals.products,  icon: Package,     gradient: 'linear-gradient(135deg, #e91e8c, #f43f5e)' },
    { label: 'Active',         value: totals.active,    icon: Tag,         gradient: 'linear-gradient(135deg, #10b981, #059669)' },
    { label: 'In Stock',       value: totals.stock,     icon: ShoppingBag, gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
    { label: 'Total Sold',     value: totals.sold,      icon: TrendingUp,  gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
    { label: 'Featured',       value: totals.featured,  icon: Star,        gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)' },
    { label: 'Flash Sale',     value: totals.flashSale, icon: Zap,         gradient: 'linear-gradient(135deg, #ec4899, #e91e8c)' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
      {items.map(({ label, value, icon: Icon, gradient }) => (
        <div key={label} style={{
          background: 'white', borderRadius: '16px', padding: '16px',
          border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '11px', flexShrink: 0,
            background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={17} color="white" strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px', fontWeight: 500 }}>{label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────

export default function CategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [sortBy,     setSortBy]     = useState<'products' | 'sold' | 'stock' | 'name'>('products')

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/categories?stats=true')
      const data = await res.json()
      setCategories(data.categories ?? [])
    } catch {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const sorted = [...categories]
    .filter(c => c.label.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'products') return b.stats.total      - a.stats.total
      if (sortBy === 'sold')     return b.stats.totalSold  - a.stats.totalSold
      if (sortBy === 'stock')    return b.stats.totalStock - a.stats.totalStock
      if (sortBy === 'name')     return a.label.localeCompare(b.label)
      return 0
    })

  const rankMap = Object.fromEntries(
    [...categories]
      .sort((a, b) => b.stats.total - a.stats.total)
      .map((c, i) => [c.value, i + 1])
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>
            Categories
          </h1>
          <p suppressHydrationWarning style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '4px 0 0' }}>
            {categories.length} categories · Overview of your product catalog
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* ✅ Fix: suppressHydrationWarning on button with onClick */}
          <button
            suppressHydrationWarning
            onClick={fetchCategories}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#475569', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <Link
            href="/admin/products"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #e91e8c, #f43f5e)', color: 'white', fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 14px rgba(233,30,140,0.35)' }}
          >
            <Package size={15} /> Manage Products
          </Link>
        </div>
      </div>

      {/* Summary bar */}
      {!loading && <SummaryBar categories={categories} />}

      {/* Top category banner */}
      {!loading && sorted.length > 0 && (() => {
        const top = [...categories].sort((a, b) => b.stats.totalSold - a.stats.totalSold)[0]
        if (!top || top.stats.totalSold === 0) return null
        const g = CAT_GRADIENTS[top.value] ?? CAT_GRADIENTS['mini-crossbody']
        return (
          <div style={{
            padding: '18px 22px', borderRadius: '16px',
            background: `linear-gradient(135deg, ${g.from}14, ${g.to}0a)`,
            border: `1.5px solid ${g.border}`,
            display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: '28px' }}>{top.emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 800, color: g.from, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 3px' }}>
                🏆 Best Selling Category
              </p>
              <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {top.label} — {top.stats.totalSold} units sold · ৳{Math.round(top.stats.avgPrice).toLocaleString('en-US')} avg price
              </p>
            </div>
            <Link
              href={`/admin/products?category=${top.value}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '9px', background: `linear-gradient(135deg, ${g.from}, ${g.to})`, color: 'white', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              View Products <ArrowRight size={13} />
            </Link>
          </div>
        )
      })()}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 200px', background: '#fff', border: '1.5px solid #e8edf5', borderRadius: '12px', padding: '0 14px', height: '42px' }}>
          <Search size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
          {/* ✅ Fix: suppressHydrationWarning on controlled input */}
          <input
            suppressHydrationWarning
            type="text"
            placeholder="Search categories…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.85rem', color: '#334155' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '4px', background: 'white', padding: '4px', borderRadius: '12px', border: '1.5px solid #e8edf5' }}>
          {([
            { key: 'products', label: 'By Products' },
            { key: 'sold',     label: 'By Sales'    },
            { key: 'stock',    label: 'By Stock'    },
            { key: 'name',     label: 'By Name'     },
          ] as const).map(({ key, label }) => (
            // ✅ Fix: suppressHydrationWarning on sort buttons (style depends on state)
            <button
              suppressHydrationWarning
              key={key}
              onClick={() => setSortBy(key)}
              style={{
                padding: '6px 14px', borderRadius: '8px', border: 'none',
                cursor: 'pointer', fontSize: '0.78rem', fontWeight: sortBy === key ? 700 : 500,
                background: sortBy === key ? 'linear-gradient(135deg, #e91e8c, #f43f5e)' : 'transparent',
                color: sortBy === key ? 'white' : '#64748b',
                transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ padding: '80px', textAlign: 'center', background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #f1f5f9', borderTopColor: '#e91e8c', animation: 'spin 0.7s linear infinite', margin: '0 auto 14px' }} />
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Loading categories…</p>
        </div>
      )}

      {/* Category Cards Grid */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {sorted.map(cat => (
            <CategoryCard key={cat.value} cat={cat} rank={rankMap[cat.value] ?? 99} />
          ))}
        </div>
      )}

      {/* Sales breakdown chart */}
      {!loading && categories.length > 0 && (() => {
        const withSales = categories.filter(c => c.stats.totalSold > 0)
        if (withSales.length === 0) return null
        const max = Math.max(...categories.map(c => c.stats.totalSold))
        return (
          <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', padding: '24px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(233,30,140,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart3 size={17} color="#e91e8c" />
              </div>
              <div>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Sales by Category</p>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 0' }}>Total units sold per category</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[...categories]
                .sort((a, b) => b.stats.totalSold - a.stats.totalSold)
                .map(cat => {
                  const g   = CAT_GRADIENTS[cat.value] ?? CAT_GRADIENTS['mini-crossbody']
                  const pct = max > 0 ? (cat.stats.totalSold / max) * 100 : 0
                  return (
                    <div key={cat.value}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px' }}>{cat.emoji}</span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>{cat.label}</span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>({cat.stats.total} products)</span>
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 800, color: g.from }}>{cat.stats.totalSold} sold</span>
                      </div>
                      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${pct}%`, borderRadius: '99px',
                          background: `linear-gradient(90deg, ${g.from}, ${g.to})`,
                          transition: 'width 1s ease',
                        }} />
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )
      })()}

      {/* Quick actions */}
      {!loading && (
        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', padding: '20px 24px' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: '0 0 14px' }}>Quick Actions</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { label: '➕ Add New Product',   href: '/admin/products',   color: '#e91e8c' },
              { label: '⚡ Manage Flash Sale', href: '/admin/flash-sale', color: '#f59e0b' },
              { label: '📊 View All Orders',   href: '/admin/orders',     color: '#6366f1' },
              { label: '👜 Visit Shop',         href: '/shop',            color: '#10b981' },
            ].map(({ label, href, color }) => (
              <Link
                key={href} href={href}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '9px 16px', borderRadius: '10px', textDecoration: 'none',
                  fontSize: '0.82rem', fontWeight: 700, color,
                  background: `${color}10`, border: `1.5px solid ${color}25`,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${color}18` }}
                onMouseLeave={e => { e.currentTarget.style.background = `${color}10` }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}