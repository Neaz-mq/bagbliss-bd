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
  hidden: { opacity: 0, y: 80, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 42,
      damping: 20,
      mass: 1,
      delay: 0.2,
    },
  },
}

const imageReveal = {
  hidden: {
    clipPath: 'inset(100% 0 0 0)',
  },
  visible: {
    clipPath: 'inset(0% 0 0 0)',
    transition: {
      duration: 1.15,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.3,
    },
  },
}

const imageKenBurns = {
  hidden: { scale: 1.08 },
  visible: {
    scale: 1,
    transition: {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.3,
    },
  },
}

const popupVariant = {
  hidden: { opacity: 0, y: 10, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 280,
      damping: 26,
    },
  },
  exit: {
    opacity: 0,
    y: 6,
    scale: 0.97,
    transition: {
      duration: 0.18,
      ease: 'easeIn',
    },
  },
}

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const [popupOpen, setPopupOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])

  const C = '#CA865D'
  const CD = '#b5724a'
  const FONT = "'Poppins', system-ui, sans-serif"

  const ctaButton = (
    extraStyle: React.CSSProperties = {}
  ) => (
    <Link
      href="/shop"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        background: C,
        color: '#fff',
        fontFamily: FONT,
        fontSize: '0.78rem',
        fontWeight: 600,
        letterSpacing: '0.11em',
        textTransform: 'uppercase',
        textDecoration: 'none',
        padding: '0.95rem 1.9rem',
        transition: 'all 220ms ease',
        whiteSpace: 'nowrap',
        ...extraStyle,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.background = CD
        el.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.background = C
        el.style.transform = 'translateY(0px)'
      }}
    >
      Explore Collection
      <ArrowRight size={15} strokeWidth={2.4} />
    </Link>
  )

  return (
    <section className="hero-section">
      <div className="hero-bg" />
      <div className="hero-overlay" />
      <div className="hero-glow" />

      <div className="hero-container">
        {/* LEFT */}
        <motion.div
          className="hero-left"
          variants={staggerContainer}
          initial="hidden"
          animate={mounted ? 'visible' : 'hidden'}
        >
          <motion.p variants={textLine} className="hero-eyebrow">
            Discover your perfect everyday bag!
          </motion.p>

          <div className="hero-title-wrap">
            <motion.h1 variants={textLine} className="hero-title">
              <span>Carry style,</span>
              <span>carry grace.</span>
            </motion.h1>
          </div>

          <motion.p variants={textLine} className="hero-description">
            Timeless everyday essentials crafted to elevate your look with
            effortless sophistication and comfort.
          </motion.p>

          <motion.div variants={textLine} className="hero-btn-desktop">
            {ctaButton()}
          </motion.div>
        </motion.div>

        {/* RIGHT */}
        <motion.div
          className="hero-right"
          variants={cardWrapper}
          initial="hidden"
          animate={mounted ? 'visible' : 'hidden'}
        >
          <div className="hero-btn-mobile">
            {ctaButton({ width: '100%' })}
          </div>

          <div className="hero-card-frame">
            <motion.div
              variants={imageReveal}
              initial="hidden"
              animate={mounted ? 'visible' : 'hidden'}
              className="hero-card-image-wrap"
            >
              <motion.img
                src="https://res.cloudinary.com/dzi3u164c/image/upload/v1778296301/slider_mini_f14602db-1260-4fbd-89a9-3e395ba94f45_bnuhhj.webp"
                alt="Fashion bag"
                variants={imageKenBurns}
                initial="hidden"
                animate={mounted ? 'visible' : 'hidden'}
                className="hero-card-image"
              />
            </motion.div>

            <div className="floating-accent-card">
              <span>Premium Collection</span>
            </div>

            <div className="hotspot-wrap">
              {!popupOpen && (
                <>
                  <span className="hotspot-ring hotspot-ring-1" />
                  <span className="hotspot-ring hotspot-ring-2" />
                </>
              )}

              <button
                aria-label="Quick product view"
                onClick={() => setPopupOpen(v => !v)}
                className="hotspot-btn"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {popupOpen ? (
                    <motion.span
                      key="x"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                    >
                      <X size={16} strokeWidth={2.5} color="#333" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="plus"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#333"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              <AnimatePresence>
                {popupOpen && (
                  <div className="quick-popup-wrap">
                    <motion.div
                      variants={popupVariant}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="quick-popup"
                    >
                      <div className="popup-arrow" />

                      <Link href="/products/backpack-bag" className="popup-thumb">
                        <img
                          src="https://isabel-demo.myshopify.com/cdn/shop/files/p-6-_2.jpg?crop=center&height=620&v=1735018282&width=645"
                          alt="Backpack"
                        />
                      </Link>

                      <div className="popup-content">
                        <Link href="/products/backpack-bag" className="popup-title">
                          Backpack bag
                        </Link>

                        <div className="popup-price-row">
                          <span className="popup-price">৳2,690</span>
                          <span className="popup-old-price">৳5,990</span>
                        </div>
                      </div>

                      <Link href="/shop" className="popup-arrow-btn">
                        <ArrowRight size={14} color="#fff" strokeWidth={2.5} />
                      </Link>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; overflow-x: hidden; }

  .hero-section {
    position: relative;
    width: 100%;
    min-height: calc(100vh - 90px);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: #1a120b;
  }

  .hero-bg {
    position: absolute;
    inset: 0;
    background-image: url('https://res.cloudinary.com/dzi3u164c/image/upload/v1778296243/slider_dnwgz0.webp');
    background-size: cover;
    background-position: center;
    opacity: 0.55;
    transform: scale(1.03);
  }

  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      rgba(20,14,8,0.94) 0%,
      rgba(20,14,8,0.82) 34%,
      rgba(20,14,8,0.45) 65%,
      rgba(20,14,8,0.18) 100%
    );
  }

  .hero-glow {
    position: absolute;
    right: -10%;
    top: 50%;
    transform: translateY(-50%);
    width: 720px;
    height: 720px;
    background: radial-gradient(
      circle,
      rgba(202,134,93,0.16) 0%,
      rgba(202,134,93,0) 70%
    );
    pointer-events: none;
  }

  /* MAIN CONTAINER */
  .hero-container {
    position: relative;
    z-index: 5;
    width: 100%;
    max-width: 1600px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(420px, 560px);
    align-items: center;
    gap: clamp(3rem, 5vw, 7rem);
    padding: clamp(4rem, 6vw, 6rem) clamp(2rem, 5vw, 5rem);
    overflow: visible;
  }

  /* LEFT SIDE */
  .hero-left {
    width: 100%;
    max-width: 760px;
    min-width: 0;
  }

  .hero-eyebrow {
    margin: 0 0 1.2rem;
    font-family: ${FONT};
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.92);
  }

  .hero-title-wrap {
    width: 100%;
    margin-bottom: 1.6rem;
  }

  .hero-title {
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    font-family: ${FONT};
    font-size: clamp(3.4rem, 6vw, 6.4rem);
    font-weight: 700;
    line-height: 0.92;
    letter-spacing: -0.045em;
    color: #fff;
  }

  .hero-title span {
    display: block;
    width: 100%;
  }

  .hero-description {
    max-width: 620px;
    margin: 0 0 2.4rem;
    font-family: ${FONT};
    font-size: clamp(1rem, 1vw, 1.08rem);
    line-height: 1.9;
    font-weight: 400;
    color: rgba(255,255,255,0.75);
  }

  /* RIGHT SIDE */
  .hero-right {
    position: relative;
    width: 100%;
    max-width: 680px;
    min-width: 0;
  }

  .hero-card-frame {
    position: relative;
    width: 100%;
    padding: 1.1rem;
    border: 1px solid rgba(255,255,255,0.14);
    background: rgba(255,255,255,0.03);
    backdrop-filter: blur(5px);
  }

  /* ── desktop image: narrow + tall portrait ── */
  .hero-card-image-wrap {
    overflow: hidden;
    width: 100%;
    aspect-ratio: 5 / 6;
    box-shadow:
      0 30px 80px rgba(0,0,0,0.5),
      0 0 0 1px rgba(255,255,255,0.04);
  }

  .hero-card-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    transform-origin: center bottom;
  }

  .floating-accent-card {
    position: absolute;
    left: -0.8rem;
    bottom: 2rem;
    padding: 1rem 1.25rem;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    backdrop-filter: blur(10px);
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  }

  .floating-accent-card span {
    font-family: ${FONT};
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.92);
  }

  /* HOTSPOT */
  .hotspot-wrap {
    position: absolute;
    left: 34%;
    top: 56%;
    transform: translate(-50%, -50%);
    z-index: 20;
    width: 44px;
    height: 44px;
  }

  .hotspot-ring {
    position: absolute;
    inset: 0;
    border-radius: 999px;
    animation: smoothPing 2.4s cubic-bezier(0.2,0.5,0.4,1) infinite;
  }

  .hotspot-ring-1 { background: rgba(255,255,255,0.4); }
  .hotspot-ring-2 { background: rgba(255,255,255,0.22); animation-delay: 0.8s; }

  .hotspot-btn {
    position: relative;
    z-index: 5;
    width: 44px;
    height: 44px;
    border-radius: 999px;
    border: none;
    background: rgba(255,255,255,0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 18px rgba(0,0,0,0.22);
    transition: all 220ms ease;
  }

  .hotspot-btn:hover {
    transform: scale(1.08);
    background: #fff;
  }

  /* ── POPUP — shared base (desktop & mobile) ── */
  .quick-popup-wrap {
    position: absolute;
    left: 50%;
    top: calc(100% + 18px);
    transform: translateX(-50%);
    z-index: 40;
  }

  .quick-popup {
    position: relative;
    width: 240px;
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    background: #fff;
    box-shadow: 0 18px 60px rgba(0,0,0,0.18);
  }

  .popup-arrow {
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 16px;
    height: 16px;
    background: #fff;
  }

  /* ── thumb: same on all sizes ── */
  .popup-thumb {
    width: 56px;
    height: 56px;
    overflow: hidden;
    flex-shrink: 0;
  }

  .popup-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .popup-content {
    flex: 1;
    min-width: 0;
  }

  .popup-title {
    display: block;
    margin-bottom: 6px;
    text-decoration: none;
    font-family: ${FONT};
    font-size: 0.84rem;
    font-weight: 700;
    color: #1a1a1a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .popup-price-row {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 6px;
  }

  .popup-price {
    font-family: ${FONT};
    font-size: 0.9rem;
    font-weight: 700;
    color: ${C};
  }

  .popup-old-price {
    font-family: ${FONT};
    font-size: 0.78rem;
    text-decoration: line-through;
    color: #bcbcbc;
  }

  .popup-arrow-btn {
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${C};
    text-decoration: none;
    transition: background 200ms ease;
  }

  .popup-arrow-btn:hover { background: ${CD}; }

  @keyframes smoothPing {
    0%   { transform: scale(1);   opacity: 0.7; }
    75%  { transform: scale(2.3); opacity: 0;   }
    100% { transform: scale(2.3); opacity: 0;   }
  }

  .hero-btn-mobile { display: none; }

  /* LARGE SCREEN */
  @media (max-width: 1440px) {
    .hero-container {
      max-width: 1450px;
      grid-template-columns: minmax(0, 1.1fr) minmax(400px, 540px);
    }
  }

  /* LAPTOP */
  @media (max-width: 1200px) {
    .hero-container {
      gap: 3rem;
      grid-template-columns: minmax(0, 1.1fr) minmax(360px, 480px);
    }
    .hero-title { font-size: 5rem; }
  }

  /* TABLET */
  @media (max-width: 1024px) {
    .hero-section { min-height: auto; padding-top: 1rem; }

    .hero-container {
      grid-template-columns: 1fr;
      text-align: center;
      gap: 2.5rem;
      padding: 3rem 1.5rem 3rem;
    }

    .hero-left { max-width: 100%; }

    .hero-title {
      align-items: center;
      font-size: clamp(2.8rem, 8vw, 4.6rem);
      line-height: 0.98;
    }

    .hero-description { margin-left: auto; margin-right: auto; }

    .hero-right {
      width: min(100%, 580px);
      margin: 0 auto;
    }

    .hero-btn-desktop { display: none; }
    .hero-btn-mobile  { display: block; margin-bottom: 1rem; }

    .floating-accent-card { display: none; }

    /* image on tablet: keep portrait ratio */
    .hero-card-image-wrap {
      aspect-ratio: 5 / 6;
      max-height: none;
    }
  }

  /* ═══════════════════════════════════════════
     MOBILE  ≤ 640px
     • margin-top via padding-top
     • Image: category-card style — full container width, side gaps, rounded corners
  ═══════════════════════════════════════════ */
  @media (max-width: 640px) {
    .hero-section {
      align-items: flex-start;
    }

    .hero-container {
      padding: 3rem 1rem 2.2rem;
      gap: 1.8rem;
    }

    .hero-eyebrow {
      font-size: 0.72rem;
      line-height: 1.7;
      margin-bottom: 0.9rem;
    }

    .hero-title {
      font-size: clamp(2.2rem, 11vw, 3.3rem);
      line-height: 0.98;
      letter-spacing: -0.03em;
    }

    .hero-title span { white-space: normal; }

    .hero-description {
      font-size: 0.95rem;
      line-height: 1.75;
      margin-bottom: 1.8rem;
    }

    /* ── RIGHT: full container width, stays within padding ── */
    .hero-right {
      width: 100%;
      margin-left: 0;
      margin-right: 0;
      max-width: none;
    }

    /* ── CTA button ── */
    .hero-btn-mobile {
      display: block;
      margin-bottom: 0.75rem;
    }

    /* ── Card frame: like category card — slight padding, rounded corners ── */
    .hero-card-frame {
      padding: 0;
      border: none;
      background: transparent;
      backdrop-filter: none;
      border-radius: 0;
      overflow: hidden;
    }

    /* ── Image: category-card style — full width of frame, portrait ratio ── */
    .hero-card-image-wrap {
      aspect-ratio: 4 / 5;
      width: 100%;
      max-height: none;
      height: auto;
      overflow: hidden;
      border-radius: 0;
      box-shadow: 0 16px 48px rgba(0,0,0,0.38);
    }

    .hero-card-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center top;
      display: block;
    }

    /* HOTSPOT POSITION */
    .hotspot-wrap {
      left: 50%;
      top: 56%;
      transform: translate(-50%, -50%);
      width: auto;
      height: auto;
    }

    .hotspot-btn {
      width: 50px;
      height: 50px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.16);
      position: relative;
      z-index: 30;
    }

    /* POPUP: open below hotspot */
    .quick-popup-wrap {
      position: absolute;
      left: 50%;
      top: calc(100% + 12px);
      bottom: auto;
      transform: translateX(-50%);
      z-index: 40;
    }

    .popup-arrow {
      top: -8px;
      bottom: auto;
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
    }

    .quick-popup {
      width: 240px;
      max-width: calc(100vw - 32px);
      padding: 12px;
      gap: 10px;
    }

    .popup-thumb {
      width: 56px;
      height: 56px;
      overflow: hidden;
      flex-shrink: 0;
      background: unset;
    }

    .popup-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .popup-title    { font-size: 0.84rem; }
    .popup-price    { font-size: 0.9rem;  }
    .popup-old-price{ font-size: 0.78rem; }

    .popup-arrow-btn {
      width: 38px;
      height: 38px;
    }
  }

  /* SMALL MOBILE ≤ 420px */
  @media (max-width: 420px) {
    .hero-container {
      padding: 2.5rem 0.85rem 2rem;
    }

    .hero-right {
      width: 100%;
      margin-left: 0;
      margin-right: 0;
    }

    .hero-title { font-size: 1.95rem; }
    .hero-description { font-size: 0.92rem; }

    .hotspot-wrap { top: 55%; }

    .hotspot-btn {
      width: 48px;
      height: 48px;
    }

    .quick-popup {
      width: 230px;
      max-width: calc(100vw - 24px);
      padding: 10px 12px;
      gap: 8px;
    }
  }
`}</style>
    </section>
  )
}