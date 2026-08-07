import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getProducts } from '@/features/products/api/getProductBySlug'
import ShopClient from './ShopClient'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Shop — All Bags',
  description:
    'Browse our full collection of premium mini crossbody bags. Filter by category, price, and style.',
}

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ShopPage({ searchParams }: Props) {
  const sp = await searchParams
  const one = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v

  const { products, total } = await getProducts({
    category: one(sp.category),
    filter: one(sp.filter),
    sort: one(sp.sort),
    search: one(sp.search),
    limit: 12,
  })

  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopClient initialProducts={products} initialTotal={total} />
    </Suspense>
  )
}

function ShopSkeleton() {
  return (
    <div className="shop-page">
      <div className="shop-hero skeleton" style={{ height: '200px', borderRadius: 0 }} />
      <div className="container-bagbliss" style={{ paddingTop: '2rem' }}>
        <div className="shop-layout">
          <div className="shop-sidebar">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '1.25rem', marginBottom: '1rem' }} />
            ))}
          </div>
          <div className="shop-main">
            <div className="products-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '360px', borderRadius: '1.25rem' }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}