import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import { SessionProvider } from 'next-auth/react'
import Navbar from '@/components/layout/Navbar'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'BagBliss BD — Premium Mini Crossbody Bags',
    template: '%s | BagBliss BD',
  },
  description:
    "Bangladesh's most trendy mini crossbody bag store. Shop premium imported bags with fast delivery across Bangladesh.",
  keywords: [
    'mini crossbody bag',
    'bags bangladesh',
    'girls bag',
    'fashion bag bd',
    'imported bags dhaka',
  ],
  authors: [{ name: 'BagBliss BD' }],
  creator: 'BagBliss BD',
  metadataBase: new URL('https://bagbliss.com.bd'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bagbliss.com.bd',
    siteName: 'BagBliss BD',
    title: 'BagBliss BD — Premium Mini Crossbody Bags',
    description: "Bangladesh's most trendy mini crossbody bag store.",
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SessionProvider>
          <Navbar />
          <div className="navbar-spacer" />
          {children}
          <div style={{ height: '5rem' }} />
        </SessionProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1A1A2E',
              color: '#FDFAF7',
              fontFamily: 'Nunito, sans-serif',
              borderRadius: '999px',
              padding: '12px 24px',
            },
            success: {
              iconTheme: {
                primary: '#E91E8C',
                secondary: '#FDFAF7',
              },
            },
          }}
        />
      </body>
    </html>
  )
}