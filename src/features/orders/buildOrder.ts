import { z } from 'zod'
import { nanoid } from 'nanoid'
import Product from '@/models/Product'
import { getDbUnitPrice } from '@/utils/pricing'

// ── Server-side truth — ক্লায়েন্ট থেকে কখনো আসে না ────────────────────
export const DELIVERY_FEES: Record<string, number> = {
  standard: 60,
  express: 120,
}
export const FREE_DELIVERY_THRESHOLD = 1500
const MAX_QTY_PER_ITEM = 10

export const OrderInputSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(MAX_QTY_PER_ITEM),
        color: z.string().max(60).optional().default(''),
      })
    )
    .min(1)
    .max(20),
  shipping: z.object({
    fullName: z.string().trim().min(3).max(100),
    phone: z
      .string()
      .trim()
      .regex(/^(\+88)?01[3-9]\d{8}$/, 'Enter a valid BD phone number'),
    email: z.string().trim().email().optional().or(z.literal('')).default(''),
    division: z.string().trim().min(1).max(60),
    district: z.string().trim().min(1).max(60),
    thana: z.string().trim().max(60).optional().default(''),
    address: z.string().trim().min(10).max(300),
    postalCode: z.string().trim().max(12).optional().or(z.literal('')).default(''),
  }),
  delivery: z.enum(['standard', 'express']).default('standard'),
  payment: z.enum(['bkash', 'nagad', 'cod', 'sslcommerz', 'card']),
  orderNote: z.string().max(500).optional().default(''),
})

export type OrderInput = z.infer<typeof OrderInputSchema>

export type PricedItem = {
  productId: string
  name: string
  price: number
  quantity: number
  color: string
  image: string
}

export type PricedOrder = {
  items: PricedItem[]
  subtotal: number
  deliveryFee: number
  total: number
}

/** ব্যবসায়িক নিয়ম ভাঙলে এই error — HTTP status সহ */
export class OrderError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

/**
 * Guest-safe অর্ডার লিংকের টোকেন।
 * order-success পেজে `?t=` হিসেবে যায় — এটা ছাড়া কেউ
 * অন্যের ঠিকানা/ফোন দেখতে পারবে না। Guest checkout এ
 * সেশন নেই, আর ObjectId টাইমস্ট্যাম্প-ভিত্তিক বলে
 * অনুমানযোগ্য — তাই আলাদা টোকেন দরকার।
 */
export function newAccessToken(): string {
  return nanoid(24)
}

/**
 * DB থেকে আসল প্রোডাক্ট এনে দাম হিসাব করে।
 * ক্লায়েন্টের পাঠানো price/subtotal/total সম্পূর্ণ উপেক্ষিত।
 */
export async function priceOrder(input: OrderInput): Promise<PricedOrder> {
  // একই প্রোডাক্ট+রং একাধিকবার এলে একত্র করা
  const merged = new Map<string, { productId: string; quantity: number; color: string }>()
  for (const it of input.items) {
    const key = `${it.productId}::${it.color}`
    const prev = merged.get(key)
    merged.set(key, {
      productId: it.productId,
      color: it.color,
      quantity: Math.min(MAX_QTY_PER_ITEM, (prev?.quantity ?? 0) + it.quantity),
    })
  }

  const ids = [...new Set(input.items.map((i) => i.productId))]

  const docs = await Product.find({ _id: { $in: ids }, isActive: true })
    .select('name price originalPrice isFlashSale flashSalePrice totalStock images colors')
    .lean()

  const byId = new Map(
    (docs as Record<string, unknown>[]).map((d) => [String(d._id), d])
  )

  const items: PricedItem[] = []
  let subtotal = 0

  for (const { productId, quantity, color } of merged.values()) {
    const p = byId.get(productId) as
      | {
          name: string
          price: number
          isFlashSale?: boolean
          flashSalePrice?: number
          totalStock?: number
          images?: string[]
          colors?: { name?: string; stock?: number }[]
        }
      | undefined

    if (!p) {
      throw new OrderError('One or more products are no longer available', 400)
    }

    // রংভিত্তিক স্টক: প্রোডাক্টে রং থাকলে নির্দিষ্ট রঙের স্টকই আসল সত্য।
    const colors = p.colors ?? []
    if (colors.length > 0) {
      const c = colors.find((x) => x.name === color)
      if (!color || !c) {
        throw new OrderError(`Please choose a valid color for "${p.name}"`, 400)
      }
      if ((c.stock ?? 0) < quantity) {
        throw new OrderError(`Only ${c.stock ?? 0} left of "${p.name}" (${color})`, 409)
      }
    } else if ((p.totalStock ?? 0) < quantity) {
      throw new OrderError(
        `Only ${p.totalStock ?? 0} left of "${p.name}"`,
        409
      )
    }

    const unitPrice = getDbUnitPrice(p)
    subtotal += unitPrice * quantity

    items.push({
      productId,
      name: p.name,
      price: unitPrice,
      quantity,
      color,
      image: p.images?.[0] ?? '',
    })
  }

  const baseFee = DELIVERY_FEES[input.delivery] ?? DELIVERY_FEES.standard
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : baseFee

  return { items, subtotal, deliveryFee, total: subtotal + deliveryFee }
}

export type Reserved = { id: string; qty: number; color?: string }

/**
 * Atomic স্টক রিজার্ভ।
 * - প্রোডাক্টে ওই রং থাকলে: `colors[].stock` আর `totalStock` দুটোই একসাথে কমে
 *   (শর্ত: ওই রঙের স্টক >= qty) — ফলে admin পরে edit করলেও বিক্রি হওয়া স্টক ফিরে আসে না।
 * - রং না থাকলে: শুধু `totalStock`।
 * দুজন একসাথে শেষ ব্যাগ কিনতে চাইলে একজনই পাবে।
 */
export async function reserveStock(items: PricedItem[]): Promise<Reserved[]> {
  const reserved: Reserved[] = []

  for (const item of items) {
    const color = item.color || ''

    // ১) রংভিত্তিক রিজার্ভ
    let ok = false
    let colorExists = false
    if (color) {
      const res = await Product.updateOne(
        {
          _id: item.productId,
          colors: { $elemMatch: { name: color, stock: { $gte: item.quantity } } },
        },
        { $inc: { 'colors.$.stock': -item.quantity, totalStock: -item.quantity } }
      )
      ok = res.modifiedCount === 1
      if (!ok) {
        colorExists = !!(await Product.exists({ _id: item.productId, 'colors.name': color }))
      }
    }

    // ২) রং নেই (বা 'Default') — সাধারণ totalStock
    if (!ok && !colorExists) {
      const res = await Product.updateOne(
        { _id: item.productId, totalStock: { $gte: item.quantity } },
        { $inc: { totalStock: -item.quantity } }
      )
      ok = res.modifiedCount === 1
    }

    if (!ok) {
      await releaseStock(reserved)
      throw new OrderError(`"${item.name}" just went out of stock`, 409)
    }
    reserved.push({ id: item.productId, qty: item.quantity, color })
  }

  return reserved
}

/** রিজার্ভ করা স্টক ফিরিয়ে দেওয়া (রংসহ) */
export async function releaseStock(reserved: Reserved[]) {
  if (reserved.length === 0) return
  await Promise.all(
    reserved.map(async (r) => {
      if (r.color) {
        const res = await Product.updateOne(
          { _id: r.id, 'colors.name': r.color },
          { $inc: { 'colors.$.stock': r.qty, totalStock: r.qty } }
        )
        if (res.matchedCount === 1) return
      }
      await Product.updateOne({ _id: r.id }, { $inc: { totalStock: r.qty } })
    })
  ).catch((err) => console.error('[STOCK RELEASE]', err))
}

/** বিক্রি হওয়া সংখ্যা (soldCount) বাড়ানো/কমানো — sign: 1 বা -1 */
export async function adjustSold(
  items: { productId: string; quantity: number }[],
  sign: 1 | -1 = 1
) {
  await Promise.all(
    items.map((i) =>
      Product.updateOne({ _id: i.productId }, { $inc: { soldCount: sign * i.quantity } })
    )
  ).catch((err) => console.error('[SOLD COUNT]', err))
}
