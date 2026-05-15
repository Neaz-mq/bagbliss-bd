'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.11,
      delayChildren: 0.05,
    },
  },
}

const textLine = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 72,
      damping: 22,
      mass: 0.9,
    },
  },
}

const cardWrapper = {
  hidden: { opacity: 0, y: 96 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 46,
      damping: 20,
      mass: 1.15,
      delay: 0.22,
    },
  },
}

const imageReveal = {
  hidden: { clipPath: 'inset(100% 0 0 0 round 0px)' },
  visible: {
    clipPath: 'inset(0% 0 0 0 round 0px)',
    transition: {
      duration: 1.25,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.34,
    },
  },
}

const imageKenBurns = {
  hidden: { scale: 1.06 },
  visible: {
    scale: 1,
    transition: {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.34,
    },
  },
}

const popupVariant = {
  hidden: { opacity: 0, y: 10, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 28 },
  },
  exit: {
    opacity: 0,
    y: 6,
    scale: 0.97,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
}

const scrollIndicator = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 0.45,
    transition: { duration: 1.2, delay: 1.3, ease: 'easeOut' },
  },
}

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const [popupOpen, setPopupOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])

  const C    = '#CA865D'
  const CD   = '#b5724a'
  const FONT = "'Poppins', system-ui, sans-serif"

  const ctaButton = (extraStyle: React.CSSProperties = {}) => (
    <Link
      href="/shop"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 9,
        background: C,
        color: '#fff',
        fontFamily: FONT,
        fontSize: '0.76rem',
        fontWeight: 600,
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
        textDecoration: 'none',
        padding: '0.6rem 1.6rem',
        borderRadius: 0,
        transition: 'background 150ms',
        ...extraStyle,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = CD }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C }}
    >
      Explore Collection
      <ArrowRight size={14} strokeWidth={2.5} />
    </Link>
  )

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
      {/* ── Background image ─────────────────────────────────────── */}
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

      {/* ── Gradient overlay ─────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to right, rgba(20,14,8,0.88) 0%, rgba(20,14,8,0.65) 45%, rgba(20,14,8,0.15) 100%)',
        }}
      />

      {/* ── Main content row ─────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2rem',
          boxSizing: 'border-box',
          padding: '7rem clamp(1.5rem, 5vw, 7rem)',
        }}
        className="hero-inner"
      >

        {/* ── Left: Text (staggered children) ──────────────────── */}
        <motion.div
          className="hero-text-col min-w-0 flex-1"
          variants={staggerContainer}
          initial="hidden"
          animate={mounted ? 'visible' : 'hidden'}
        >
          {/* Eyebrow */}
          <motion.p
            variants={textLine}
            style={{
              fontFamily: FONT,
              fontSize: '0.80rem',
              fontWeight: 400,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.90)',
              margin: '0 0 1rem',
            }}
          >
            Discover your perfect everyday bag!
          </motion.p>

          {/* Headline */}
          <div style={{ overflow: 'hidden', marginBottom: '1.2rem' }}>
            <motion.h1
              variants={textLine}
              className="hero-headline"
              style={{
                fontFamily: FONT,
                fontWeight: 600,
                lineHeight: 1.3,
                color: '#fff',
                margin: 0,
                letterSpacing: '0.01em',
              }}
            >
              Carry style,
              <br />
              carry confidence.
            </motion.h1>
          </div>

          {/* CTA button — DESKTOP ONLY */}
          <motion.div variants={textLine} className="hero-btn-desktop">
            {ctaButton()}
          </motion.div>
        </motion.div>

        {/* ── Right: Card + mobile button + scroll indicator ───── */}
        <motion.div
          className="hero-card-wrap"
          style={{ flex: '0 0 auto', width: 'min(420px, 48%)' }}
          variants={cardWrapper}
          initial="hidden"
          animate={mounted ? 'visible' : 'hidden'}
        >
          {/* ── CTA button — MOBILE ONLY (above card image) ── */}
          <div className="hero-btn-mobile" style={{ marginBottom: '1rem' }}>
            {ctaButton({ width: '100%', justifyContent: 'center' })}
          </div>

          {/* ── Outer gray box frame ── */}
          <div style={{
            position: 'relative',
            border: '1px solid rgba(160,160,170,0.35)',
            borderRadius: 0,
            padding: '0.8rem',
            background: 'transparent',
          }}>

            {/* Clip-path curtain */}
            <motion.div
              variants={imageReveal}
              initial="hidden"
              animate={mounted ? 'visible' : 'hidden'}
              style={{
                borderRadius: 0,
                overflow: 'hidden',
                boxShadow: '0 28px 70px rgba(0,0,0,0.5)',
              }}
            >
              <motion.img
                src="https://res.cloudinary.com/dzi3u164c/image/upload/v1778296301/slider_mini_f14602db-1260-4fbd-89a9-3e395ba94f45_bnuhhj.webp"
                alt="Model holding a pink tote bag with blue straps"
                variants={imageKenBurns}
                initial="hidden"
                animate={mounted ? 'visible' : 'hidden'}
                style={{
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                  objectFit: 'cover',
                  transformOrigin: 'center bottom',
                }}
              />
            </motion.div>

            {/* ── Hotspot ── */}
            <div
              style={{
                position: 'absolute',
                left: '35%',
                top: '55%',
                transform: 'translate(-50%, -50%)',
                zIndex: 20,
                width: 42,
                height: 42,
              }}
            >
              {!popupOpen && (
                <>
                  <span className="hotspot-ring hotspot-ring-1" />
                  <span className="hotspot-ring hotspot-ring-2" />
                </>
              )}

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
                      transition={{ duration: 0.18 }}
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
                      transition={{ duration: 0.18 }}
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

              <AnimatePresence>
                {popupOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 30,
                      pointerEvents: 'auto',
                    }}
                  >
                    <motion.div
                      key="popup"
                      variants={popupVariant}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      style={{
                        width: 270,
                        background: '#fff',
                        borderRadius: 0,
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.18)',
                      }}
                    >
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
                            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                          />
                        </div>
                      </Link>

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
                          <span style={{ fontFamily: FONT, fontSize: '0.88rem', fontWeight: 700, color: C }}>
                            ৳2,690
                          </span>
                          <span style={{ fontFamily: FONT, fontSize: '0.78rem', color: '#bbb', textDecoration: 'line-through' }}>
                            ৳5,990
                          </span>
                        </div>
                      </div>

                      <Link
                        href="/shop"
                        aria-label="Go to shop"
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
                  </div>
                )}
              </AnimatePresence>
            </div>
            {/* ── End Hotspot ── */}

          </div>

          {/* ── Scroll indicator — MOBILE ONLY (below card image) ── */}
          <motion.div
            className="scroll-indicator-mobile"
            style={{
              display: 'none', // shown via CSS on mobile
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              marginTop: '1.5rem',
            }}
            variants={scrollIndicator}
            initial="hidden"
            animate={mounted ? 'visible' : 'hidden'}
          >
            <div style={{
              width: 22,
              height: 34,
              border: '1.5px solid rgba(255,255,255,0.4)',
              borderRadius: 99,
              display: 'flex',
              justifyContent: 'center',
              paddingTop: 6,
            }}>
              <div style={{
                width: 3,
                height: 6,
                background: 'rgba(255,255,255,0.6)',
                borderRadius: 99,
                animation: 'heroScrollWheel 1.6s ease infinite',
              }} />
            </div>
            <span style={{
              fontFamily: FONT,
              fontSize: '0.6rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)',
            }}>
              Scroll
            </span>
          </motion.div>

        </motion.div>
        {/* ── End Right Card column ── */}

      </div>

      {/* ── Scroll indicator — DESKTOP ONLY (absolute centered bottom) ── */}
      <motion.div
        className="scroll-indicator-desktop"
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          x: '-50%',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
        }}
        variants={scrollIndicator}
        initial="hidden"
        animate={mounted ? 'visible' : 'hidden'}
      >
        <div style={{
          width: 22,
          height: 34,
          border: '1.5px solid rgba(255,255,255,0.4)',
          borderRadius: 99,
          display: 'flex',
          justifyContent: 'center',
          paddingTop: 6,
        }}>
          <div style={{
            width: 3,
            height: 6,
            background: 'rgba(255,255,255,0.6)',
            borderRadius: 99,
            animation: 'heroScrollWheel 1.6s ease infinite',
          }} />
        </div>
        <span style={{
          fontFamily: FONT,
          fontSize: '0.6rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)',
        }}>
          Scroll
        </span>
      </motion.div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

        /* ── Headline responsive font size ── */
        .hero-headline {
          font-size: clamp(2.4rem, 4.5vw, 4.2rem);
        }

        .hotspot-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(255,255,255,0.42);
          animation: smoothPing 2.4s cubic-bezier(0.2, 0.5, 0.4, 1) infinite;
        }
        .hotspot-ring-2 {
          background: rgba(255,255,255,0.22);
          animation-delay: 0.8s;
        }

        @keyframes smoothPing {
          0%   { transform: scale(1);   opacity: 0.7; }
          75%  { transform: scale(2.3); opacity: 0;   }
          100% { transform: scale(2.3); opacity: 0;   }
        }

        @keyframes heroScrollWheel {
          0%   { opacity: 1;  transform: translateY(0);   }
          80%  { opacity: 0;  transform: translateY(8px); }
          100% { opacity: 0;  transform: translateY(0);   }
        }

        /* ── DESKTOP: hide mobile-only elements ── */
        .hero-btn-mobile {
          display: none;
        }
        .scroll-indicator-mobile {
          display: none !important;
        }
        .scroll-indicator-desktop {
          display: flex !important;
        }

        /* ── MOBILE ── */
        @media (max-width: 1023px) {
          .hero-inner {
            flex-direction: column !important;
            padding: 4rem 1.25rem 3rem !important;
            text-align: center;
            align-items: center !important;
            gap: 1rem !important;
          }

          /* FIX 1: Smaller headline on mobile */
          .hero-headline {
            font-size: clamp(1.6rem, 7vw, 2.4rem) !important;
          }

          .hero-card-wrap {
            width: min(320px, 88%) !important;
          }

          /* FIX 2: Hide desktop CTA button (inside text col) */
          .hero-btn-desktop {
            display: none !important;
          }

          /* FIX 2: Show mobile CTA button (above card image, inside card col) */
          .hero-btn-mobile {
            display: block !important;
          }

          /* FIX 3: Show scroll indicator below card, hide absolute one */
          .scroll-indicator-mobile {
            display: flex !important;
          }
          .scroll-indicator-desktop {
            display: none !important;
          }
        }

        @media (max-width: 480px) {
          .hero-inner {
            padding: 3.5rem 1rem 2.5rem !important;
          }

          /* Even smaller on very small screens */
          .hero-headline {
            font-size: clamp(1.45rem, 8vw, 1.9rem) !important;
          }
        }
      `}</style>
    </section>
  )
}