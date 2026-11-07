import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI as string

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined')
}

// NextAuth-এর MongoDB adapter এই client ব্যবহার করে।
// আগে প্রোডাকশনে প্রতি লোডে নতুন client বানানো হত আর connect() ফেল করলে
// `Unhandled Rejection` এ পুরো Node process ক্র্যাশ করত (exit status 128)।
// এখন: client একবারই তৈরি (global cache), timeout ছোট, আর ফেল করলে
// ক্র্যাশ না করে পরের কলে আবার চেষ্টা হবে।
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

function createClientPromise(): Promise<MongoClient> {
  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  })

  const promise = client.connect()

  // ফেল করলে cache মুছে দিই (পরের রিকোয়েস্ট আবার চেষ্টা করবে) এবং
  // rejection টা "handled" করি যাতে process ক্র্যাশ না করে।
  // আসল error যারা `await clientPromise` করে তারা ঠিকই পাবে।
  promise.catch((err) => {
    console.error('[MONGO CLIENT] connect failed:', err?.message ?? err)
    global._mongoClientPromise = undefined
  })

  return promise
}

const clientPromise: Promise<MongoClient> =
  global._mongoClientPromise ?? (global._mongoClientPromise = createClientPromise())

export default clientPromise