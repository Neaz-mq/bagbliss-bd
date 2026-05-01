'use client'

import Link from 'next/link'
import {
  ShoppingBag, MapPin, Phone, Mail,
  Facebook, Instagram, Youtube, ArrowRight,
} from 'lucide-react'
import { ROUTES } from '@/constants'

/**
 * ── Footer Links Data ─────────────────────────────────────────────────────
 * Separating data from JSX makes the component cleaner and easier to update.
 */

const SHOP_LINKS = [
  { label: 'All Bags',       href: ROUTES.shop },
  { label: 'Mini Crossbody', href: '/shop?category=mini-crossbody' },
  { label: 'Chain Strap',    href: '/shop?category=chain-strap' },
  { label: 'Leather Bags',   href: '/shop?category=leather' },
  { label: 'Flash Sale ⚡',  href: '/shop?filter=flash-sale' },
  { label: 'New Arrivals',   href: '/shop?sort=newest' },
]

const ACCOUNT_LINKS = [
  { label: 'My Account', href: ROUTES.account },
  { label: 'My Orders',  href: ROUTES.orders },
  { label: 'Track Order',href: ROUTES.trackOrder },
  { label: 'Wishlist',   href: ROUTES.wishlist },
  { label: 'Login',      href: ROUTES.login },
  { label: 'Register',   href: ROUTES.register },
]

const HELP_LINKS = [
  { label: 'FAQ',               href: '/faq' },
  { label: 'Shipping Policy',   href: '/shipping' },
  { label: 'Return Policy',     href: '/returns' },
  { label: 'Privacy Policy',    href: '/privacy' },
  { label: 'Terms of Service',  href: '/terms' },
  { label: 'Contact Us',        href: '/contact' },
]

/**
 * ── Sub-components ────────────────────────────────────────────────────────
 */

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
      <Icon size={18} />
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
              <ArrowRight size={12} />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * ── Main Footer ───────────────────────────────────────────────────────────
 */

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">

      {/* Top Decorative Wave */}
      <div className="footer-wave">
        <svg
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          className="footer-wave-svg"
        >
          <path
            d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z"
            fill="#1A1A2E"
          />
        </svg>
      </div>

      <div className="footer-main">
        <div className="container-bagbliss">
          <div className="footer-grid">

            {/* Brand & Info Column */}
            <div className="footer-brand-column">
              <Link href="/" className="footer-logo">
                <ShoppingBag size={24} strokeWidth={1.5} />
                <span>BagBliss BD</span>
              </Link>

              <p className="footer-brand-desc">
                Bangladesh&apos;s most trendy mini crossbody bag store.
                Premium imported bags at prices you&apos;ll love.
                Fast delivery across all 64 districts.
              </p>

              {/* Contact Details */}
              <div className="footer-contact">
                <div className="footer-contact-item">
                  <MapPin size={15} />
                  <span>Dhaka, Bangladesh</span>
                </div>
                <div className="footer-contact-item">
                  <Phone size={15} />
                  <a href="tel:+8801XXXXXXXXX" className="footer-contact-link">
                    +880 1XXX-XXXXXX
                  </a>
                </div>
                <div className="footer-contact-item">
                  <Mail size={15} />
                  <a
                    href="mailto:neazmorshed666@gmail.com"
                    className="footer-contact-link"
                  >
                    neazmorshed666@gmail.com
                  </a>
                </div>
              </div>

              {/* Social Icons */}
              <div className="footer-social">
                <SocialLink href="https://facebook.com"  icon={Facebook}  label="Facebook"  />
                <SocialLink href="https://instagram.com" icon={Instagram} label="Instagram" />
                <SocialLink href="https://youtube.com"   icon={Youtube}   label="YouTube"   />
              </div>
            </div>

            {/* Navigation Columns */}
            <FooterColumn title="Shop"       links={SHOP_LINKS}    />
            <FooterColumn title="My Account" links={ACCOUNT_LINKS} />
            <FooterColumn title="Help & Info"links={HELP_LINKS}    />
          </div>

          {/* Newsletter Section */}
          <div className="footer-newsletter">
            <div className="footer-newsletter-left">
              <h3 className="footer-newsletter-title">
                Get Exclusive Deals &amp; New Arrivals 🎁
              </h3>
              <p className="footer-newsletter-subtitle">
                Join 5,000+ shoppers. Get 10% off your first order!
              </p>
            </div>
            <form
              className="footer-newsletter-form"
              onSubmit={e => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email address"
                className="footer-newsletter-input"
                suppressHydrationWarning
              />
              <button
                type="submit"
                className="footer-newsletter-btn"
                suppressHydrationWarning
              >
                Subscribe
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

          {/* Payment Badges */}
          <div className="footer-payment">
            <span className="footer-payment-label">We Accept:</span>
            <div className="footer-payment-methods">
              <div className="footer-payment-badge footer-payment-bkash">bKash</div>
              <div className="footer-payment-badge footer-payment-nagad">Nagad</div>
              <div className="footer-payment-badge footer-payment-rocket">Rocket</div>
              <div className="footer-payment-badge footer-payment-visa">VISA</div>
              <div className="footer-payment-badge footer-payment-mc">MC</div>
              <div className="footer-payment-badge footer-payment-cod">Cash on Delivery</div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="footer-bottom">
        <div className="container-bagbliss footer-bottom-inner">
          <p className="footer-copyright">
            &copy; {currentYear} BagBliss BD. All rights reserved.
          </p>
          <p className="footer-made-with">
            Designed &amp; Developed by{' '}
            <span style={{ fontWeight: 600, color: '#e91e8c' }}>
              Neaz Morshed
            </span>
          </p>
        </div>
      </div>

    </footer>
  )
}