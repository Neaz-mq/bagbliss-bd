import mongoose, { Schema } from 'mongoose'

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
    category:         { type: String, required: true },
    images:           [{ type: String }],
    colors:           [ColorSchema],
    totalStock:       { type: Number, default: 0 },
    isActive:         { type: Boolean, default: true },
    isFeatured:       { type: Boolean, default: false },
    isFlashSale:      { type: Boolean, default: false },
    flashSalePrice:   { type: Number, default: 0 },
    rating:           { type: Number, default: 0 },
    reviewCount:      { type: Number, default: 0 },
    soldCount:        { type: Number, default: 0 },
    tags:             [{ type: String }],
  },
  { timestamps: true }
)

export default mongoose.models.Product ||
  mongoose.model('Product', ProductSchema)