'use client'

import Link from 'next/link'
import {
  ShoppingBag, Facebook, Instagram, Youtube, ArrowUp,
} from 'lucide-react'
import { ROUTES } from '@/constants'

const ACCOUNT_LINKS = [
  { label: 'My Cart',     href: ROUTES.cart },
  { label: 'Track Order', href: ROUTES.trackOrder },
  { label: 'My Account',  href: ROUTES.account },
  { label: 'Wishlist',    href: ROUTES.wishlist },
  { label: 'My Orders',   href: ROUTES.orders },
]

const PRODUCT_LINKS = [
  { label: 'All Bags',       href: ROUTES.shop },
  { label: 'Mini Crossbody', href: '/shop?category=mini-crossbody' },
  { label: 'Chain Strap',    href: '/shop?category=chain-strap' },
  { label: 'Leather Bags',   href: '/shop?category=leather' },
  { label: 'New Arrivals',   href: '/shop?sort=newest' },
]

const COMPANY_LINKS = [
  { label: 'About Us',         href: '/about' },
  { label: 'Return Policy',    href: '/returns' },
  { label: 'Privacy Policy',   href: '/privacy' },
  { label: 'Payment Policy',   href: '/payment-policy' },
  { label: 'Terms & Condition',href: '/terms' },
]

function SocialLink({
  href, icon: Icon, label,
}: {
  href: string; icon: React.ElementType; label: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="footer-social-btn"
    >
      <Icon size={16} />
    </a>
  )
}

function FooterColumn({
  title, links,
}: {
  title: string
  links: { label: string; href: string }[]
}) {
  return (
    <div className="footer-column">
      <h4 className="footer-column-title">{title}</h4>
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
        .footer {
          background: #ffffff;
          border-top: 1px solid #ece9e4;
          font-family: 'Poppins', sans-serif;
        }

        .footer-main {
          padding: 56px 0 40px;
        }

        .container-bagbliss {
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 clamp(4.6rem, 4vw, 4rem);
          box-sizing: border-box;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1fr;
          gap: 32px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.6rem;
          font-weight: 700;
          color: #17172f;
          text-decoration: none;
          letter-spacing: -0.02em;
          margin-bottom: 18px;
        }

        .footer-logo svg { color: #d08a60; }

        .footer-brand-desc {
          font-size: 0.88rem;
          color: #8a8a8a;
          line-height: 1.7;
          margin: 0 0 22px;
          max-width: 320px;
        }

        .footer-social {
          display: flex;
          gap: 10px;
          margin-bottom: 26px;
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
          transition: all 0.25s ease;
        }

        .footer-social-btn:hover {
          background: #d08a60;
          color: #ffffff;
          border-color: #d08a60;
        }

        .footer-column-title {
          margin: 0 0 18px;
          font-size: 1rem;
          font-weight: 600;
          color: #17172f;
        }

        .footer-links-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-link {
          font-size: 0.88rem;
          color: #8a8a8a;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .footer-link:hover { color: #d08a60; }

        .footer-back-to-top {
          position: absolute;
          right: clamp(1.5rem, 4vw, 4rem);
          bottom: -20px;
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
        }

        .footer-back-to-top:hover { background: #b9744c; }

        .footer-grid-wrap {
          position: relative;
        }

        .footer-bottom {
          border-top: 1px solid #ece9e4;
        }

        .footer-bottom-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          padding: 20px clamp(4.6rem, 4vw, 4rem);
        }

        .footer-copyright {
          margin: 0;
          font-size: 0.82rem;
          color: #8a8a8a;
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

        .footer-bottom-links a:hover { color: #d08a60; }

        .footer-bottom-sep { color: #c9c4bc; }

        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            row-gap: 36px;
          }
          .container-bagbliss { padding: 0 1.5rem; }
        }

        @media (max-width: 640px) {
          .footer-main { padding: 40px 0 56px; }
          .footer-grid { grid-template-columns: 1fr; row-gap: 30px; }
          .footer-bottom-inner {
            flex-direction: column;
            align-items: flex-start;
            padding: 18px 1rem;
          }
          .footer-back-to-top { bottom: 12px; right: 1rem; }
        }
      `}</style>

      <footer className="footer">
        <div className="footer-main">
          <div className="container-bagbliss footer-grid-wrap">
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
                  <SocialLink href="https://facebook.com"  icon={Facebook}  label="Facebook"  />
                  <SocialLink href="https://instagram.com" icon={Instagram} label="Instagram" />
                  <SocialLink href="https://youtube.com"   icon={Youtube}   label="YouTube"   />
                </div>
              </div>

              <FooterColumn title="My Account" links={ACCOUNT_LINKS} />
              <FooterColumn title="Product"    links={PRODUCT_LINKS} />
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