import { useCallback, useRef } from 'react'

const LIMITS = {
  thread: { max: 3, windowMs: 60_000 },   // 3 threads per minute
  comment: { max: 10, windowMs: 60_000 },  // 10 comments per minute
}

/**
 * Client-side rate limiter for forum actions.
 * Stores timestamps in memory (resets on page refresh — the real enforcement is server-side RLS).
 *
 * Usage:
 *   const { checkLimit } = useRateLimit()
 *   const allowed = checkLimit('thread')   // returns { ok: true } or { ok: false, retryAfterMs }
 */
export function useRateLimit() {
  const stamps = useRef({ thread: [], comment: [] })

  const checkLimit = useCallback((action) => {
    const cfg = LIMITS[action]
    if (!cfg) return { ok: true }

    const now = Date.now()
    const bucket = stamps.current[action]

    // Purge entries outside the window
    const recent = bucket.filter((t) => now - t < cfg.windowMs)
    stamps.current[action] = recent

    if (recent.length >= cfg.max) {
      const oldest = recent[0]
      const retryAfterMs = cfg.windowMs - (now - oldest)
      return { ok: false, retryAfterMs }
    }

    // Record this action
    recent.push(now)
    return { ok: true }
  }, [])

  return { checkLimit }
}

export default useRateLimit
