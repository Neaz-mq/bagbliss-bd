import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductBySlug, getRelatedProducts } from '@/features/products/api/getProductBySlug'
import ProductDetailClient from './ProductDetailClient'

export const revalidate = 300

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://bagbliss-bd.vercel.app'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return { title: 'Product Not Found' }
  }

  const name = product.name as string
  const desc =
    (product.shortDescription as string) ||
    (product.description as string)?.slice(0, 155) ||
    ''
  const images = (product.images as string[]) ?? []
  const url = `${SITE_URL}/product/${slug}`

  return {
    title: name,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: name,
      description: desc,
      url,
      type: 'website',
      siteName: 'BagBliss BD',
      images:
        images.length > 0
          ? [{ url: images[0], width: 1200, height: 1200, alt: name }]
          : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: name,
      description: desc,
      images: images.slice(0, 1),
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params

  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const related = await getRelatedProducts(product.category as string, slug)

  const price =
    product.isFlashSale && product.flashSalePrice
      ? product.flashSalePrice
      : product.price

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description,
    image: product.images,
    sku: slug,
    brand: { '@type': 'Brand', name: 'BagBliss BD' },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${slug}`,
      priceCurrency: 'BDT',
      price: String(price),
      availability:
        (product.totalStock as number) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient initialProduct={product} initialRelated={related} />
    </>
  )
}