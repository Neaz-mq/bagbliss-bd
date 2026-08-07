import mongoose, { Schema, type Model, type InferSchemaType } from 'mongoose'

const ColorSchema = new Schema(
  { name: String, hex: String, stock: { type: Number, default: 0 } },
  { _id: false }
)

const ProductSchema = new Schema(
  {
    name:             { type: String, required: true, trim: true },
    slug:             { type: String, required: true, unique: true, lowercase: true },
    description:      { type: String, default: '' },
    shortDescription: { type: String, default: '' },
    price:            { type: Number, required: true, min: 0 },
    originalPrice:    { type: Number, default: 0 },
    category:         { type: String, required: true, index: true },
    images:           [{ type: String }],
    colors:           [ColorSchema],
    totalStock:       { type: Number, default: 0 },
    isActive:         { type: Boolean, default: true, index: true },
    isFeatured:       { type: Boolean, default: false },
    isFlashSale:      { type: Boolean, default: false },
    flashSalePrice:   { type: Number, default: 0 },
    rating:           { type: Number, default: 0, min: 0, max: 5 },
    reviewCount:      { type: Number, default: 0 },
    soldCount:        { type: Number, default: 0 },
    tags:             [{ type: String }],
  },
  { timestamps: true }
)

// Shop page filter queries
ProductSchema.index({ isActive: 1, category: 1 })
ProductSchema.index({ isActive: 1, isFeatured: 1 })
ProductSchema.index({ isActive: 1, isFlashSale: 1 })

// Search (Fuse.js এর দরকার হবে না)
ProductSchema.index({ name: 'text', shortDescription: 'text', tags: 'text' })

export type ProductDoc = InferSchemaType<typeof ProductSchema> & {
  _id: mongoose.Types.ObjectId
}

const Product: Model<ProductDoc> =
  (mongoose.models.Product as Model<ProductDoc>) ||
  mongoose.model<ProductDoc>('Product', ProductSchema)

export default Product