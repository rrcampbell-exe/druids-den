import { track } from '@vercel/analytics/server'

const ALLOWED_TYPES = new Set(['string', 'number', 'boolean'])
// Only forward non-sensitive request headers needed for attribution.
const ALLOWED_HEADER_NAMES = new Set([
  'user-agent',
  'referer',
  'referrer',
  'x-forwarded-for',
  'x-real-ip',
  'accept-language',
])
const SENSITIVE_HEADER_NAMES = new Set([
  'cookie',
  'set-cookie',
  'authorization',
  'proxy-authorization',
  'x-api-key',
  'x-auth-token',
])

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

const buildHeadersFromRequest = (req) => {
  if (!req?.headers || typeof req.headers !== 'object') {
    return undefined
  }

  const headers = {}

  for (const [key, value] of Object.entries(req.headers)) {
    const normalizedKey = String(key).toLowerCase()

    if (SENSITIVE_HEADER_NAMES.has(normalizedKey)) {
      continue
    }

    if (!ALLOWED_HEADER_NAMES.has(normalizedKey)) {
      continue
    }

    if (Array.isArray(value)) {
      const filtered = value.filter((entry) => typeof entry === 'string')
      if (filtered.length > 0) {
        headers[normalizedKey] = filtered
      }
      continue
    }

    if (typeof value === 'string') {
      headers[normalizedKey] = value
    }
  }

  return Object.keys(headers).length > 0 ? headers : undefined
}

export const trackServerEvent = async (eventName, payload = {}, req) => {
  if (!eventName) {
    return
  }

  try {
    const properties = sanitizePayload(payload)
    const headers = buildHeadersFromRequest(req)
    await track(eventName, properties, headers ? { request: { headers } } : undefined)
  } catch (error) {
    // Keep analytics failures from affecting API/webhook processing.
    console.error('Server analytics track failed:', error)
  }
}
