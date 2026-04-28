import mongoose from 'mongoose'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const MONGODB_URI = process.env.MONGODB_URI!
if (!MONGODB_URI) { console.error('❌ MONGODB_URI missing'); process.exit(1) }

// ── Schema ────────────────────────────────────────────────────────────────────

const ProductSchema = new mongoose.Schema({
  name:             String,
  slug:             { type: String, unique: true },
  description:      String,
  shortDescription: String,
  price:            Number,
  originalPrice:    Number,
  category:         String,
  images:           [String],
  colors:           [{ name: String, hex: String, stock: Number }],
  totalStock:       Number,
  isActive:         { type: Boolean, default: true },
  isFeatured:       { type: Boolean, default: false },
  isFlashSale:      { type: Boolean, default: false },
  flashSalePrice:   { type: Number,  default: 0 },
  rating:           { type: Number,  default: 4.5 },
  reviewCount:      { type: Number,  default: 0 },
  soldCount:        { type: Number,  default: 0 },
  tags:             [String],
}, { timestamps: true })

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema)

// ── Product Data ──────────────────────────────────────────────────────────────

const PRODUCTS = [
  // ── Mini Crossbody ─────────────────────────────────────────────────────────
  {
    name:             'Rosé Mini Crossbody Bag',
    slug:             'rose-mini-crossbody-bag',
    shortDescription: 'Compact & chic — perfect for a night out or daily errands.',
    description:      'The Rosé Mini Crossbody is crafted from premium vegan leather with gold-tone hardware. Features an adjustable strap, one main zip compartment, and a front slip pocket. Fits your phone, cards, keys, and lip balm — everything you need, nothing you don\'t.',
    price:            850,
    originalPrice:    1200,
    category:         'mini-crossbody',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    ],
    colors: [
      { name: 'Dusty Rose',  hex: '#d4a0a0', stock: 15 },
      { name: 'Cream White', hex: '#f5f0e8', stock: 10 },
      { name: 'Midnight Black', hex: '#1a1a1a', stock: 20 },
    ],
    totalStock:  45,
    isFeatured:  true,
    isFlashSale: true,
    flashSalePrice: 680,
    rating:      4.8,
    reviewCount: 124,
    soldCount:   89,
    tags: ['trending', 'bestseller', 'mini', 'vegan-leather'],
  },

  {
    name:             'Pearl Mini Saddle Bag',
    slug:             'pearl-mini-saddle-bag',
    shortDescription: 'Vintage-inspired saddle silhouette with modern finish.',
    description:      'Inspired by classic equestrian style, the Pearl Mini Saddle Bag features a structured body, flap closure with magnetic snap, and a detachable crossbody strap. Made from soft grain PU leather with antique brass hardware.',
    price:            950,
    originalPrice:    1400,
    category:         'mini-crossbody',
    images: [
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80',
    ],
    colors: [
      { name: 'Pearl White', hex: '#f8f4ef', stock: 12 },
      { name: 'Caramel',     hex: '#c4853a', stock: 8  },
      { name: 'Forest Green',hex: '#2d5a3d', stock: 6  },
    ],
    totalStock:  26,
    isFeatured:  true,
    rating:      4.7,
    reviewCount: 86,
    soldCount:   54,
    tags: ['saddle-bag', 'vintage', 'mini', 'structured'],
  },

  {
    name:             'Candy Mini Flap Bag',
    slug:             'candy-mini-flap-bag',
    shortDescription: 'Sweet, playful & perfect for everyday wear.',
    description:      'The Candy Mini Flap Bag is your everyday companion — lightweight, compact, and irresistibly cute. Features quilted detailing, a secure flap closure, interior card slots, and an adjustable chain strap that can double as a wrist bag.',
    price:            750,
    originalPrice:    1000,
    category:         'mini-crossbody',
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80',
      'https://images.unsplash.com/photo-1575032617751-6ddec2089882?w=600&q=80',
    ],
    colors: [
      { name: 'Baby Pink',   hex: '#f7c5d5', stock: 20 },
      { name: 'Sky Blue',    hex: '#a8d8ea', stock: 15 },
      { name: 'Lavender',    hex: '#c8a8e9', stock: 10 },
      { name: 'Mint Green',  hex: '#a8e6cf', stock: 8  },
    ],
    totalStock:  53,
    isFeatured:  true,
    isFlashSale: true,
    flashSalePrice: 590,
    rating:      4.9,
    reviewCount: 201,
    soldCount:   167,
    tags: ['quilted', 'flap', 'everyday', 'cute', 'bestseller'],
  },

  {
    name:             'Luna Crescent Mini Bag',
    slug:             'luna-crescent-mini-bag',
    shortDescription: 'Moon-shaped statement piece for the fashion-forward.',
    description:      'The Luna Crescent Mini Bag is a conversation starter. Its unique half-moon silhouette is crafted from smooth faux leather with a zip-top closure and detachable wrist strap. Compact enough for essentials, bold enough to turn heads.',
    price:            890,
    originalPrice:    1150,
    category:         'mini-crossbody',
    images: [
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80',
    ],
    colors: [
      { name: 'Ivory',       hex: '#fffff0', stock: 10 },
      { name: 'Terracotta',  hex: '#c4714a', stock: 8  },
      { name: 'Sage',        hex: '#9caf88', stock: 5  },
    ],
    totalStock:  23,
    rating:      4.6,
    reviewCount: 43,
    soldCount:   31,
    tags: ['crescent', 'statement', 'unique', 'wristlet'],
  },

  // ── Chain Strap ────────────────────────────────────────────────────────────
  {
    name:             'Aurum Chain Shoulder Bag',
    slug:             'aurum-chain-shoulder-bag',
    shortDescription: 'Gold chain strap that elevates any outfit instantly.',
    description:      'The Aurum Chain Shoulder Bag features a luxurious gold-tone chain strap with a sleek quilted body. The interior is lined with soft satin and has a zip pocket and two open pockets. Perfect for both day and evening wear.',
    price:            1100,
    originalPrice:    1600,
    category:         'chain-strap',
    images: [
      'https://images.unsplash.com/photo-1614179924047-e1ab49a0a0cf?w=600&q=80',
      'https://images.unsplash.com/photo-1592842232655-e5d345f4a082?w=600&q=80',
    ],
    colors: [
      { name: 'Black',       hex: '#1a1a1a', stock: 18 },
      { name: 'Champagne',   hex: '#e8d5b0', stock: 12 },
      { name: 'Blush Pink',  hex: '#f2b8c6', stock: 10 },
    ],
    totalStock:  40,
    isFeatured:  true,
    isFlashSale: true,
    flashSalePrice: 850,
    rating:      4.8,
    reviewCount: 156,
    soldCount:   112,
    tags: ['chain-strap', 'quilted', 'gold', 'luxury', 'bestseller'],
  },

  {
    name:             'Stella Chain Clutch',
    slug:             'stella-chain-clutch',
    shortDescription: 'Minimalist clutch with a delicate silver chain.',
    description:      'Clean lines and understated elegance define the Stella Chain Clutch. Features a slim rectangular body, magnetic closure, silver-tone chain strap, and interior card slots. Goes from office to dinner effortlessly.',
    price:            980,
    originalPrice:    1300,
    category:         'chain-strap',
    images: [
      'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=600&q=80',
    ],
    colors: [
      { name: 'Silver',      hex: '#c0c0c0', stock: 14 },
      { name: 'Navy Blue',   hex: '#1e3a5f', stock: 10 },
      { name: 'Burgundy',    hex: '#800020', stock: 8  },
    ],
    totalStock:  32,
    rating:      4.6,
    reviewCount: 72,
    soldCount:   58,
    tags: ['clutch', 'silver-chain', 'minimalist', 'office'],
  },

  {
    name:             'Dior-Style Chain Bag',
    slug:             'dior-style-chain-bag',
    shortDescription: 'Designer-inspired look at a fraction of the price.',
    description:      'Inspired by high-fashion silhouettes, this structured flap bag features intricate stitching, a chunky gold chain, CC-style clasp closure, and a fully lined interior. Look like a million taka without spending it.',
    price:            1350,
    originalPrice:    1800,
    category:         'chain-strap',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
    ],
    colors: [
      { name: 'Classic Black', hex: '#0a0a0a', stock: 20 },
      { name: 'Beige',         hex: '#d4c5a9', stock: 15 },
      { name: 'Red',           hex: '#cc2200', stock: 6  },
    ],
    totalStock:  41,
    isFeatured:  true,
    rating:      4.9,
    reviewCount: 234,
    soldCount:   198,
    tags: ['designer-inspired', 'structured', 'flap', 'luxury-look'],
  },

  // ── Leather ────────────────────────────────────────────────────────────────
  {
    name:             'Milano Genuine Leather Mini Bag',
    slug:             'milano-genuine-leather-mini-bag',
    shortDescription: 'Real leather, real quality — made to last a lifetime.',
    description:      'The Milano is crafted from 100% genuine cowhide leather that gets better with age. Features a zip-top closure, interior zip pocket, and a 24-inch adjustable strap. The structured silhouette holds its shape while the leather softens over time.',
    price:            2200,
    originalPrice:    2800,
    category:         'leather',
    images: [
      'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80',
    ],
    colors: [
      { name: 'Tan',         hex: '#c4853a', stock: 8  },
      { name: 'Dark Brown',  hex: '#3d2314', stock: 6  },
      { name: 'Black',       hex: '#1a1a1a', stock: 10 },
    ],
    totalStock:  24,
    isFeatured:  true,
    rating:      4.9,
    reviewCount: 89,
    soldCount:   67,
    tags: ['genuine-leather', 'premium', 'investment-piece', 'durable'],
  },

  {
    name:             'Vintage Leather Bucket Bag',
    slug:             'vintage-leather-bucket-bag',
    shortDescription: 'Roomy bucket style with genuine leather & drawstring top.',
    description:      'The Vintage Leather Bucket Bag offers effortless boho-chic style. Made from soft pebbled leather with a drawstring closure, leather tassel, and adjustable shoulder strap. Interior has one zip pocket and two slip pockets.',
    price:            1850,
    originalPrice:    2400,
    category:         'leather',
   images: [
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',  // ← works
  ],
    colors: [
      { name: 'Cognac',      hex: '#9b5523', stock: 7  },
      { name: 'Olive',       hex: '#4a5240', stock: 5  },
      { name: 'Cream',       hex: '#f5f0e8', stock: 4  },
    ],
    totalStock:  16,
    rating:      4.7,
    reviewCount: 51,
    soldCount:   38,
    tags: ['bucket-bag', 'boho', 'leather', 'drawstring', 'roomy'],
  },

  // ── Canvas ─────────────────────────────────────────────────────────────────
  {
    name:             'Bloom Canvas Tote Mini',
    slug:             'bloom-canvas-tote-mini',
    shortDescription: 'Lightweight canvas with a floral print — fresh & casual.',
    description:      'The Bloom Canvas Tote Mini is made from heavy-duty washed canvas with a playful floral print. Features reinforced handles, a magnetic snap closure, and an interior zip pocket. Machine washable for easy care.',
    price:            650,
    originalPrice:    850,
    category:         'canvas',
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80',
    ],
    colors: [
      { name: 'White Floral', hex: '#fafafa', stock: 25 },
      { name: 'Blue Floral',  hex: '#7eb8d4', stock: 18 },
      { name: 'Pink Floral',  hex: '#f2b8c6', stock: 20 },
    ],
    totalStock:  63,
    isFeatured:  true,
    isFlashSale: true,
    flashSalePrice: 490,
    rating:      4.7,
    reviewCount: 143,
    soldCount:   119,
    tags: ['canvas', 'floral', 'casual', 'washable', 'lightweight'],
  },

  {
    name:             'Urban Canvas Crossbody',
    slug:             'urban-canvas-crossbody',
    shortDescription: 'Durable waxed canvas for the modern city girl.',
    description:      'Built for the urban explorer, the Urban Canvas Crossbody is made from waterproof waxed canvas with YKK zippers. Features a padded back panel, multiple organizational pockets, and a wide adjustable strap. Perfect for commuting and travel.',
    price:            780,
    originalPrice:    1000,
    category:         'canvas',
    images: [
      'https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=600&q=80',
    ],
    colors: [
      { name: 'Slate Grey',  hex: '#708090', stock: 15 },
      { name: 'Army Green',  hex: '#4a5240', stock: 12 },
      { name: 'Navy',        hex: '#1e3a5f', stock: 10 },
    ],
    totalStock:  37,
    rating:      4.6,
    reviewCount: 68,
    soldCount:   52,
    tags: ['waxed-canvas', 'waterproof', 'urban', 'commuter', 'travel'],
  },

  // ── Party & Evening ────────────────────────────────────────────────────────
  {
    name:             'Glitter Star Evening Clutch',
    slug:             'glitter-star-evening-clutch',
    shortDescription: 'Sparkle all night with this show-stopping evening clutch.',
    description:      'Turn heads at every party with the Glitter Star Evening Clutch. Covered in fine glitter fabric with a star-shaped clasp, satin interior, and detachable chain strap. Fits your phone, cards, and lip gloss — everything you need to shine.',
    price:            890,
    originalPrice:    1200,
    category:         'party',
    images: [
      'https://images.unsplash.com/photo-1575032617751-6ddec2089882?w=600&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80',
    ],
    colors: [
      { name: 'Gold Glitter',   hex: '#ffd700', stock: 12 },
      { name: 'Silver Glitter', hex: '#c0c0c0', stock: 10 },
      { name: 'Rose Gold',      hex: '#b76e79', stock: 8  },
      { name: 'Midnight Blue',  hex: '#191970', stock: 6  },
    ],
    totalStock:  36,
    isFeatured:  true,
    isFlashSale: true,
    flashSalePrice: 690,
    rating:      4.8,
    reviewCount: 178,
    soldCount:   145,
    tags: ['glitter', 'party', 'evening', 'clutch', 'sparkle', 'gift'],
  },

  {
    name:             'Velvet Bow Evening Bag',
    slug:             'velvet-bow-evening-bag',
    shortDescription: 'Luxe velvet with an oversized bow — pure elegance.',
    description:      'The Velvet Bow Evening Bag exudes old-Hollywood glamour. Crafted from rich crushed velvet with a signature oversized bow, gold frame closure, and a matching velvet chain strap. The satin-lined interior has a small mirror and zip pocket.',
    price:            1050,
    originalPrice:    1400,
    category:         'party',
    images: [
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80',
    ],
    colors: [
      { name: 'Deep Burgundy', hex: '#800020', stock: 8  },
      { name: 'Emerald',       hex: '#2d6a4f', stock: 6  },
      { name: 'Black Velvet',  hex: '#0a0a0a', stock: 10 },
      { name: 'Dusty Rose',    hex: '#d4a0a0', stock: 7  },
    ],
    totalStock:  31,
    isFeatured:  true,
    rating:      4.9,
    reviewCount: 93,
    soldCount:   78,
    tags: ['velvet', 'bow', 'evening', 'glamour', 'wedding', 'gift'],
  },

  {
    name:             'Crystal Frame Minaudière',
    slug:             'crystal-frame-minaudiere',
    shortDescription: 'Hand-beaded crystals on a vintage gold frame — unforgettable.',
    description:      'The Crystal Frame Minaudière is a true heirloom piece. Each bag is hand-beaded with glass crystals on a solid brass frame with a kisslock closure. Comes with a detachable pearl chain strap. Perfect for weddings, galas, and special events.',
    price:            1550,
    originalPrice:    2000,
    category:         'party',
    images: [
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80',
    ],
    colors: [
      { name: 'Crystal Clear', hex: '#e8f4f8', stock: 5  },
      { name: 'Pearl White',   hex: '#f8f4ef', stock: 4  },
      { name: 'Midnight Black',hex: '#1a1a1a', stock: 6  },
    ],
    totalStock:  15,
    rating:      5.0,
    reviewCount: 34,
    soldCount:   28,
    tags: ['crystal', 'beaded', 'minaudiere', 'wedding', 'luxury', 'gala'],
  },
]

// ── Seed Function ──────────────────────────────────────────────────────────────

async function seed() {
  console.log('🔌 Connecting to MongoDB...')
  await mongoose.connect(MONGODB_URI)
  console.log('✅ Connected!\n')

  // Count existing
  const existing = await Product.countDocuments()

  if (existing > 0) {
    console.log(`⚠️  Found ${existing} existing products.`)
    console.log('   Options:')
    console.log('   • Pass --reset to delete all and re-seed')
    console.log('   • Pass --append to add new products only\n')

    const args = process.argv.slice(2)

    if (args.includes('--reset')) {
      await Product.deleteMany({})
      console.log('🗑️  Cleared all existing products.\n')
    } else if (args.includes('--append')) {
      console.log('📎 Appending new products only...\n')
      const existingSlugs = (await Product.find({}, 'slug').lean()).map((p: { slug?: string }) => p.slug)
      const toInsert = PRODUCTS.filter(p => !existingSlugs.includes(p.slug))

      if (toInsert.length === 0) {
        console.log('✅ All products already exist. Nothing to add.')
        await mongoose.disconnect()
        return
      }

      await Product.insertMany(toInsert)
      console.log(`✅ Added ${toInsert.length} new products!\n`)
      await mongoose.disconnect()
      return
    } else {
      console.log('Exiting without changes. Use --reset or --append flag.')
      await mongoose.disconnect()
      return
    }
  }

  // Insert
  console.log(`📦 Seeding ${PRODUCTS.length} products...`)
  const result = await Product.insertMany(PRODUCTS)
  console.log(`\n✅ Successfully seeded ${result.length} products!\n`)

  // Summary
  const cats: Record<string, number> = {}
  PRODUCTS.forEach(p => { cats[p.category] = (cats[p.category] || 0) + 1 })
  const featured   = PRODUCTS.filter(p => p.isFeatured).length
  const flashSale  = PRODUCTS.filter(p => p.isFlashSale).length

  console.log('📊 Summary:')
  Object.entries(cats).forEach(([cat, count]) => {
    console.log(`   ${cat.padEnd(20)} ${count} products`)
  })
  console.log(`   ${'featured'.padEnd(20)} ${featured} products`)
  console.log(`   ${'flash sale'.padEnd(20)} ${flashSale} products`)
  console.log(`   ${'total'.padEnd(20)} ${PRODUCTS.length} products\n`)

  await mongoose.disconnect()
  console.log('👋 Done! Go check your store at http://localhost:3000/shop\n')
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message)
  process.exit(1)
})