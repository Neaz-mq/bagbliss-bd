import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

// Next 16: `middleware.ts` এর নতুন নাম `proxy.ts`।
// ফাইলটা অবশ্যই `src/` ফোল্ডারের ভেতরে থাকবে (প্রজেক্টে src/app আছে বলে)।
export default auth((req) => {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin')) {
    if (!req.auth) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (req.auth.user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*'],
}