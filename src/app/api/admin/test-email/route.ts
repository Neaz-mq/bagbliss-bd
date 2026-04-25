import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { sendOrderEmails } from '@/lib/email'

export async function POST() {
  const session = await auth()
  if (!session || session.user?.role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await sendOrderEmails({
      orderNumber:   'TEST001',
      customerName:  session.user.name ?? 'Test Customer',
      customerEmail: session.user.email ?? '',
      items: [
        { name: 'Rosé Mini Crossbody Bag', color: 'Dusty Rose', quantity: 1, price: 850, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&q=80' },
        { name: 'Candy Mini Flap Bag',     color: 'Baby Pink',  quantity: 2, price: 750 },
      ],
      shipping: {
        fullName: session.user.name ?? 'Test Customer',
        phone:    '01785286936',
        address:  'House 10, Road 11, Sector 7',
        thana:    'Gulshan',
        district: 'Dhaka',
        division: 'Dhaka',
        postalCode: '1212',
      },
      subtotal:    2350,
      deliveryFee: 0,
      total:       2350,
      payment:     'bkash',
      delivery:    'standard',
      orderNote:   'Please pack carefully!',
      createdAt:   new Date().toISOString(),
    })

    return NextResponse.json({ success: true, message: 'Test emails sent! Check your inbox.' })
  } catch (err) {
    console.error('[TEST EMAIL]', err)
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 })
  }
}