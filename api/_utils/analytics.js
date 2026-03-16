import { track } from '@vercel/analytics/server'

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

const buildHeadersFromRequest = (req) => {
  if (!req?.headers || typeof req.headers !== 'object') {
    return undefined
  }

  const headers = {}

  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      headers[key] = value.filter((entry) => typeof entry === 'string')
      continue
    }

    if (typeof value === 'string') {
      headers[key] = value
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
