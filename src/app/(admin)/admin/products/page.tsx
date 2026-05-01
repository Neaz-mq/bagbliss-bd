// src/app/(admin)/admin/products/page.tsx
import { Suspense } from 'react'
import ProductsClient from './ProductsClient'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProductsClient />
    </Suspense>
  )
}