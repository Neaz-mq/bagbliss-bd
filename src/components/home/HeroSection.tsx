'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ShoppingBag, Star, Truck, Shield } from 'lucide-react'

// ── Animated Counter ──────────────────────────
function Counter({
  end,
  duration = 2000,
  suffix = '',
}: {
  end: number
  duration?: number
  suffix?: string
}) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!started) return
    let startTime: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [started, end, duration])

  return (
    <span>
      {count}
      {suffix}
    </span>
  )
}

// ── Hero Section ──────────────────────────────
export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="hero-section">
      {/* Background decorative elements */}
      <div className="hero-bg-circle hero-bg-circle-1" />
      <div className="hero-bg-circle hero-bg-circle-2" />
      <div className="hero-bg-circle hero-bg-circle-3" />

      <div className="container-bagbliss hero-container">
        {/* ── Left Content ────────────────── */}
        <div
          className="hero-content"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Top Badge */}
          <div className="hero-badge">
            <Star size={12} fill="currentColor" />
            <span>New Collection 2026</span>
            <Star size={12} fill="currentColor" />
          </div>

          {/* Main Heading */}
          <h1 className="hero-heading">
            Carry Your
            <span className="hero-heading-accent"> Style</span>
            <br />
            Everywhere
            <span className="hero-heading-dot">.</span>
          </h1>

          {/* Subtitle */}
          <p
            className="hero-subtitle"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
            }}
          >
            Discover Bangladesh&apos;s most trendy mini crossbody bags. Premium
            imported styles at prices you&apos;ll love.
          </p>

          {/* CTA Buttons */}
          <div
            className="hero-buttons"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.35s',
            }}
          >
            <Link href="/shop" className="btn-primary hero-btn-primary">
              <ShoppingBag size={18} />
              Shop Now
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/shop?filter=new"
              className="btn-secondary hero-btn-secondary"
            >
              New Arrivals
            </Link>
          </div>

          {/* Trust Badges */}
          <div
            className="hero-trust"
            style={{
              opacity: isVisible ? 1 : 0,
              transition: 'all 0.8s ease 0.5s',
            }}
          >
            <div className="hero-trust-item">
              <Truck size={16} />
              <span>Free delivery over ৳1500</span>
            </div>
            <div className="hero-trust-divider" />
            <div className="hero-trust-item">
              <Shield size={16} />
              <span>Secure payment</span>
            </div>
          </div>

          {/* Stats */}
          <div
            className="hero-stats"
            style={{
              opacity: isVisible ? 1 : 0,
              transition: 'all 0.8s ease 0.6s',
            }}
          >
            <div className="hero-stat">
              <span className="hero-stat-number">
                <Counter end={500} suffix="+" />
              </span>
              <span className="hero-stat-label">Bag Styles</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-number">
                <Counter end={2000} suffix="+" />
              </span>
              <span className="hero-stat-label">Happy Customers</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-number">
                <Counter end={4} suffix=".9★" />
              </span>
              <span className="hero-stat-label">Average Rating</span>
            </div>
          </div>
        </div>

        {/* ── Right Visual ────────────────── */}
        <div
          className="hero-visual"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateX(0)' : 'translateX(40px)',
            transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
          }}
        >
          {/* Main bag display card */}
          <div className="hero-card">
            {/* Decorative background */}
            <div className="hero-card-bg" />

            {/* Bag placeholder — will be replaced with real product image */}
            <div className="hero-bag-display">
              <div className="hero-bag-mockup">
                {/* Stylized bag SVG */}
                <svg
                  viewBox="0 0 200 220"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="hero-bag-svg"
                >
                  {/* Bag strap */}
                  <path
                    d="M70 80 Q70 40 100 40 Q130 40 130 80"
                    stroke="#C9A84C"
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Bag body */}
                  <rect
                    x="30"
                    y="80"
                    width="140"
                    height="110"
                    rx="16"
                    fill="#E91E8C"
                  />
                  {/* Bag flap */}
                  <path
                    d="M30 120 Q100 95 170 120 L170 80 Q100 60 30 80 Z"
                    fill="#b5156d"
                  />
                  {/* Clasp */}
                  <circle cx="100" cy="122" r="10" fill="#C9A84C" />
                  <circle cx="100" cy="122" r="5" fill="#1A1A2E" />
                  {/* Decorative lines */}
                  <line
                    x1="50"
                    y1="150"
                    x2="150"
                    y2="150"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1"
                  />
                  <line
                    x1="50"
                    y1="165"
                    x2="130"
                    y2="165"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="1"
                  />
                </svg>
              </div>
            </div>

            {/* Floating tags */}
            <div className="hero-float-tag hero-float-tag-1">
              <span className="badge badge-gold">New Arrival</span>
            </div>

            <div className="hero-float-tag hero-float-tag-2">
              <div className="hero-price-tag">
                <span className="hero-price-label">Starting from</span>
                <span className="hero-price-value">৳ 850</span>
              </div>
            </div>

            <div className="hero-float-tag hero-float-tag-3">
              <div className="hero-rating-tag">
                <Star size={12} fill="#C9A84C" color="#C9A84C" />
                <span>4.9 Rating</span>
              </div>
            </div>
          </div>

          {/* Color swatches */}
          <div className="hero-colors">
            <span className="hero-colors-label">Available in</span>
            <div className="hero-color-dots">
              {[
                '#E91E8C',
                '#1A1A2E',
                '#C9A84C',
                '#ffffff',
                '#ef4444',
                '#3b82f6',
              ].map((color) => (
                <div
                  key={color}
                  className="hero-color-dot"
                  style={{
                    background: color,
                    border:
                      color === '#ffffff'
                        ? '2px solid #e5e7eb'
                        : '2px solid transparent',
                  }}
                  title={color}
                />
              ))}
              <span className="hero-colors-more">+20</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll">
        <div className="hero-scroll-mouse">
          <div className="hero-scroll-wheel" />
        </div>
        <span>Scroll to explore</span>
      </div>
    </section>
  )
}
