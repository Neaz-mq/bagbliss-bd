'use client'

import { useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'

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
  const { status, update } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  const isAdmin    = pathname.startsWith('/admin')
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
        callback: async ({ credential }: { credential: string }) => {
          const result = await signIn('google-one-tap', {
            credential,
            redirect: false,
          })

          if (result?.ok) {
            await update()    // ← refreshes useSession() in Navbar instantly
            router.refresh()  // ← re-renders server components with new session
          }
        },
        // ✅ Fixed: was true which causes FedCM NetworkError on localhost
        use_fedcm_for_prompt: false,
        cancel_on_tap_outside: false,
      })

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('[GoogleOneTap] prompt suppressed by browser')
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
      document.head.appendChild(script)
    } else {
      init()
    }

    return () => {
      window.google?.accounts.id.cancel()
    }
  }, [status, isAdmin, isAuthPage, update, router])

  return null
}