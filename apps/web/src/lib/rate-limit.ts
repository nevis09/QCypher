/**
 * Lightweight in-process rate limiter using a sliding window.
 * Sufficient for Vercel Hobby (single serverless function per request).
 * For multi-region scale, swap the Map for an Upstash Redis store.
 */

type Window = { count: number; resetAt: number }
const store = new Map<string, Window>()

const WINDOW_MS = 60_000 // 1 minute

export function rateLimit(key: string, limit: number): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  let w = store.get(key)
  if (!w || now >= w.resetAt) {
    w = { count: 0, resetAt: now + WINDOW_MS }
    store.set(key, w)
  }
  w.count++
  return { ok: w.count <= limit, remaining: Math.max(0, limit - w.count), resetAt: w.resetAt }
}

// Public endpoint limits (per IP per minute)
export const LIMITS = {
  invite_accept: 10,
  send:          20,
  login:         10,
} as const
