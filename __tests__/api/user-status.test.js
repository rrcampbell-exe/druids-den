import { describe, it, expect, beforeEach, vi } from 'vitest'
import handler from '../../api/user/status'

const { checkRateLimitMock } = vi.hoisted(() => ({
  checkRateLimitMock: vi.fn(),
}))

vi.mock('../../api/_utils/auth.js', () => ({
  getCurrentUser: vi.fn(),
  getErrorResponse: (error, fallbackMessage = 'Internal server error') => ({
    statusCode: error?.statusCode || 500,
    body: {
      error: error?.message || fallbackMessage,
    },
  }),
}))

vi.mock('../../api/_utils/rateLimit.js', () => ({
  checkRateLimit: checkRateLimitMock,
}))

import { getCurrentUser } from '../../api/_utils/auth.js'

describe('user status API', () => {
  let req
  let res

  beforeEach(() => {
    vi.clearAllMocks()
    checkRateLimitMock.mockReturnValue(null)
    req = { method: 'GET' }
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }
  })

  it('returns the serialized current user', async () => {
    getCurrentUser.mockResolvedValue({
      user: {
        id: 'user-1',
        clerkId: 'clerk-1',
        email: 'guest@example.com',
        firstName: 'Guest',
        lastName: 'User',
        phone: null,
        role: 'GUEST',
        accountStatus: 'APPROVED',
        accountStatusChangedAt: new Date('2026-03-14T00:00:00.000Z'),
        accountStatusChangedBy: 'owner-1',
        marketingOptIn: false,
        preferredContactMethod: 'EMAIL',
        createdAt: new Date('2026-03-01T00:00:00.000Z'),
        updatedAt: new Date('2026-03-14T00:00:00.000Z'),
      },
    })

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      user: expect.objectContaining({
        id: 'user-1',
        clerkId: 'clerk-1',
        accountStatus: 'APPROVED',
      }),
    })
  })

  it('rejects unsupported methods', async () => {
    req.method = 'POST'

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' })
  })

  it('uses the shared auth error helper for failures', async () => {
    getCurrentUser.mockRejectedValue(new Error('Authentication required'))

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' })
  })

  it('returns 429 when rate limit is exceeded', async () => {
    checkRateLimitMock.mockReturnValueOnce({
      statusCode: 429,
      body: { error: 'Too many account status checks. Please try again shortly.' },
    })

    await handler(req, res)

    expect(getCurrentUser).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(429)
    expect(res.json).toHaveBeenCalledWith({
      error: 'Too many account status checks. Please try again shortly.',
    })
  })
})
