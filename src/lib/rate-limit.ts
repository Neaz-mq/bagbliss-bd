import redis from '@/lib/redis'

interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
}

/**
 * Fixed-window rate limiter backed by Redis (Upstash).
 *
 * Fails OPEN (allows the request through) if Redis is unreachable —
 * an outage in the caching layer should never be able to lock every
 * user out of login/registration.
 */
export async function rateLimit(
  identifier: string,
  limit = 10,
  window = 60 // seconds
): Promise<RateLimitResult> {
  const key = `rate_limit:${identifier}`
  const now = Date.now()

  try {
    const current = await redis.incr(key)

    if (current === 1) {
      await redis.expire(key, window)
    }

    const ttl = await redis.ttl(key)
    const remaining = Math.max(0, limit - current)

    return {
      success: current <= limit,
      remaining,
      reset: now + Math.max(ttl, 0) * 1000,
    }
  } catch {
    return { success: true, remaining: limit, reset: now + window * 1000 }
  }
}

/**
 * Clears a rate-limit counter. Call this after a *successful* auth so a
 * legitimate user isn't penalized for earlier failed attempts (their own
 * typo, or noisy neighbours behind a shared office/campus NAT).
 */
export async function resetRateLimit(identifier: string): Promise<void> {
  try {
    await redis.del(`rate_limit:${identifier}`)
  } catch {
    // best-effort only — never let cleanup break a successful login
  }
}

/**
 * Best-effort client IP extraction behind a proxy/CDN (Vercel, Railway, etc).
 * `x-forwarded-for` can hold a comma-separated chain — the first entry is
 * the original client.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim()
    if (first) return first
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  return 'unknown'
}
