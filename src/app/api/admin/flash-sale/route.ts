import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user?.role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const sp   = new URL(req.url).searchParams
  const type = sp.get('type') ?? 'active' // active | all

  const q = type === 'active'
    ? { isFlashSale: true, isActive: true }
    : { isActive: true }

  const products = await Product.find(q)
    .sort({ createdAt: -1 })
    .select('name slug price originalPrice flashSalePrice isFlashSale images category totalStock')
    .lean()

  return NextResponse.json({ products })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session || session.user?.role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const { productIds, isFlashSale, flashSalePrice } = await req.json()

  if (!Array.isArray(productIds))
    return NextResponse.json({ error: 'productIds must be array' }, { status: 400 })

  const update: Record<string, unknown> = { isFlashSale }
  if (isFlashSale && flashSalePrice !== undefined) {
    update.flashSalePrice = flashSalePrice
  }
  if (!isFlashSale) {
    update.flashSalePrice = 0
  }

  await Product.updateMany(
    { _id: { $in: productIds } },
    { $set: update }
  )

  return NextResponse.json({ success: true, updated: productIds.length })
}