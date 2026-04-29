'use client'

import { useRouter } from 'next/navigation'
import {
  ShoppingBag,
  Sparkles,
  Link2,
  Palette,
  BookOpen,
  PartyPopper,
} from 'lucide-react'

const CATEGORIES = [
  {
    label: 'All Bags',
    value: 'all',
    icon: ShoppingBag,
    color: '#1A1A2E',
    bg: 'rgba(26,26,46,0.06)',
    count: '500+',
  },
  {
    label: 'Mini Crossbody',
    value: 'mini-crossbody',
    icon: Sparkles,
    color: '#E91E8C',
    bg: 'rgba(233,30,140,0.08)',
    count: '120+',
  },
  {
    label: 'Chain Strap',
    value: 'chain-strap',
    icon: Link2,
    color: '#C9A84C',
    bg: 'rgba(201,168,76,0.08)',
    count: '85+',
  },
  {
    label: 'Leather',
    value: 'leather',
    icon: Palette,
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
    count: '60+',
  },
  {
    label: 'Canvas',
    value: 'canvas',
    icon: BookOpen,
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.08)',
    count: '95+',
  },
  {
    label: 'Party & Evening',
    value: 'party',
    icon: PartyPopper,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    count: '45+',
  },
]

function CategoryCard({
  category,
  index,
}: {
  category: (typeof CATEGORIES)[0]
  index: number
}) {
  const router = useRouter()
  const Icon = category.icon

  const handleClick = () => {
    if (category.value === 'all') {
      router.push('/shop')
    } else {
      router.push(`/shop?category=${category.value}`)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="category-card"
      style={{ animationDelay: `${index * 0.08}s` }}
      suppressHydrationWarning  // ← fixes browser extension attribute injection
    >
      <div className="category-icon-circle" style={{ background: category.bg }}>
        <Icon size={28} color={category.color} strokeWidth={1.5} />
      </div>
      <span className="category-label">{category.label}</span>
      <span className="category-count" style={{ color: category.color }}>
        {category.count}
      </span>
    </button>
  )
}

export default function CategoryStrip() {
  const router = useRouter()  // ← moved here for the CTA button

  return (
    <section className="section category-section">
      <div className="container-bagbliss">
        <div className="section-header">
          <div className="section-badge">
            <span>Shop by Style</span>
          </div>
          <h2 className="section-title">
            Find Your
            <span className="text-gradient"> Perfect Bag</span>
          </h2>
          <p className="section-subtitle">
            Explore our curated collection of mini crossbody bags for every
            occasion and style
          </p>
        </div>

        <div className="category-grid">
          {CATEGORIES.map((cat, i) => (
            <CategoryCard key={cat.value} category={cat} index={i} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="category-cta">
          <p>
            Can&apos;t find what you&apos;re looking for?{' '}
            <button
              onClick={() => router.push('/shop')}  // ← fixed: was empty
              className="category-cta-link"
              suppressHydrationWarning  // ← fixes browser extension injection
            >
              Browse all 500+ bags →
            </button>
          </p>
        </div>
      </div>
    </section>
  )
}