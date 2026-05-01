'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void
          prompt: (callback?: (n: {
            isNotDisplayed: () => boolean
            isSkippedMoment: () => boolean
            isDismissedMoment: () => boolean
            getMomentType: () => string
            getNotDisplayedReason: () => string
            getSkippedReason: () => string
            getDismissedReason: () => string
          }) => void) => void
          cancel: () => void
          renderButton: (parent: HTMLElement, options: object) => void
        }
      }
    }
  }
}

// ✅ Suppress the [GSI_LOGGER] FedCM NetworkError from the Next.js dev overlay.
// This error is thrown internally by Google's GSI script when FedCM is
// disabled in the browser — it is not actionable and the app works fine.
function suppressFedCMConsoleError() {
  if (typeof window === 'undefined') return

  const originalError = console.error.bind(console)
  console.error = (...args: unknown[]) => {
    const msg = typeof args[0] === 'string' ? args[0] : ''
    if (
      msg.includes('GSI_LOGGER') ||
      msg.includes('FedCM') ||
      msg.includes('NetworkError') && msg.includes('token')
    ) {
      return // swallow — known benign GSI internal error
    }
    originalError(...args)
  }
}

export default function GoogleOneTap() {
  const { status, update } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const initialized = useRef(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Suppress GSI_LOGGER FedCM error from Next.js dev overlay
    suppressFedCMConsoleError()
  }, [])

  const isAdmin    = pathname.startsWith('/admin')
  const isAuthPage = pathname.startsWith('/login') ||
                     pathname.startsWith('/register') ||
                     pathname.startsWith('/forgot-password')

  const shouldShow = mounted && status === 'unauthenticated' && !isAdmin && !isAuthPage

  useEffect(() => {
    if (!shouldShow) return
    if (initialized.current) return

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) {
      console.warn('[GoogleOneTap] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set')
      return
    }

    const handleCredentialResponse = async ({ credential }: { credential: string }) => {
      try {
        const result = await signIn('google-one-tap', {
          credential,
          redirect: false,
        })
        if (result?.ok) {
          await update()
          router.refresh()
        } else {
          console.error('[GoogleOneTap] signIn failed:', result?.error)
        }
      } catch (err) {
        console.error('[GoogleOneTap] error:', err)
      }
    }

    const showFallbackButton = () => {
      const container = document.getElementById('google-one-tap-btn')
      if (container && window.google?.accounts?.id) {
        window.google.accounts.id.renderButton(container, {
          type: 'standard',
          shape: 'pill',
          theme: 'outline',
          text: 'continue_with',
          size: 'large',
          logo_alignment: 'left',
          width: 240,
        })
        container.style.display = 'flex'
      }
    }

    const init = () => {
      if (!window.google?.accounts?.id) return
      initialized.current = true

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        cancel_on_tap_outside: false,
        auto_select: false,
        itp_support: true,
        context: 'signin',
      })

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          showFallbackButton()
          return
        }
        // isSkippedMoment / isDismissedMoment — user action, do nothing
      })
    }

    const SCRIPT_ID = 'google-gsi'
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script')
      script.id    = SCRIPT_ID
      script.src   = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = init
      script.onerror = () => console.error('[GoogleOneTap] failed to load GSI script')
      document.head.appendChild(script)
    } else if (window.google?.accounts?.id) {
      init()
    } else {
      const iv = setInterval(() => {
        if (window.google?.accounts?.id) { clearInterval(iv); init() }
      }, 100)
      setTimeout(() => clearInterval(iv), 5000)
    }

    return () => {
      window.google?.accounts.id.cancel()
    }
  }, [shouldShow, update, router])

  if (!shouldShow) return null

  return (
    <div
      id="google-one-tap-btn"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  )
}