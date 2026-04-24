import Link from 'next/link'
import { XCircle, RefreshCw, ShoppingBag } from 'lucide-react'

export default function PaymentFailPage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#fdfaf7', padding: '2rem',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '480px', animation: 'fadeIn 0.5s ease' }}>
        {/* Icon */}
        <div style={{
          width: '96px', height: '96px', borderRadius: '50%',
          background: 'rgba(239,68,68,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <XCircle size={48} color="#ef4444" strokeWidth={1.5} />
        </div>

        <p style={{ fontFamily: 'Space Grotesk, monospace', fontSize: '0.8rem', fontWeight: 700, color: '#ef4444', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Payment Failed
        </p>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#1a1a2e', margin: '0 0 1rem', lineHeight: 1.15 }}>
          Something went wrong
        </h1>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '1rem', color: '#6b7280', lineHeight: 1.7, margin: '0 0 2rem' }}>
          Your payment could not be processed. No money has been charged.
          Please try again or choose a different payment method.
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/checkout" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.875rem 1.75rem', borderRadius: '9999px',
            background: '#e91e8c', color: 'white',
            fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.9rem',
            textDecoration: 'none',
          }}>
            <RefreshCw size={16} /> Try Again
          </Link>
          <Link href="/shop" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.875rem 1.75rem', borderRadius: '9999px',
            border: '2px solid #1a1a2e', color: '#1a1a2e',
            fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.9rem',
            textDecoration: 'none',
          }}>
            <ShoppingBag size={16} /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}