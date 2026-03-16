import { isIP } from 'net'

// NOTE: This store is in-memory and scoped to a single server instance.
// In serverless/multi-instance deployments it is not shared across instances or
// regions and resets on cold starts. Treat this as best-effort protection.
// For strong production guarantees swap the store for a shared backend such as
// Redis, Vercel KV, or Upstash.
const store = globalThis.__rateLimitStore ?? new Map()

if (!globalThis.__rateLimitStore) {
  globalThis.__rateLimitStore = store
}

const getClientIp = (req) => {
  const headers = req?.headers || {}

  const parseIp = (value) => {
    if (typeof value !== 'string' || !value.trim()) return null
    const parts = value.split(',').map((p) => p.trim()).filter(Boolean)
    for (let i = parts.length - 1; i >= 0; i--) {
      if (isIP(parts[i])) return parts[i]
    }
    return null
  }

  return (
    parseIp(headers['x-vercel-forwarded-for']) ||
    parseIp(headers['x-real-ip']) ||
    parseIp(headers['x-forwarded-for'] || headers['X-Forwarded-For']) ||
    req?.socket?.remoteAddress ||
    'unknown'
  )
}

const CLEANUP_INTERVAL_MS = 1_000
let lastCleanupTime = 0

const cleanupExpiredEntries = (now) => {
  if (now - lastCleanupTime < CLEANUP_INTERVAL_MS) return
  lastCleanupTime = now
  for (const [key, value] of store.entries()) {
    if (value.resetAt <= now) {
      store.delete(key)
    }
  }
}

export const checkRateLimit = (req, {
  keyPrefix,
  maxRequests,
  windowMs,
  message = 'Too many requests. Please try again later.',
}) => {
  if (process.env.NODE_ENV === 'test') {
    return null
  }

  const now = Date.now()
  cleanupExpiredEntries(now)

  const clientIp = getClientIp(req)
  const key = `${keyPrefix}:${clientIp}`
  const current = store.get(key)

  if (!current || current.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    })
    return null
  }

  if (current.count >= maxRequests) {
    return {
      statusCode: 429,
      body: {
        error: message,
      },
    }
  }

  current.count += 1
  store.set(key, current)
  return null
}
