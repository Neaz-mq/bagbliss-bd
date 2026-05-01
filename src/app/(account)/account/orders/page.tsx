// src/app/(admin)/admin/orders/page.tsx
import { Suspense } from 'react'
import OrdersPage from './OrdersClient'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OrdersPage />
    </Suspense>
  )
}