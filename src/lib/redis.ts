import { Redis } from '@upstash/redis'

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export default redis

export async function cached<T>(
  key:      string,
  fetcher:  () => Promise<T>,
  ttl = 300
): Promise<T> {
  try {
    const hit = await redis.get<T>(key)
    if (hit !== null) {
      console.warn(`[CACHE HIT] ${key}`)   // ← was console.log
      return hit
    }
  } catch (err) {
    console.warn('[CACHE] Redis get failed, falling through:', err)
  }

  const data = await fetcher()

  try {
    await redis.set(key, data, { ex: ttl })
    console.warn(`[CACHE SET] ${key} (ttl: ${ttl}s)`)   // ← was console.log
  } catch (err) {
    console.warn('[CACHE] Redis set failed:', err)
  }

  return data
}

export async function invalidate(...keys: string[]) {
  try {
    await Promise.all(keys.map(k => redis.del(k)))
    console.warn(`[CACHE INVALIDATED] ${keys.join(', ')}`)   // ← was console.log
  } catch (err) {
    console.warn('[CACHE] Invalidation failed:', err)
  }
}

export const CACHE_KEYS = {
  products:        'products:all',
  featuredProducts:'products:featured',
  flashSale:       'products:flash-sale',
  categories:      'categories:stats',
  adminStats:      'admin:stats',
  product:         (slug: string) => `product:${slug}`,
  shopProducts:    (params: string) => `shop:${params}`,
}