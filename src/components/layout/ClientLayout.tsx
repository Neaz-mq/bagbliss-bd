'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) {
    // Admin pages: render children directly, no navbar/footer/cart
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