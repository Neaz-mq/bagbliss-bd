import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IProductDocument extends Document {
  name: string
  slug: string
  description: string
  price: number
  comparePrice?: number
  images: string[]
  category: string
  tags: string[]
  stock: number
  sku?: string
  isActive: boolean
  isFeatured: boolean
  flashSale?: {
    isActive: boolean
    discountPercent: number
    endsAt: Date
  }
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProductDocument>(
  {
    name:         { type: String, required: true, trim: true },
    slug:         { type: String, required: true, unique: true, lowercase: true, trim: true },
    description:  { type: String, required: true },
    price:        { type: Number, required: true, min: 0 },
    comparePrice: { type: Number },
    images:       [{ type: String }],
    category:     { type: String, required: true, trim: true },
    tags:         [{ type: String, trim: true }],
    stock:        { type: Number, required: true, default: 0, min: 0 },
    sku:          { type: String, trim: true, sparse: true },
    isActive:     { type: Boolean, default: true },
    isFeatured:   { type: Boolean, default: false },
    flashSale: {
      isActive:        { type: Boolean, default: false },
      discountPercent: { type: Number, min: 0, max: 100 },
      endsAt:          { type: Date },
    },
  },
  { timestamps: true }
)

ProductSchema.index({ name: 'text', description: 'text' })
ProductSchema.index({ slug: 1 })
ProductSchema.index({ category: 1 })
ProductSchema.index({ isActive: 1 })
ProductSchema.index({ createdAt: -1 })

const Product: Model<IProductDocument> =
  mongoose.models.Product ||
  mongoose.model<IProductDocument>('Product', ProductSchema)

export default Product