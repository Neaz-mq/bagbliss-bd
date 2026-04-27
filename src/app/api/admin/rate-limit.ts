import redis from '@/lib/redis'

interface RateLimitResult {
  success:   boolean
  remaining: number
  reset:     number
}

export async function rateLimit(
  identifier: string,
  limit  = 10,
  window = 60   // seconds
): Promise<RateLimitResult> {
  const key   = `rate_limit:${identifier}`
  const now   = Date.now()
  const reset = now + window * 1000

  try {
    const current = await redis.incr(key)

    if (current === 1) {
      await redis.expire(key, window)
    }

    const ttl       = await redis.ttl(key)
    const remaining = Math.max(0, limit - current)

    return {
      success:   current <= limit,
      remaining,
      reset:     now + ttl * 1000,
    }
  } catch {
    // If Redis fails, allow the request through
    return { success: true, remaining: limit, reset }
  }
}