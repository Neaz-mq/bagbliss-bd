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

  return <span>{count}{suffix}</span>
}

// ── Hero Section ──────────────────────────────
export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const FONT     = 'Nunito, system-ui, sans-serif'
  const SERIF    = '"Cormorant Garamond", Georgia, serif'
  const C        = '#CA865D'
  const CD       = '#b5724a'

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'min(90vh, 720px)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: '#1a120b',
      }}
    >
      {/* ── Background image ────────────────────── */}
      {/* Replace the src below with your real hero image */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url('/images/hero-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          opacity: 0.55,
          transition: 'opacity 1.2s ease',
        }}
      />

      {/* ── Gradient overlay (left darkens, right fades) ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to right, rgba(20,14,8,0.88) 0%, rgba(20,14,8,0.60) 45%, rgba(20,14,8,0.15) 100%)',
        }}
      />

      {/* ── Content container ─────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          padding: '5rem 3rem',
        }}
      >
        <div
          style={{
            maxWidth: 580,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              background: 'rgba(202,134,93,0.15)',
              border: '1px solid rgba(202,134,93,0.35)',
              color: C,
              fontFamily: FONT,
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              padding: '5px 14px',
              borderRadius: 99,
              marginBottom: '1.5rem',
            }}
          >
            <Star size={10} fill={C} color={C} />
            New Collection 2026
            <Star size={10} fill={C} color={C} />
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: SERIF,
              fontSize: 'clamp(2.6rem, 5vw, 4.2rem)',
              fontWeight: 400,
              lineHeight: 1.12,
              color: '#fff',
              margin: '0 0 1.25rem',
              letterSpacing: '-0.01em',
            }}
          >
            Carry Your{' '}
            <em style={{ color: C, fontStyle: 'italic' }}>Style</em>
            <br />
            Everywhere
            <span style={{ color: C }}>.</span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: FONT,
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.62)',
              margin: '0 0 2.25rem',
              maxWidth: 400,
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 0.9s ease 0.18s, transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.18s',
            }}
          >
            Discover Bangladesh&apos;s most trendy mini crossbody bags.
            Premium imported styles at prices you&apos;ll love.
          </p>

          {/* CTA Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              flexWrap: 'wrap',
              marginBottom: '2.5rem',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 0.9s ease 0.32s, transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.32s',
            }}
          >
            <Link
              href="/shop"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: C,
                color: '#fff',
                fontFamily: FONT,
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                padding: '0.85rem 2rem',
                borderRadius: 2,
                transition: 'background 150ms',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = CD }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C }}
            >
              <ShoppingBag size={15} strokeWidth={2} />
              Shop Now
              <ArrowRight size={14} strokeWidth={2.5} />
            </Link>

            <Link
              href="/shop?sort=newest"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
                color: '#fff',
                fontFamily: FONT,
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                padding: '0.85rem 2rem',
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.35)',
                transition: 'border-color 150ms, color 150ms',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'rgba(255,255,255,0.7)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'rgba(255,255,255,0.35)'
              }}
            >
              New Arrivals
            </Link>
          </div>

          {/* Trust + Stats */}
          <div
            style={{
              opacity: isVisible ? 1 : 0,
              transition: 'opacity 0.9s ease 0.48s',
            }}
          >
            {/* Trust row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                marginBottom: '1.75rem',
                flexWrap: 'wrap',
              }}
            >
              {[
                { icon: <Truck size={14} strokeWidth={2} />, text: 'Free delivery over ৳1500' },
                { icon: <Shield size={14} strokeWidth={2} />, text: 'Secure payment' },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    fontFamily: FONT,
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.5)',
                    letterSpacing: '0.04em',
                  }}
                >
                  <span style={{ color: C }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 0,
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {[
                { end: 500, suffix: '+', label: 'Bag Styles' },
                { end: 2000, suffix: '+', label: 'Happy Customers' },
                { end: 4, suffix: '.9★', label: 'Avg Rating' },
              ].map((stat, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    textAlign: i === 0 ? 'left' : 'center',
                    paddingRight: i < 2 ? '1rem' : 0,
                    borderRight: i < 2 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    paddingLeft: i > 0 ? '1rem' : 0,
                  }}
                >
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontSize: '1.6rem',
                      fontWeight: 600,
                      color: '#fff',
                      lineHeight: 1.1,
                      marginBottom: 3,
                    }}
                  >
                    <Counter end={stat.end} suffix={stat.suffix} />
                  </div>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ─────────────────────── */}
      <div
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          opacity: isVisible ? 0.5 : 0,
          transition: 'opacity 1s ease 1s',
        }}
      >
        <div
          style={{
            width: 22,
            height: 34,
            border: '1.5px solid rgba(255,255,255,0.4)',
            borderRadius: 99,
            display: 'flex',
            justifyContent: 'center',
            paddingTop: 6,
          }}
        >
          <div
            style={{
              width: 3,
              height: 6,
              background: 'rgba(255,255,255,0.6)',
              borderRadius: 99,
              animation: 'heroScrollWheel 1.6s ease infinite',
            }}
          />
        </div>
        <span
          style={{
            fontFamily: FONT,
            fontSize: '0.6rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          Scroll
        </span>
      </div>

      <style>{`
        @keyframes heroScrollWheel {
          0%   { opacity: 1; transform: translateY(0); }
          80%  { opacity: 0; transform: translateY(8px); }
          100% { opacity: 0; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .hero-content-inner { padding: 4rem 1.25rem !important; }
        }
      `}</style>
    </section>
  )
}