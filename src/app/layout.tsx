import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Toaster } from 'react-hot-toast'
import { SessionProvider } from 'next-auth/react'
import ClientLayout from '@/components/layout/ClientLayout'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'BagBliss BD — Premium Mini Crossbody Bags',
    template: '%s | BagBliss BD',
  },
  description:
    "Bangladesh's most trendy mini crossbody bag store. Shop premium imported bags with fast delivery across Bangladesh.",
  keywords: [
    'mini crossbody bag bangladesh',
    'bags bd',
    'girls bag dhaka',
    'fashion bag bangladesh',
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
          <Suspense fallback={null}>
            {/*
              ClientLayout checks the pathname:
              - /admin/* → renders children only (no Navbar/Footer/CartDrawer)
              - everything else → wraps with Navbar + CartDrawer + navbar-spacer + Footer
            */}
            <ClientLayout>{children}</ClientLayout>
          </Suspense>
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