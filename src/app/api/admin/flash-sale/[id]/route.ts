import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const session = await auth()
  if (!session || session.user?.role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await Promise.resolve(context.params)

  await connectDB()

  const body = await req.json()
  const { isFlashSale, flashSalePrice } = body

  const update: Record<string, unknown> = { isFlashSale }
  if (isFlashSale) {
    update.flashSalePrice = Number(flashSalePrice) || 0
  } else {
    update.flashSalePrice = 0
  }

  const product = await Product.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true }
  ).lean()

  if (!product)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ product })
}