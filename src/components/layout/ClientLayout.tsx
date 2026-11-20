'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import dynamic from 'next/dynamic'
import Topbar from './Topbar'

// ⚡ প্রথম পেজ লোডে লাগে না — আলাদা chunk-এ, হাইড্রেশনের পরে লোড হবে
const VisitorTracker = dynamic(() => import('@/components/VisitorTracker'), { ssr: false })
const GoogleOneTap   = dynamic(() => import('@/components/auth/GoogleOneTap'), { ssr: false })
const ChatLauncher   = dynamic(() => import('@/components/ui/ChatLauncher'), { ssr: false })

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const headerRef = useRef<HTMLDivElement>(null)
  const [headerH, setHeaderH] = useState<number | null>(null)
  const isAdmin = pathname.startsWith('/admin')
  const isAuthPage = pathname.startsWith('/login') ||
                     pathname.startsWith('/register') ||
                     pathname.startsWith('/forgot-password')

  const showChrome = !(isAdmin || isAuthPage)

  // Measure the fixed header so the spacer below always matches its real
  // height (Topbar text can wrap on small screens, Navbar is 58px/68px).
  useEffect(() => {
    if (!showChrome) return
    const el = headerRef.current
    if (!el) return
    const update = () => setHeaderH(el.offsetHeight)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [showChrome])

  if (!showChrome) {
    return <>{children}</>
  }

  return (
    <>
      <GoogleOneTap />
      {/* Topbar + Navbar are pinned together as ONE fixed block. `fixed` is
          used (instead of `sticky`) because it keeps working no matter what
          overflow rules exist on body/html. The spacer below reserves the
          same height so page content starts right under the header. */}
      <div
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-[100]"
      >
        <Topbar />
        <Navbar />
      </div>
      <div
        aria-hidden="true"
        className={headerH === null ? 'h-[94px] lg:h-[104px]' : ''}
        style={headerH === null ? undefined : { height: headerH }}
      />

      {/* The pinned header is now taller (Topbar 36px + Navbar 58/68px), so
          the other sticky columns must start below it instead of sliding
          under it. Values = header height (~104px) + breathing room. */}
      <style>{`
        .shop-sidebar {
          top: 120px !important;
          max-height: calc(100vh - 120px - 1rem) !important;
        }
        .gallery-wrapper,
        .cart-page-summary-col,
        .co-summary-col {
          top: 120px !important;
        }
      `}</style>
      {children}
      <Footer />
      <CartDrawer />
      <ChatLauncher />
      <VisitorTracker />
    </>
  )
}