import mongoose, { Schema } from 'mongoose'

const OrderItemSchema = new Schema({
  productId: { type: String, required: true },
  name:      { type: String, required: true },
  price:     { type: Number, required: true },
  quantity:  { type: Number, required: true, min: 1 },
  color:     { type: String, default: '' },
  image:     { type: String, default: '' },
}, { _id: false })

const ShippingSchema = new Schema({
  fullName:   { type: String, required: true },
  phone:      { type: String, required: true },
  email:      { type: String, default: '' },
  division:   { type: String, required: true },
  district:   { type: String, required: true },
  thana:      { type: String, default: '' },
  address:    { type: String, required: true },
  postalCode: { type: String, default: '' },
}, { _id: false })

const OrderSchema = new Schema({
  orderNumber:   { type: String, required: true, unique: true },
  userId:        { type: String, default: null },
  guestEmail:    { type: String, default: null },
  items:         [OrderItemSchema],
  shipping:      { type: ShippingSchema, required: true },
  delivery:      { type: String, default: 'standard' },
  deliveryFee:   { type: Number, default: 60 },
  payment:       { type: String, enum: ['bkash', 'nagad', 'cod', 'sslcommerz', 'card'], default: 'cod' },
  subtotal:      { type: Number, required: true },
  discount:      { type: Number, default: 0 },
  total:         { type: Number, required: true },
  status:        { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'], default: 'pending' },
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'failed', 'cancelled', 'refunded'], default: 'unpaid' },
  orderNote:     { type: String, default: '' },
  tranId:        { type: String, default: null },
  sslTranId:     { type: String, default: null },
  valId:         { type: String, default: null },
  cardType:      { type: String, default: null },
  bankTranId:    { type: String, default: null },
  currency:      { type: String, default: 'BDT' },
}, { timestamps: true })

// Auto-generate orderNumber
OrderSchema.pre('save', async function () {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments()
    this.orderNumber = `BB${String(count + 1).padStart(6, '0')}`
  }
})

export default mongoose.models.Order || mongoose.model('Order', OrderSchema)