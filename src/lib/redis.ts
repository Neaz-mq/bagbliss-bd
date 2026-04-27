import { Redis } from '@upstash/redis'

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export default redis

// ── Helper: cache wrapper ─────────────────────────────────────────────────
export async function cached<T>(
  key:      string,
  fetcher:  () => Promise<T>,
  ttl = 300 // seconds (default 5 min)
): Promise<T> {
  try {
    const hit = await redis.get<T>(key)
    if (hit !== null) {
      console.log(`[CACHE HIT] ${key}`)
      return hit
    }
  } catch (err) {
    console.warn('[CACHE] Redis get failed, falling through:', err)
  }

  const data = await fetcher()

  try {
    await redis.set(key, data, { ex: ttl })
    console.log(`[CACHE SET] ${key} (ttl: ${ttl}s)`)
  } catch (err) {
    console.warn('[CACHE] Redis set failed:', err)
  }

  return data
}

// ── Helper: invalidate cache keys ─────────────────────────────────────────
export async function invalidate(...keys: string[]) {
  try {
    await Promise.all(keys.map(k => redis.del(k)))
    console.log(`[CACHE INVALIDATED] ${keys.join(', ')}`)
  } catch (err) {
    console.warn('[CACHE] Invalidation failed:', err)
  }
}

// ── Cache key constants ───────────────────────────────────────────────────
export const CACHE_KEYS = {
  products:        'products:all',
  featuredProducts:'products:featured',
  flashSale:       'products:flash-sale',
  categories:      'categories:stats',
  adminStats:      'admin:stats',
  product:         (slug: string) => `product:${slug}`,
  shopProducts:    (params: string) => `shop:${params}`,
}