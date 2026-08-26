import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import Order from '@/models/Order'
import User from '@/models/User'

export const dynamic = 'force-dynamic'

interface SearchResult {
  type: 'product' | 'order' | 'customer'
  id: string
  title: string
  subtitle?: string
  image?: string
  href: string
}

export async function GET(req: NextRequest) {
  try {
    console.log('Search API called')
    
    const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
    console.log('Search query:', q)
    
    if (q.length < 2) {
      return NextResponse.json({ success: true, data: [] })
    }

    await connectDB()
    console.log('Connected to MongoDB')

    // Create regex for search
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')

    const LIMIT_PER_TYPE = 5

    // Search in all three collections
    const [products, orders, customers] = await Promise.all([
      Product.find({ name: regex })
        .select('name images price slug')
        .limit(LIMIT_PER_TYPE)
        .lean(),
      
      Order.find({
        $or: [
          { orderNumber: regex },
          { 'customer.name': regex },
          { 'customer.email': regex },
        ],
      })
        .select('orderNumber status total customer')
        .limit(LIMIT_PER_TYPE)
        .lean(),
      
      User.find({
        role: 'customer',
        $or: [{ name: regex }, { email: regex }],
      })
        .select('name email image')
        .limit(LIMIT_PER_TYPE)
        .lean(),
    ])

    console.log(`Found: ${products.length} products, ${orders.length} orders, ${customers.length} customers`)

    // Format results
    const results: SearchResult[] = [
      ...products.map((p: any) => ({
        type: 'product' as const,
        id: String(p._id),
        title: p.name,
        subtitle: p.price != null ? `৳${p.price}` : undefined,
        image: p.images?.[0],
        href: `/admin/products/${p._id}`,
      })),

      ...orders.map((o: any) => ({
        type: 'order' as const,
        id: String(o._id),
        title: o.orderNumber ? `Order #${o.orderNumber}` : `Order ${String(o._id).slice(-6)}`,
        subtitle: [o.customer?.name, o.status].filter(Boolean).join(' · '),
        href: `/admin/orders/${o._id}`,
      })),

      ...customers.map((c: any) => ({
        type: 'customer' as const,
        id: String(c._id),
        title: c.name ?? c.email,
        subtitle: c.email,
        image: c.image,
        href: `/admin/customers/${c._id}`,
      })),
    ]

    console.log('Returning results:', results)
    return NextResponse.json({ success: true, data: results })

  } catch (err) {
    console.error('Admin search error:', err)
    return NextResponse.json(
      { 
        success: false, 
        error: err instanceof Error ? err.message : 'Search failed',
        statusCode: 500 
      },
      { status: 500 }
    )
  }
}