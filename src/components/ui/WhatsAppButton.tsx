'use client'

import { useState, useEffect } from 'react'

// ── Config ────────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = '8801303660481'
const DEFAULT_MESSAGE = 'Hello BagBliss BD! 👜 I have a question about your bags.'

const QUICK_MESSAGES = [
  { emoji: '👜', label: 'Ask about a bag',      text: 'Hi! I want to know more about one of your bags.' },
  { emoji: '📦', label: 'Track my order',       text: 'Hi! I want to track my order. My order number is: ' },
  { emoji: '💰', label: 'Price & availability', text: 'Hi! I want to check the price and availability of a bag.' },
  { emoji: '↩️', label: 'Return / Exchange',    text: 'Hi! I want to return or exchange an item I purchased.' },
  { emoji: '🚚', label: 'Delivery question',    text: 'Hi! I have a question about delivery to my area.' },
]

function buildWhatsAppURL(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

// ── WhatsApp SVG Icon ─────────────────────────────────────────────────────
function WhatsAppIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24 4C12.954 4 4 12.954 4 24c0 3.552.938 6.891 2.582 9.773L4 44l10.532-2.533A19.903 19.903 0 0024 44c11.046 0 20-8.954 20-20S35.046 4 24 4z"
        fill="white"
        fillOpacity="0.15"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24 7C14.611 7 7 14.611 7 24c0 3.32.906 6.432 2.491 9.094L7.5 40.5l7.628-1.978A16.944 16.944 0 0024 41c9.389 0 17-7.611 17-17S33.389 7 24 7z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.343 16c-.413 0-.862.155-1.172.477-.603.618-2.171 2.25-2.171 4.568 0 2.328 1.6 4.58 1.823 4.892.222.311 3.144 5.015 7.75 6.832 1.063.41 1.894.656 2.541.84 1.068.303 2.04.26 2.808.158.857-.114 2.638-.98 3.012-1.929.373-.948.373-1.762.261-1.93-.112-.167-.41-.261-.858-.456-.448-.195-2.638-1.243-3.047-1.385-.41-.14-.708-.21-1.007.196-.298.405-1.155 1.385-1.416 1.669-.26.285-.521.32-.97.125-.447-.196-1.89-.662-3.6-2.107-1.33-1.125-2.228-2.515-2.489-2.921-.26-.405-.027-.624.196-.825.2-.18.448-.47.671-.706.224-.235.298-.405.448-.675.149-.27.075-.507-.038-.706-.112-.2-.988-2.39-1.362-3.264C20.325 16.233 19.87 16 19.343 16z"
        fill="#25D366"
      />
    </svg>
  )
}

// ── Chat Panel ────────────────────────────────────────────────────────────
function ChatPanel({ onClose }: { onClose: () => void }) {
  const [customMessage, setCustomMessage] = useState('')

  const handleQuick = (text: string) => {
    window.open(buildWhatsAppURL(text), '_blank', 'noopener,noreferrer')
    onClose()
  }

  const handleCustom = () => {
    const msg = customMessage.trim() || DEFAULT_MESSAGE
    window.open(buildWhatsAppURL(msg), '_blank', 'noopener,noreferrer')
    onClose()
  }

  return (
    <div style={{
      position: 'absolute', bottom: '70px', right: 0,
      width: '320px', background: 'white',
      borderRadius: '20px', overflow: 'hidden',
      boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 12px rgba(0,0,0,0.1)',
      animation: 'waPanelIn 0.25s cubic-bezier(0.16,1,0.3,1)',
      transformOrigin: 'bottom right',
    }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
        padding: '16px 18px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <div style={{
          width: '46px', height: '46px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          border: '2px solid rgba(255,255,255,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', flexShrink: 0,
        }}>
          👜
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white', margin: 0 }}>
            BagBliss BD Support
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#90EE90', display: 'inline-block' }} />
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.85)', margin: 0 }}>
              Typically replies in minutes
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', border: 'none',
            color: 'white', cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: 700,
          }}
        >
          ×
        </button>
      </div>

      {/* Chat bubble */}
      <div style={{ padding: '16px 16px 8px', background: '#ECE5DD' }}>
        <div style={{
          background: 'white', borderRadius: '0 12px 12px 12px',
          padding: '10px 14px', maxWidth: '85%',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: '-8px',
            width: 0, height: 0,
            borderTop: '8px solid white',
            borderLeft: '8px solid transparent',
          }} />
          <p style={{ fontSize: '0.84rem', color: '#111', margin: 0, lineHeight: 1.5 }}>
            👋 Hi there! How can we help you today?
          </p>
          <p style={{ fontSize: '0.65rem', color: '#94a3b8', margin: '4px 0 0', textAlign: 'right' }}>
            BagBliss BD
          </p>
        </div>
      </div>

      {/* Quick messages */}
      <div style={{ background: '#ECE5DD', padding: '8px 16px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#667781', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>
          Quick Messages
        </p>
        {QUICK_MESSAGES.map(({ emoji, label, text }) => (
          <button
            key={label}
            onClick={() => handleQuick(text)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 12px', borderRadius: '20px',
              background: 'white', border: '1px solid rgba(0,0,0,0.08)',
              cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
              color: '#111', textAlign: 'left', width: '100%',
              transition: 'all 0.15s', boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#f0fdf4'
              e.currentTarget.style.borderColor = '#25D366'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'white'
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'
            }}
          >
            <span style={{ fontSize: '14px', flexShrink: 0 }}>{emoji}</span>
            {label}
            <span style={{ marginLeft: 'auto', color: '#25D366', fontSize: '12px' }}>→</span>
          </button>
        ))}
      </div>

      {/* Custom message input */}
      <div style={{ padding: '10px 12px 14px', background: '#F0F0F0', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', borderRadius: '24px', padding: '6px 6px 6px 14px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <input
            type="text"
            placeholder="Type a message…"
            value={customMessage}
            onChange={e => setCustomMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCustom()}
            suppressHydrationWarning
            style={{
              flex: 1, border: 'none', outline: 'none',
              fontSize: '0.84rem', color: '#111',
              background: 'transparent', minWidth: 0,
            }}
          />
          <button
            onClick={handleCustom}
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #25D366, #128C7E)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, boxShadow: '0 2px 8px rgba(37,211,102,0.4)',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <p style={{ fontSize: '0.65rem', color: '#94a3b8', textAlign: 'center', margin: '8px 0 0' }}>
          🔒 Messages are end-to-end encrypted on WhatsApp
        </p>
      </div>
    </div>
  )
}

// ── Main Button ───────────────────────────────────────────────────────────
export default function WhatsAppButton() {
  const [open,      setOpen]      = useState(false)
  const [mounted,   setMounted]   = useState(false)
  const [pulse,     setPulse]     = useState(false)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    setMounted(true)
    const t1 = setTimeout(() => setPulse(true), 4000)
    const t2 = setTimeout(() => { if (!open) setShowToast(true) }, 6000)
    const t3 = setTimeout(() => setShowToast(false), 10000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) return null

  return (
    <>
      <div style={{
        position: 'fixed', bottom: '28px', right: '24px',
        zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
      }}>
        {open && <ChatPanel onClose={() => setOpen(false)} />}

        {/* Attention tooltip */}
        {showToast && !open && (
          <div style={{
            position: 'absolute', bottom: '70px', right: 0,
            background: 'white', borderRadius: '12px',
            padding: '10px 14px', whiteSpace: 'nowrap',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            animation: 'waPanelIn 0.2s ease',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ fontSize: '18px' }}>👋</span>
            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#111', margin: 0 }}>Need help?</p>
              <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '1px 0 0' }}>Chat with us on WhatsApp!</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0 0 0 4px', fontSize: '14px', fontWeight: 700 }}
            >
              ×
            </button>
            <div style={{
              position: 'absolute', bottom: '-6px', right: '22px',
              width: '12px', height: '12px',
              background: 'white', transform: 'rotate(45deg)',
              boxShadow: '2px 2px 4px rgba(0,0,0,0.08)',
            }} />
          </div>
        )}

        {/* Main FAB button */}
        <button
          onClick={() => { setOpen(v => !v); setShowToast(false); setPulse(false) }}
          aria-label="Chat with us on WhatsApp"
          style={{
            width: '58px', height: '58px', borderRadius: '50%',
            background: open
              ? 'linear-gradient(135deg, #128C7E, #25D366)'
              : 'linear-gradient(135deg, #25D366, #128C7E)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(37,211,102,0.5), 0 2px 8px rgba(0,0,0,0.15)',
            transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
            transform: open ? 'rotate(360deg) scale(1.05)' : 'scale(1)',
            position: 'relative',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.boxShadow = '0 6px 28px rgba(37,211,102,0.6)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = open ? 'scale(1.05)' : 'scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,211,102,0.5)'
          }}
        >
          {/* Pulse ring */}
          {pulse && !open && (
            <span style={{
              position: 'absolute', inset: '-4px',
              borderRadius: '50%',
              border: '2px solid rgba(37,211,102,0.5)',
              animation: 'waRing 1.5s ease-out infinite',
            }} />
          )}

          {open ? (
            // Close X
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          ) : (
            // ✅ Proper WhatsApp icon
            <WhatsAppIcon size={30} />
          )}
        </button>
      </div>

      <style>{`
        @keyframes waPanelIn {
          from { opacity: 0; transform: scale(0.85) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes waRing {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </>
  )
}