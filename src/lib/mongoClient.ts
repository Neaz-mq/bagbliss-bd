import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI as string

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined')
}

declare global {
 
  var _mongoClient: MongoClient | undefined
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClient) {
    client = new MongoClient(MONGODB_URI)
    global._mongoClient = client
  }
  client = global._mongoClient
  clientPromise = client.connect()
} else {
  client = new MongoClient(MONGODB_URI)
  clientPromise = client.connect()
}

export default clientPromise
