// src/app/(admin)/admin/flash-sale/page.tsx
import { Suspense } from 'react'
import FlashSaleClient from './FlashSaleClient'

export const dynamic = 'force-dynamic'

export default function FlashSalePage() {
  return (
    <Suspense fallback={null}>
      <FlashSaleClient />
    </Suspense>
  )
}