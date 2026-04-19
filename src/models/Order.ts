// src/models/Order.ts
import mongoose, { Schema, Document } from 'mongoose'

export interface IOrder extends Document {
  userId?: string
  guestEmail?: string
  orderNumber: string
  items: {
    productId: string
    name: string
    price: number
    quantity: number
    color: string
    image?: string
  }[]
  shipping: {
    fullName: string
    phone: string
    email?: string
    division: string
    district: string
    thana: string
    address: string
    postalCode?: string
  }
  delivery: string
  deliveryFee: number
  payment: string
  subtotal: number
  total: number
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled'
  orderNote?: string
  createdAt: Date
}

const OrderSchema = new Schema<IOrder>(
  {
    userId:     { type: String, index: true },
    guestEmail: { type: String },
    orderNumber:{ type: String, required: true, unique: true },
    items: [
      {
        productId: String,
        name:      String,
        price:     Number,
        quantity:  Number,
        color:     String,
        image:     String,
      },
    ],
    shipping: {
      fullName:   String,
      phone:      String,
      email:      String,
      division:   String,
      district:   String,
      thana:      String,
      address:    String,
      postalCode: String,
    },
    delivery:    { type: String, default: 'standard' },
    deliveryFee: { type: Number, default: 60 },
    payment:     { type: String, default: 'cod' },
    subtotal:    { type: Number, required: true },
    total:       { type: Number, required: true },
    status:      { type: String, default: 'processing' },
    orderNote:   String,
  },
  { timestamps: true }
)

export default mongoose.models.Order ||
  mongoose.model<IOrder>('Order', OrderSchema)