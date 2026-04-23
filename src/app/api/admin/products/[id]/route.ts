import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

async function guard() {
  const session = await auth()
  return !session || session.user?.role !== 'admin'
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (await guard()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await connectDB()
  const body = await req.json()
  const product = await Product.findByIdAndUpdate(params.id, { $set: body }, { new: true }).lean()
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ product })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (await guard()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await connectDB()
  const product = await Product.findByIdAndDelete(params.id)
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (await guard()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await connectDB()
  const product = await Product.findById(params.id).lean()
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ product })
}