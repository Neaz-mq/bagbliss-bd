// src/app/(admin)/admin/categories/page.tsx
import { Suspense } from 'react'
import CategoriesClient from './CategoriesClient'

export const dynamic = 'force-dynamic'

export default function CategoriesPage() {
  return (
    <Suspense fallback={null}>
      <CategoriesClient />
    </Suspense>
  )
}