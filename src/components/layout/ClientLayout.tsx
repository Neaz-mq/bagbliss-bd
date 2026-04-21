'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'

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
      <Navbar />
      <div className="navbar-spacer" />
      {children}
      <Footer />
      <CartDrawer />
    </>
  )
}