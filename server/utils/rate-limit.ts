const hits = new Map<string, { count: number; resetAt: number }>()

/**
 * Simple in-memory rate limiter.
 * Returns true if the request should be BLOCKED, false if allowed.
 */
export function isRateLimited(
  key: string,
  maxRequests: number,
  windowMs: number,
): boolean {
  const now = Date.now()
  const entry = hits.get(key)

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }

  entry.count++
  return entry.count > maxRequests
}

/**
 * Extract client IP from the event (works on Vercel + dev).
 */
export function getClientIp(event: any): string {
  const headers = getRequestHeaders(event)
  return (
    headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    headers['x-real-ip'] ||
    event.node?.req?.socket?.remoteAddress ||
    'unknown'
  )
}
