'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  Facebook,
  Instagram,
  Youtube,
  ArrowUp,
  ChevronDown,
} from 'lucide-react'
import { ROUTES } from '@/constants'

const ACCOUNT_LINKS = [
  { label: 'My Cart', href: ROUTES.cart },
  { label: 'Track Order', href: ROUTES.trackOrder },
  { label: 'My Account', href: ROUTES.account },
  { label: 'Wishlist', href: ROUTES.wishlist },
  { label: 'My Orders', href: ROUTES.orders },
]

const PRODUCT_LINKS = [
  { label: 'All Bags', href: ROUTES.shop },
  { label: 'Mini Crossbody', href: '/shop?category=mini-crossbody' },
  { label: 'Chain Strap', href: '/shop?category=chain-strap' },
  { label: 'Leather Bags', href: '/shop?category=leather' },
  { label: 'New Arrivals', href: '/shop?sort=newest' },
]

const COMPANY_LINKS = [
  { label: 'About Us', href: '/about' },
  { label: 'Return Policy', href: '/returns' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Payment Policy', href: '/payment-policy' },
  { label: 'Terms & Condition', href: '/terms' },
]

function SocialLink({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: React.ElementType
  label: string
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="footer-social-btn"
    >
      <Icon size={16} />
    </Link>
  )
}

/**
 * Desktop: static column, always expanded, header not clickable.
 * Mobile (<640px): tap-to-expand accordion.
 *
 * The collapsible area is a single grid child (.footer-links-wrap >
 * .footer-links-inner) so the 0fr -> 1fr transition animates cleanly
 * with no leftover "auto" rows overlapping other items.
 */
function FooterColumn({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string }[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="footer-column">
      <button
        type="button"
        className="footer-column-title"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {title}
        <ChevronDown
          size={16}
          className={`footer-column-chevron ${open ? 'is-open' : ''}`}
        />
      </button>

      <div className={`footer-links-wrap ${open ? 'is-open' : ''}`}>
        <div className="footer-links-inner">
          <ul className="footer-links-list">
            {links.map((link, index) => (
              <li key={`${link.href}-${index}`}>
                <Link href={link.href} className="footer-link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <style jsx global>{`
        /*
          --mobile-nav-h is set dynamically at runtime by the BottomNav
          component (see separate snippet) via a ResizeObserver, so it
          always matches the nav's real rendered height on that device.
          The 84px here is only a fallback for the brief moment before
          that JS runs (first paint / hydration).

          --floating-widget-w is a safe-zone reserved for fixed-position
          floating UI (chat bubble bottom-right, notification/support
          icon bottom-left) that sits ON TOP of the page and is NOT part
          of this component. It exists at every viewport width, so the
          bottom bar must reserve space for it everywhere, not only
          inside the mobile media query.
        */
        :root {
          --mobile-nav-h: 84px;
          --floating-widget-w: 64px;
        }

        .footer {
          background: #fafaf8;
          font-family: 'Poppins', sans-serif;
          width: 100%;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .footer-main {
          background: #fafaf8;
          width: 100%;
          padding: 56px 0 32px;
          display: flex;
          justify-content: center;
        }

        .container-bagbliss {
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 clamp(1.5rem, 4vw, 4rem);
          box-sizing: border-box;
        }

        .footer-grid-wrap {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1fr;
          gap: 32px;
          flex: 1;
          min-width: 0;
        }

        .footer-brand-column {
          text-align: left;
        }

        .footer-logo {
          display: inline-flex;
          align-items: center;
          justify-content: flex-start;
          gap: 12px;
          font-size: 1.6rem;
          font-weight: 700;
          color: #17172f;
          text-decoration: none;
          letter-spacing: -0.02em;
          margin-bottom: 18px;
          line-height: 1;
        }

        .footer-logo svg {
          color: #d08a60;
          display: block;
          flex-shrink: 0;
        }
        .footer-logo span {
          display: flex;
          align-items: center;
          line-height: 1;
        }

        .footer-grid-wrap {
          border-bottom: none !important;
          box-shadow: none !important;
        }

        .footer-brand-desc {
          font-size: 0.88rem;
          color: #8a8a8a;
          line-height: 1.7;
          margin: 0 0 22px;
          max-width: 320px;
          text-align: left;
        }

        .footer-social {
          display: flex;
          justify-content: flex-start;
          gap: 10px;
        }

        .footer-social-btn {
          width: 36px;
          height: 36px;
          border-radius: 999px;
          border: 1px solid #e3ddd5;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d08a60;
          background: transparent;
          transition: all 0.25s ease;
          flex-shrink: 0;
        }

        .footer-social-btn:hover {
          background: #d08a60;
          color: #ffffff;
          border-color: #d08a60;
          transform: translateY(-2px);
        }

        .footer-column-title {
          all: unset;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          margin: 0 0 18px;
          font-size: 1rem;
          font-weight: 600;
          color: #17172f;
          text-align: left;
          font-family: inherit;
          cursor: default;
          box-sizing: border-box;
        }

        .footer-column-chevron {
          display: none;
        }

        /* Desktop: always fully visible, no clipping/animation */
        .footer-links-wrap {
          display: block;
        }

        .footer-links-inner {
          overflow: visible;
        }

        .footer-links-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: left;
        }

        .footer-link {
          font-size: 0.88rem;
          color: #8a8a8a;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .footer-link:hover {
          color: #d08a60;
        }

        .footer-back-to-top {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          background: #d08a60;
          border: none;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s ease;
          flex-shrink: 0;
        }

        .footer-back-to-top:hover {
          background: #b9744c;
        }

        .footer-bottom {
          background: #fafaf8;
          width: 100%;
          display: flex;
          justify-content: center;
        }

        /*
          FIX: padding-left added here (was previously only present on
          the right, and only inside the mobile media query). Floating
          widgets sit at fixed positions on BOTH sides of the viewport
          at EVERY width, so both sides need a permanent safe zone —
          not just below 640px. This is what was overlapping the
          copyright text and the "Terms & condition" link on tablet /
          in-between widths (e.g. 996px, 627px) where neither the
          1024px nor 640px breakpoint fully protected the bar.
        */
        .footer-bottom-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          padding-top: 20px;
          padding-bottom: 20px;
          padding-left: var(--floating-widget-w);
          padding-right: 90px;
          box-sizing: border-box;
          width: 100%;
        }

        .footer-copyright {
          margin: 0;
          font-size: 0.82rem;
          color: #17172f;
          text-align: left;
        }

        .footer-bottom-links {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          font-size: 0.82rem;
          color: #17172f;
        }

        .footer-bottom-links a {
          color: #17172f;
          text-decoration: none;
        }

        .footer-bottom-links a:hover {
          color: #d08a60;
        }

        .footer-bottom-sep {
          color: #c9c4bc;
        }

        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: repeat(3, 1fr);
            row-gap: 36px;
            column-gap: 24px;
          }
          .footer-brand-column {
            grid-column: 1 / -1;
          }
          .footer-brand-desc {
            max-width: 480px;
          }
        }

        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
          }
          .footer-column:last-child {
            border-bottom: none;
          }
        }

        /* ---------- MOBILE ---------- */
        @media (max-width: 640px) {
          .footer-main {
            padding: 40px 0 0;
          }
          .footer-column:last-child {
            border-bottom: none;
          }

          .container-bagbliss {
            padding: 0 1.5rem;
          }

          .footer-grid-wrap {
            flex-direction: column;
            align-items: stretch;
            gap: 0;
          }

          .footer-grid {
            grid-template-columns: 1fr;
            row-gap: 0;
            text-align: left;
          }

          .footer-brand-column,
          .footer-logo,
          .footer-brand-desc,
          .footer-social,
          .footer-links-list {
            text-align: left;
            justify-content: flex-start;
            align-items: flex-start;
          }

          .footer-brand-desc {
            max-width: 100%;
          }

          .footer-brand-column {
            padding-bottom: 28px;
            margin-bottom: 8px;
            border-bottom: 1px solid #e6e2db;
          }

          .footer-column {
            border-bottom: 1px solid #e6e2db;
          }

          .footer-column-title {
            cursor: pointer;
            padding: 18px 2px;
          }

          .footer-column-chevron {
            display: block;
            color: #d08a60;
            transition: transform 0.25s ease;
            flex-shrink: 0;
          }

          .footer-column-chevron.is-open {
            transform: rotate(180deg);
          }

          /* Single grid child animates cleanly — no overlap */
          .footer-links-wrap {
            display: grid;
            grid-template-rows: 0fr;
            transition: grid-template-rows 0.25s ease;
          }

          .footer-links-wrap.is-open {
            grid-template-rows: 1fr;
          }

          .footer-links-inner {
            overflow: hidden;
          }

          .footer-links-list {
            padding: 2px 2px 20px;
            gap: 14px;
          }

          .footer-back-to-top {
            align-self: flex-end;
            margin-top: 16px;
            margin-right: 72px;
            margin-bottom: 18px;
          }

          /* Border removed on mobile — avoids a double-line look right
             under the last accordion row's own divider */
          .footer-bottom {
            display: none;
          }

          /*
            FIX: kept left/right safe padding on mobile too (previously
            padding-right was reset to 0 here, which is exactly why the
            chat bubble started covering "Terms & condition" once the
            column layout kicked in). Both sides now stay protected.
          */
          .footer-bottom-inner {
            flex-direction: column;
            align-items: flex-start;
            padding-top: 18px;
            padding-bottom: calc(
              var(--mobile-nav-h) + env(safe-area-inset-bottom, 0px) + 20px
            );
            padding-left: var(--floating-widget-w);
            padding-right: var(--floating-widget-w);
            text-align: left;
            gap: 10px;
          }

          .footer-copyright,
          .footer-bottom-links {
            text-align: left;
          }
        }

        @media (max-width: 420px) {
          .container-bagbliss {
            padding: 0 0.85rem;
          }
        }
      `}</style>

      <footer className="footer">
        <div className="footer-main">
          <div className="container-bagbliss">
            <div className="footer-grid-wrap">
              <div className="footer-grid">
                {/* Brand Column */}
                <div className="footer-brand-column">
                  <Link href="/" className="footer-logo">
                    <ShoppingBag size={26} strokeWidth={1.5} />
                    <span>BagBliss BD</span>
                  </Link>

                  <p className="footer-brand-desc">
                    Bangladesh&apos;s most trendy mini crossbody bag store.
                    Premium imported bags at prices you&apos;ll love.
                  </p>

                  <div className="footer-social">
                    <SocialLink
                      href="https://facebook.com"
                      icon={Facebook}
                      label="Facebook"
                    />
                    <SocialLink
                      href="https://instagram.com"
                      icon={Instagram}
                      label="Instagram"
                    />
                    <SocialLink
                      href="https://youtube.com"
                      icon={Youtube}
                      label="YouTube"
                    />
                  </div>
                </div>

                <FooterColumn title="My Account" links={ACCOUNT_LINKS} />
                <FooterColumn title="Product" links={PRODUCT_LINKS} />
                <FooterColumn title="Our Company" links={COMPANY_LINKS} />
              </div>

              <button
                type="button"
                className="footer-back-to-top"
                onClick={scrollToTop}
                aria-label="Scroll to top"
              >
                <ArrowUp size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="container-bagbliss footer-bottom-inner">
            <p className="footer-copyright" suppressHydrationWarning>
              &copy; {currentYear} BagBliss BD. All rights reserved.
            </p>
            <p className="footer-bottom-links">
              <Link href="/payment-policy">Payment policy</Link>
              <span className="footer-bottom-sep">|</span>
              <Link href="/terms">Terms &amp; condition</Link>
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
