// src/app/(account)/account/addresses/page.tsx
import { Suspense } from 'react'
import AddressesClient from './AddressesClient'

export const dynamic = 'force-dynamic'

export default function AddressesPage() {
  return (
    <Suspense fallback={null}>
      <AddressesClient />
    </Suspense>
  )
}