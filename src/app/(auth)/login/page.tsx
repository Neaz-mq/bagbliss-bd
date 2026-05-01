// src/app/(auth)/login/page.tsx
export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import LoginClient from './LoginClient'

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  )
}