import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const PUBLIC_FIELDS = [
  'name',
  'slug',
  'description',
  'shortDescription',
  'price',
  'comparePrice',
  'images',
  'category',
  'tags',
  'colors',
  'stock',
  'rating',
  'reviewCount',
  'dimensions',
  'weight',
  'isFeatured',
  'createdAt',
].join(' ')

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  if (!SLUG_PATTERN.test(slug)) {
    return NextResponse.json(
      { success: false, error: 'Invalid slug' },
      { status: 400 }
    )
  }

  try {
    await connectDB()

    const product = await Product.findOne({ slug, isActive: true })
      .select(PUBLIC_FIELDS)
      .lean()

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, data: product },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (err) {
    console.error(`[GET /api/products/slug/${slug}]`, err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}