'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import VisitorTracker from '@/components/VisitorTracker'
import GoogleOneTap from '@/components/auth/GoogleOneTap'
import ChatLauncher from '@/components/ui/ChatLauncher'
import Topbar from './Topbar'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')
  const isAuthPage = pathname.startsWith('/login') ||
                     pathname.startsWith('/register') ||
                     pathname.startsWith('/forgot-password')

  if (isAdmin || isAuthPage) {
    return <>{children}</>
  }

  return (
  <>
    <GoogleOneTap />
    <Topbar />   {/* scrolls away naturally */}
    <Navbar />   {/* sticky via motion.div inside */}
    {children}
    <Footer />
    <CartDrawer />
    <ChatLauncher />
    <VisitorTracker />
  </>
)
}