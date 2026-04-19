import Link from 'next/link'
import { ShoppingBag, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FDFAF7',
        padding: '2rem',
        textAlign: 'center',
        gap: '1.5rem',
      }}
    >
      {/* Bag Icon */}
      <div
        style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'rgba(233,30,140,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ShoppingBag size={48} color="#E91E8C" strokeWidth={1.5} />
      </div>

      {/* 404 */}
      <div>
        <p
          style={{
            fontFamily: 'Space Grotesk, monospace',
            fontSize: '1rem',
            fontWeight: 700,
            color: '#E91E8C',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
          }}
        >
          404 Error
        </p>
        <h1
          style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 700,
            color: '#1A1A2E',
            margin: '0 0 1rem',
            lineHeight: 1.1,
          }}
        >
          Page Not Found
        </h1>
        <p
          style={{
            fontFamily: 'Nunito, sans-serif',
            fontSize: '1rem',
            color: '#6b7280',
            maxWidth: '420px',
            lineHeight: 1.7,
            margin: '0 auto',
          }}
        >
          Oops! The page you&apos;re looking for doesn&apos;t exist. It may have
          been moved or deleted.
        </p>
      </div>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.875rem 2rem',
            background: '#E91E8C',
            color: 'white',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            fontSize: '0.875rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            borderRadius: '9999px',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
          }}
        >
          <ArrowLeft size={16} />
          Go Home
        </Link>
        <Link
          href="/shop"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.875rem 2rem',
            background: 'transparent',
            color: '#1A1A2E',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            fontSize: '0.875rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            borderRadius: '9999px',
            border: '2px solid #1A1A2E',
            textDecoration: 'none',
          }}
        >
          <ShoppingBag size={16} />
          Browse Shop
        </Link>
      </div>
    </div>
  )
}
