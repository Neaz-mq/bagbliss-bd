import mongoose, { Document, Model, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

// ── Address Sub-Schema ──────────────────────
const AddressSchema = new Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  addressLine: {
    type: String,
    required: true,
    trim: true,
  },
  area: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
})

// ── User Interface ──────────────────────────
export interface IUserDocument extends Document {
  name: string
  email: string
  phone?: string
  password?: string
  avatar?: string
  role: 'user' | 'admin'
  isVerified: boolean
  provider: 'credentials' | 'google' | 'facebook'
  providerId?: string
  addresses: (typeof AddressSchema)[]
  wishlist: mongoose.Types.ObjectId[]
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

// ── User Schema ─────────────────────────────
const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^(\+880|880|0)?1[3-9]\d{8}$/, 'Please enter a valid BD number'],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      enum: ['credentials', 'google', 'facebook'],
      default: 'credentials',
    },
    providerId: {
      type: String,
    },
    addresses: [AddressSchema],
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
)

// ── Indexes for fast queries ─────────────────
UserSchema.index({ email: 1 })
UserSchema.index({ role: 1 })
UserSchema.index({ createdAt: -1 })

// ── Hash password before save ────────────────
UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return
  }
  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
})

// ── Compare password method ──────────────────
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false
  return bcrypt.compare(candidatePassword, this.password)
}

// ── Export Model ─────────────────────────────
const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema)

export default User
