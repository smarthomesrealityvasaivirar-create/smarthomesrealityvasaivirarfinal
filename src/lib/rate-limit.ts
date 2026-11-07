import 'server-only'

/**
 * Best-effort in-memory rate limiter (per server instance). Good enough to stop casual form spam on the
 * free tier. For hard guarantees use Upstash Redis or Vercel WAF rate limiting.
 */
const buckets = new Map<string, number[]>()

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const hits = (buckets.get(key) ?? []).filter(t => now - t < windowMs)
  if (hits.length >= limit) {
    buckets.set(key, hits)
    return false
  }
  hits.push(now)
  buckets.set(key, hits)
  if (buckets.size > 5000) {
    for (const [k, values] of buckets) if (values.every(t => now - t >= windowMs)) buckets.delete(k)
    // Keep active limits rather than resetting every visitor's allowance.
    while (buckets.size > 5000) buckets.delete(buckets.keys().next().value!)
  }
  return true
}
