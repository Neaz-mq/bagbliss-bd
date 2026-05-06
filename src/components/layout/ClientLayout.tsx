'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import VisitorTracker from '@/components/VisitorTracker'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import GoogleOneTap from '@/components/auth/GoogleOneTap'
import ShoppingAssistant from '@/components/ai/ShoppingAssistant'  // ← added
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
    <div className="sticky top-0 z-[100]">   {/* ← wrap these two */}
      <Topbar />
      <Navbar />
    </div>
    {/* ← delete <div className="navbar-spacer" /> */}
    {children}
    <Footer />
    <WhatsAppButton />
    <CartDrawer />
    <ShoppingAssistant />
    <VisitorTracker />
  </>
)
}