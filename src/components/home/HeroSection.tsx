'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [popupOpen, setPopupOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const C    = '#CA865D'
  const CD   = '#b5724a'
  const FONT  = 'Nunito, system-ui, sans-serif'
  const SERIF = '"Cormorant Garamond", Georgia, serif'

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'min(90vh, 680px)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: '#1a120b',
      }}
    >
      {/* ── Background image ─────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url('https://res.cloudinary.com/dzi3u164c/image/upload/v1778296243/slider_dnwgz0.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          opacity: 0.55,
        }}
      />

      {/* ── Gradient overlay ─────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to right, rgba(20,14,8,0.88) 0%, rgba(20,14,8,0.65) 45%, rgba(20,14,8,0.15) 100%)',
        }}
      />

      {/* ── Main content row ─────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '5rem 4rem',
          gap: '2rem',
          boxSizing: 'border-box',
        }}
        className="hero-inner"
      >
        {/* ── Left: Text ────────────────────────── */}
        <div
          style={{
            flex: '1 1 0',
            minWidth: 0,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(28px)',
            transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <p
            style={{
              fontFamily: FONT,
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.58)',
              margin: '0 0 1rem',
            }}
          >
            The best kind of surprise party!
          </p>

          <h1
            style={{
              fontFamily: SERIF,
              fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)',
              fontWeight: 600,
              lineHeight: 1.1,
              color: '#fff',
              margin: '0 0 2rem',
              letterSpacing: '-0.01em',
            }}
          >
            Sophistication
            <br />
            in every stitch.
          </h1>

          <Link
            href="/shop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 9,
              background: C,
              color: '#fff',
              fontFamily: FONT,
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              padding: '0.85rem 2rem',
              borderRadius: 2,
              transition: 'background 150ms',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = CD }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C }}
          >
            Shop Now
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </div>

        {/* ── Right: Card column ────────────────── */}
        <div
          style={{
            flex: '0 0 auto',
            width: 'min(360px, 44%)',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(32px)',
            transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s, transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s',
            // Extra bottom padding so popup card has room to overflow below
            paddingBottom: popupOpen ? '100px' : '0px',
            transition2: 'padding-bottom 0.25s ease',
          }}
          className="hero-card-wrap"
        >
          {/*
            Outer wrapper: overflow visible so popup spills outside the image.
            The image itself is clipped inside its own div.
          */}
          <div style={{ position: 'relative', overflow: 'visible' }}>

            {/* Product image — clipped to rounded corners */}
            <div style={{
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 28px 70px rgba(0,0,0,0.5)',
            }}>
              <img
                src="https://res.cloudinary.com/dzi3u164c/image/upload/v1778296301/slider_mini_f14602db-1260-4fbd-89a9-3e395ba94f45_bnuhhj.webp"
                alt="Model holding a pink tote bag with blue straps"
                style={{ display: 'block', width: '100%', height: 'auto', objectFit: 'cover' }}
              />
            </div>

            {/* ── Hotspot ──────────────────────────
                Positioned at 35% from left, 55% from top.
                The popup is rendered as sibling BELOW the button,
                overflowing outside the image naturally.
            */}
            <div
              style={{
                position: 'absolute',
                left: '35%',
                top: '55%',
                // Center the 42px button on this anchor point
                transform: 'translate(-50%, -50%)',
                zIndex: 20,
                width: 42,
                height: 42,
              }}
            >
              {/* Smooth pulse rings — hidden when open */}
              {!popupOpen && (
                <>
                  <span className="hotspot-ring hotspot-ring-1" />
                  <span className="hotspot-ring hotspot-ring-2" />
                </>
              )}

              {/* Button */}
              <button
                aria-label={popupOpen ? 'Close quick view' : 'Quick view product'}
                onClick={() => setPopupOpen(v => !v)}
                style={{
                  position: 'relative',
                  zIndex: 2,
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.93)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 14px rgba(0,0,0,0.2)',
                  transition: 'background 150ms, transform 200ms',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = '#fff'
                  el.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'rgba(255,255,255,0.93)'
                  el.style.transform = 'scale(1)'
                }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {popupOpen ? (
                    <motion.span
                      key="x"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={16} strokeWidth={2.5} color="#333" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="plus"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* ── Popup card ──────────────────────
                  top: calc(100% + 8px) = directly below the 42px button.
                  left: 50% + translateX(-50%) = centered on the button.
                  Width wider than button so it spills left/right evenly.
              */}
              <AnimatePresence>
                {popupOpen && (
                  <motion.div
                    key="popup"
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.97 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      position: 'absolute',
                      // Sits directly below the button
                      top: 'calc(100% + 8px)',
                      // Centered on the button anchor
                      left: '50%',
                      transform: 'translateX(-50%)',
                      // Wide card — spills outside the button width
                      width: 270,
                      background: '#fff',
                      borderRadius: 12,
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      boxShadow: '0 10px 40px rgba(0,0,0,0.18)',
                      zIndex: 30,
                      // Allow it to overflow the parent image div
                      pointerEvents: 'auto',
                    }}
                  >
                    {/* Caret pointing UP to the button */}
                    <div style={{
                      position: 'absolute',
                      top: -9,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '9px solid transparent',
                      borderRight: '9px solid transparent',
                      borderBottom: '9px solid #fff',
                      filter: 'drop-shadow(0 -2px 2px rgba(0,0,0,0.06))',
                    }} />

                    {/* Thumbnail */}
                    <Link href="/products/backpack-bag" style={{ flexShrink: 0, display: 'block' }}>
                      <div style={{
                        width: 54,
                        height: 54,
                        borderRadius: 10,
                        overflow: 'hidden',
                        background: '#fdf0e8',
                      }}>
                        <img
                          src="https://isabel-demo.myshopify.com/cdn/shop/files/p-6-_2.jpg?crop=center&height=620&v=1735018282&width=645"
                          alt="Backpack bag"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center top',
                          }}
                        />
                      </div>
                    </Link>

                    {/* Product info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link
                        href="/products/backpack-bag"
                        style={{
                          display: 'block',
                          fontFamily: FONT,
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: '#1a1a1a',
                          textDecoration: 'none',
                          marginBottom: 5,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        Backpack bag
                      </Link>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ fontFamily: FONT, fontSize: '0.88rem', fontWeight: 800, color: C }}>
                          ৳2,690
                        </span>
                        <span style={{ fontFamily: FONT, fontSize: '0.78rem', color: '#bbb', textDecoration: 'line-through' }}>
                          ৳5,990
                        </span>
                      </div>
                    </div>

                    {/* Arrow CTA */}
                    <Link
                      href="/products/backpack-bag"
                      aria-label="View product"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: C,
                        flexShrink: 0,
                        textDecoration: 'none',
                        transition: 'background 150ms',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = CD }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C }}
                    >
                      <ArrowRight size={14} color="#fff" strokeWidth={2.5} />
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* ── End Hotspot ── */}

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
          opacity: isVisible ? 0.45 : 0,
          transition: 'opacity 1s ease 1.1s',
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
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800&family=Cormorant+Garamond:wght@400;500;600&display=swap');

        /* ── Smooth hotspot ping rings ── */
        .hotspot-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.45);
          animation: smoothPing 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
        }
        .hotspot-ring-2 {
          background: rgba(255, 255, 255, 0.25);
          animation-delay: 0.7s;
        }

        @keyframes smoothPing {
          0%   { transform: scale(1);   opacity: 0.7; }
          70%  { transform: scale(2.2); opacity: 0;   }
          100% { transform: scale(2.2); opacity: 0;   }
        }

        @keyframes heroScrollWheel {
          0%   { opacity: 1; transform: translateY(0); }
          80%  { opacity: 0; transform: translateY(8px); }
          100% { opacity: 0; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .hero-inner {
            flex-direction: column-reverse !important;
            padding: 3rem 1.5rem !important;
            text-align: center;
          }
          .hero-card-wrap {
            width: min(300px, 80%) !important;
          }
        }

        @media (max-width: 480px) {
          .hero-inner {
            padding: 2.5rem 1.25rem !important;
          }
        }
      `}</style>
    </section>
  )
}