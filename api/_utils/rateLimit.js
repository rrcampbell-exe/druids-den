const store = globalThis.__rateLimitStore ?? new Map()

if (!globalThis.__rateLimitStore) {
  globalThis.__rateLimitStore = store
}

const getClientIp = (req) => {
  const forwardedFor = req?.headers?.['x-forwarded-for'] || req?.headers?.['X-Forwarded-For']

  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim()
  }

  return req?.socket?.remoteAddress || 'unknown'
}

const cleanupExpiredEntries = (now) => {
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
