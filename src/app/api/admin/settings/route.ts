import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import mongoose, { Schema } from 'mongoose'

// ── Settings Model ─────────────────────────────────────────────────────────
const SettingsSchema = new Schema({
  key:       { type: String, required: true, unique: true },
  value:     { type: Schema.Types.Mixed },
  updatedAt: { type: Date, default: Date.now },
})

const Settings = mongoose.models.Settings ||
  mongoose.model('Settings', SettingsSchema)

// ── Default settings ───────────────────────────────────────────────────────
const DEFAULTS = {
  store: {
    name:        'BagBliss BD',
    tagline:     "Bangladesh's most trendy mini crossbody bag store",
    email:       'hello@bagbliss.com.bd',
    phone:       '+880 1XXX-XXXXXX',
    address:     'Dhaka, Bangladesh',
    currency:    'BDT',
    currencySymbol: '৳',
  },
  shipping: {
    insideDhaka:    60,
    outsideDhaka:   120,
    freeThreshold:  1500,
    expressExtra:   60,
  },
  social: {
    facebook:  'https://facebook.com/bagblissbd',
    instagram: 'https://instagram.com/bagblissbd',
    youtube:   '',
    tiktok:    '',
  },
  notifications: {
    newOrderEmail:    true,
    lowStockAlert:    true,
    lowStockThreshold: 5,
    customerEmails:   true,
  },
  maintenance: {
    enabled: false,
    message: 'We are updating the store. Back shortly!',
  },
  payment: {
    cod:         true,
    bkash:       true,
    nagad:       true,
    card:        true,
    bkashNumber: '',
    nagadNumber: '',
  },
  seo: {
    metaTitle:       'BagBliss BD — Premium Mini Crossbody Bags Bangladesh',
    metaDescription: "Bangladesh's most trendy mini crossbody bag store. Shop premium imported bags.",
    googleAnalytics: '',
    facebookPixel:   '',
  },
}

async function getSettings(key: string) {
  const doc = await Settings.findOne({ key })
  return doc?.value ?? DEFAULTS[key as keyof typeof DEFAULTS] ?? {}
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user?.role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const sp  = new URL(req.url).searchParams
  const key = sp.get('key')

  if (key) {
    const value = await getSettings(key)
    return NextResponse.json({ key, value })
  }

  // Return all settings
  const all = await Settings.find({}).lean()
  const map: Record<string, unknown> = {}
  for (const s of all) map[s.key] = s.value

  // Merge with defaults
  const merged: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(DEFAULTS)) {
    merged[k] = map[k] ?? v
  }

  return NextResponse.json({ settings: merged })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session || session.user?.role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const { key, value } = await req.json()

  if (!key || value === undefined)
    return NextResponse.json({ error: 'key and value required' }, { status: 400 })

  await Settings.findOneAndUpdate(
    { key },
    { key, value, updatedAt: new Date() },
    { upsert: true, new: true }
  )

  return NextResponse.json({ success: true, key, value })
}