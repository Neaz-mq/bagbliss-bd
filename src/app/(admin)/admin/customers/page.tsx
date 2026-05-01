// src/app/(admin)/admin/customers/page.tsx
import { Suspense } from 'react'
import CustomersClient from './CustomersClient'

export const dynamic = 'force-dynamic'

export default function CustomersPage() {
  return (
    <Suspense fallback={null}>
      <CustomersClient />
    </Suspense>
  )
}