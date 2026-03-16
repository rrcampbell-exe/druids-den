import { track } from '@vercel/analytics'

const ALLOWED_TYPES = new Set(['string', 'number', 'boolean'])

const sanitizePayload = (payload = {}) => {
  if (!payload || typeof payload !== 'object') {
    return undefined
  }

  const sanitized = {}

  for (const [key, value] of Object.entries(payload)) {
    if (value === null || value === undefined) {
      continue
    }

    if (ALLOWED_TYPES.has(typeof value)) {
      sanitized[key] = value
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined
}

export const trackEvent = (eventName, payload = {}) => {
  if (typeof window === 'undefined' || !eventName) {
    return
  }

  try {
    const sanitizedPayload = sanitizePayload(payload)
    track(eventName, sanitizedPayload)
  } catch (error) {
    // Keep analytics failures from affecting user flows.
    console.error('Analytics track failed:', error)
  }
}
