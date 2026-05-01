'use client'

import { useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void
          prompt: (callback?: (n: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void
          cancel: () => void
        }
      }
    }
  }
}

export default function GoogleOneTap() {
  const { status } = useSession()
  const pathname = usePathname()

  // Skip on admin / auth pages
  const isAdmin   = pathname.startsWith('/admin')
  const isAuthPage = pathname.startsWith('/login') ||
                     pathname.startsWith('/register') ||
                     pathname.startsWith('/forgot-password')

  useEffect(() => {
    if (status !== 'unauthenticated' || isAdmin || isAuthPage) return

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) {
      console.warn('[GoogleOneTap] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set')
      return
    }

    const init = () => {
      if (!window.google) return

      window.google.accounts.id.initialize({
        client_id: clientId,
        // When user picks their account, sign in via our NextAuth credentials provider
        callback: async ({ credential }: { credential: string }) => {
          await signIn('google-one-tap', {
            credential,
            redirect: false,
          })
          // Hard-refresh so session state propagates everywhere
          window.location.reload()
        },
        use_fedcm_for_prompt: true,   // required for Chrome 115+
        cancel_on_tap_outside: false,
      })

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Browser suppressed the prompt (user previously dismissed it, etc.)
          console.log('[GoogleOneTap] prompt suppressed by browser')
        }
      })
    }

    // Inject GSI script once
    const SCRIPT_ID = 'google-gsi'
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script')
      script.id   = SCRIPT_ID
      script.src  = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = init
      document.head.appendChild(script)
    } else {
      // Script already present (e.g. hot-reload)
      init()
    }

    return () => {
      window.google?.accounts.id.cancel()
    }
  }, [status, isAdmin, isAuthPage])

  return null  // no visible markup — Google renders its own browser UI
}