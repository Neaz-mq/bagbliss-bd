import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { auth } from '@/lib/auth'
import mongoose from 'mongoose'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    // In your auth.ts, you mapped the user ID to session.user.id
    const userId = session?.user?.id 

    if (!userId) {
      return NextResponse.json({ error: 'Please login first' }, { status: 401 })
    }

    const { productId, action } = await req.json()
    
    // Ensure the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
       return NextResponse.json({ error: 'Invalid Product ID' }, { status: 400 })
    }

    await connectDB()

    // We use findByIdAndUpdate to target the specific _id shown in your screenshot
    const update = action === 'add' 
      ? { $addToSet: { wishlist: new mongoose.Types.ObjectId(productId) } } 
      : { $pull: { wishlist: new mongoose.Types.ObjectId(productId) } }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      update,
      { new: true } // Returns the document AFTER the update
    )

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      wishlist: updatedUser.wishlist 
    })
  } catch (err) {
    console.error("Wishlist Update Error:", err)
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
    
    // Return just the string IDs so the frontend heart-toggle works correctly
    const wishlistItems = user?.wishlist?.map(id => id.toString()) || []
    return NextResponse.json({ items: wishlistItems })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}