import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { checkRateLimit } from '../../api/_utils/rateLimit.js'

describe('rateLimit utility', () => {
  const originalEnv = process.env.NODE_ENV

  beforeEach(() => {
    globalThis.__rateLimitStore?.clear?.()
  })

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('allows requests up to the limit and blocks the next one', () => {
    process.env.NODE_ENV = 'production'

    const req = { headers: { 'x-forwarded-for': '203.0.113.10' } }
    const options = {
      keyPrefix: 'rate-limit-test-1',
      maxRequests: 2,
      windowMs: 60_000,
    }

    expect(checkRateLimit(req, options)).toBeNull()
    expect(checkRateLimit(req, options)).toBeNull()

    expect(checkRateLimit(req, options)).toEqual({
      statusCode: 429,
      body: {
        error: 'Too many requests. Please try again later.',
      },
    })
  })

  it('resets counts after the time window', () => {
    process.env.NODE_ENV = 'production'
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-15T00:00:00.000Z'))

    const req = { headers: { 'x-forwarded-for': '203.0.113.11' } }
    const options = {
      keyPrefix: 'rate-limit-test-2',
      maxRequests: 1,
      windowMs: 1_000,
      message: 'Rate limited',
    }

    expect(checkRateLimit(req, options)).toBeNull()
    expect(checkRateLimit(req, options)).toEqual({
      statusCode: 429,
      body: {
        error: 'Rate limited',
      },
    })

    vi.setSystemTime(new Date('2026-03-15T00:00:01.100Z'))

    expect(checkRateLimit(req, options)).toBeNull()
  })

  it('bypasses limiting in test mode', () => {
    process.env.NODE_ENV = 'test'

    const req = { headers: { 'x-forwarded-for': '203.0.113.12' } }
    const options = {
      keyPrefix: 'rate-limit-test-3',
      maxRequests: 1,
      windowMs: 60_000,
    }

    expect(checkRateLimit(req, options)).toBeNull()
    expect(checkRateLimit(req, options)).toBeNull()
    expect(checkRateLimit(req, options)).toBeNull()
  })
})
