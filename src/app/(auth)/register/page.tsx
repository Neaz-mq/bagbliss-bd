// src/app/(auth)/register/page.tsx
export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import RegisterClient from './RegisterClient'

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterClient />
    </Suspense>
  )
}