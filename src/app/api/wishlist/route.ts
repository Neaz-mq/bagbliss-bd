import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { auth } from '@/lib/auth'
import mongoose from 'mongoose'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Please login first' }, { status: 401 })
    }

    const { productId, action } = await req.json()

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: 'Invalid Product ID' }, { status: 400 })
    }

    await connectDB()

    const update =
      action === 'add'
        ? { $addToSet: { wishlist: new mongoose.Types.ObjectId(productId) } }
        : { $pull: { wishlist: new mongoose.Types.ObjectId(productId) } }

    const updatedUser = await User.findByIdAndUpdate(userId, update, { new: true })

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
    }

    return NextResponse.json({ success: true, wishlist: updatedUser.wishlist })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Wishlist Update Error:', err)
    return NextResponse.json({ error: 'Database operation failed' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) return NextResponse.json({ items: [] })

    await connectDB()
    const user = await User.findById(userId)

    const wishlistItems = user?.wishlist?.map((id: mongoose.Types.ObjectId) => id.toString()) ?? []
    return NextResponse.json({ items: wishlistItems })
  } catch {
    // No err variable — nothing to log, avoids both lint errors
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}