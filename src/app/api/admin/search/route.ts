import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import Order from '@/models/Order'
import User from '@/models/User'

export const dynamic = 'force-dynamic'

// .lean() এর রেজাল্ট `any` না রেখে স্পষ্ট টাইপ — select() এ যা আনছি শুধু তাই
type ProductRow  = { _id: unknown; name: string; price?: number; images?: string[] }
type OrderRow    = { _id: unknown; orderNumber?: string; status?: string; shipping?: { fullName?: string } }
type CustomerRow = { _id: unknown; name?: string; email: string; avatar?: string }

interface SearchResult {
  type: 'product' | 'order' | 'customer'
  id: string
  title: string
  subtitle?: string
  image?: string
  href: string
}

export async function GET(req: NextRequest) {
  // 🔒 শুধু admin — আগে কোনো auth চেক ছিল না, customer-এর নাম/ইমেইল ফাঁস হত
  const session = await auth()
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const q = (req.nextUrl.searchParams.get('q')?.trim() ?? '').slice(0, 100)

    if (q.length < 2) {
      return NextResponse.json({ success: true, data: [] })
    }

    await connectDB()

    // Create regex for search
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')

    const LIMIT_PER_TYPE = 5

    // Search in all three collections
    const [products, orders, customers] = await Promise.all([
      Product.find({ name: regex })
        .select('name images price slug')
        .limit(LIMIT_PER_TYPE)
        .lean<ProductRow[]>(),
      
      Order.find({
        $or: [
          { orderNumber: regex },
          { 'shipping.fullName': regex },
          { 'shipping.phone': regex },
          { guestEmail: regex },
        ],
      })
        .select('orderNumber status total shipping.fullName')
        .limit(LIMIT_PER_TYPE)
        .lean<OrderRow[]>(),
      
      User.find({
        role: 'user',
        $or: [{ name: regex }, { email: regex }],
      })
        .select('name email avatar')
        .limit(LIMIT_PER_TYPE)
        .lean<CustomerRow[]>(),
    ])

    // Format results
    const results: SearchResult[] = [
      ...products.map((p) => ({
        type: 'product' as const,
        id: String(p._id),
        title: p.name,
        subtitle: p.price != null ? `৳${p.price}` : undefined,
        image: p.images?.[0],
        href: `/admin/products/${p._id}`,
      })),

      ...orders.map((o) => ({
        type: 'order' as const,
        id: String(o._id),
        title: o.orderNumber ? `Order #${o.orderNumber}` : `Order ${String(o._id).slice(-6)}`,
        subtitle: [o.shipping?.fullName, o.status].filter(Boolean).join(' · '),
        href: `/admin/orders/${o._id}`,
      })),

      ...customers.map((c) => ({
        type: 'customer' as const,
        id: String(c._id),
        title: c.name ?? c.email,
        subtitle: c.email,
        image: c.avatar || undefined,
        href: `/admin/customers/${c._id}`,
      })),
    ]

    return NextResponse.json({ success: true, data: results })

  } catch (err) {
    console.error('Admin search error:', err)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Search failed',
      },
      { status: 500 }
    )
  }
}