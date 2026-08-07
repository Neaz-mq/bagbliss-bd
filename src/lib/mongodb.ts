import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI as string

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in environment variables')
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// `mongoose` নামের বদলে আলাদা নাম — প্যাকেজের সাথে সংঘর্ষ এড়াতে
declare global {
  var _mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache =
  global._mongooseCache ?? { conn: null, promise: null }

if (!global._mongooseCache) {
  global._mongooseCache = cached
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: 'bagbliss',
      maxPoolSize: 10,           // serverless এ ছোট pool
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts)
  }

  try {
    cached.conn = await cached.promise
  } catch (error) {
    cached.promise = null
    throw error
  }

  return cached.conn
}

export default connectDB