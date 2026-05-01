'use client'

import { useEffect, useRef } from 'react'
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
          }) => void) => void
          cancel: () => void
          renderButton: (parent: HTMLElement, options: object) => void
        }
      }
    }
  }
}

export default function GoogleOneTap() {
  const { status, update } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const initialized = useRef(false)

  const isAdmin    = pathname.startsWith('/admin')
  const isAuthPage = pathname.startsWith('/login') ||
                     pathname.startsWith('/register') ||
                     pathname.startsWith('/forgot-password')

  const shouldShow = status === 'unauthenticated' && !isAdmin && !isAuthPage

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

    const init = () => {
      if (!window.google?.accounts?.id) return
      initialized.current = true

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        use_fedcm_for_prompt: true,   // ✅ FedCM enabled — shows native popup
        cancel_on_tap_outside: false,
        auto_select: false,
        itp_support: true,
        context: 'signin',
      })

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          console.log('[GoogleOneTap] not displayed:', notification.getMomentType())
          // FedCM blocked or no Google account — show fallback button
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
        } else if (notification.isSkippedMoment()) {
          console.log('[GoogleOneTap] skipped:', notification.getMomentType())
        } else if (notification.isDismissedMoment()) {
          console.log('[GoogleOneTap] dismissed:', notification.getMomentType())
        }
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

  // Hidden fallback button — only shown if FedCM popup fails
  return (
    <div
      suppressHydrationWarning
      id="google-one-tap-btn"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'none',      // stays hidden unless prompt() fails
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  )
}