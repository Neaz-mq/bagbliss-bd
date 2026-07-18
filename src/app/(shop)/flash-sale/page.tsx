import { Suspense } from 'react'
import type { Metadata } from 'next'
import ShopClient from '../shop/ShopClient'

export const metadata: Metadata = {
  title: 'Flash Sale — Limited-Time Deals',
  description:
    'Grab premium mini crossbody bags at flash sale prices before they sell out. Limited stock, limited time.',
}

export default function FlashSalePage() {
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopClient mode="flash-sale" />
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
