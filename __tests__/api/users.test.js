import { describe, it, expect, beforeEach, vi } from 'vitest'
import handler from '../../api/users'

vi.mock('../../api/utils/db.js', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('../../api/utils/auth.js', () => ({
  requireRole: vi.fn().mockResolvedValue({
    user: { id: 'owner-1', role: 'OWNER', accountStatus: 'APPROVED' },
  }),
  getErrorResponse: (error, fallbackMessage = 'Internal server error') => ({
    statusCode: error?.statusCode || 500,
    body: {
      error: error?.message || fallbackMessage,
    },
  }),
}))

vi.mock('../../api/utils/emailService.js', () => ({
  sendEmail: vi.fn(),
}))

vi.mock('../../api/utils/dashboardEmailTemplates.js', () => ({
  generateAccountApprovedEmail: vi.fn().mockReturnValue({ subject: 'Approved', text: 'approved', html: '<p>approved</p>' }),
  generateAccountDeniedEmail: vi.fn().mockReturnValue({ subject: 'Denied', text: 'denied', html: '<p>denied</p>' }),
  generateAccountRevokedEmail: vi.fn().mockReturnValue({ subject: 'Revoked', text: 'revoked', html: '<p>revoked</p>' }),
}))

import { prisma } from '../../api/utils/db.js'
import { sendEmail } from '../../api/utils/emailService.js'

describe('users API', () => {
  let req
  let res

  beforeEach(() => {
    vi.clearAllMocks()
    req = { method: 'GET', body: {} }
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }
  })

  it('lists guest accounts', async () => {
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'guest-1',
        clerkId: 'clerk-1',
        email: 'guest@example.com',
        firstName: 'Guest',
        lastName: 'One',
        phone: null,
        role: 'GUEST',
        accountStatus: 'PENDING_APPROVAL',
        accountStatusChangedAt: null,
        accountStatusChangedBy: null,
        marketingOptIn: false,
        preferredContactMethod: 'EMAIL',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      },
    ])

    await handler(req, res)

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        role: 'GUEST',
      },
      orderBy: [
        { accountStatus: 'asc' },
        { createdAt: 'desc' },
      ],
    })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      users: [expect.objectContaining({ id: 'guest-1', accountStatus: 'PENDING_APPROVAL' })],
    })
  })

  it('validates patch input', async () => {
    req.method = 'PATCH'
    req.body = {}

    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'userId and accountStatus are required' })

    req.body = { userId: 'guest-1', accountStatus: 'BOGUS' }
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid account status' })
  })

  it('returns not found and role validation errors for patch requests', async () => {
    req.method = 'PATCH'
    req.body = { userId: 'guest-1', accountStatus: 'APPROVED' }

    prisma.user.findUnique.mockResolvedValueOnce(null)
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ error: 'Guest account not found' })

    prisma.user.findUnique.mockResolvedValueOnce({ id: 'owner-2', role: 'OWNER', deletedAt: null })
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Only guest accounts can be updated here' })
  })

  it('updates a guest status and sends the matching email', async () => {
    req.method = 'PATCH'
    req.body = { userId: 'guest-1', accountStatus: 'APPROVED' }

    prisma.user.findUnique.mockResolvedValue({ id: 'guest-1', role: 'GUEST', deletedAt: null })
    prisma.user.update.mockResolvedValue({
      id: 'guest-1',
      clerkId: 'clerk-1',
      email: 'guest@example.com',
      firstName: 'Guest',
      lastName: 'One',
      phone: null,
      role: 'GUEST',
      accountStatus: 'APPROVED',
      accountStatusChangedAt: new Date('2026-03-14T00:00:00.000Z'),
      accountStatusChangedBy: 'owner-1',
      marketingOptIn: false,
      preferredContactMethod: 'EMAIL',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-03-14T00:00:00.000Z'),
    })

    await handler(req, res)

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'guest-1' },
      data: {
        accountStatus: 'APPROVED',
        accountStatusChangedAt: expect.any(Date),
        accountStatusChangedBy: 'owner-1',
      },
    })
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'guest@example.com',
      subject: 'Approved',
    }))
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      user: expect.objectContaining({ id: 'guest-1', accountStatus: 'APPROVED' }),
    })
  })

  it('swallows guest email failures and still returns success', async () => {
    req.method = 'PATCH'
    req.body = { userId: 'guest-1', accountStatus: 'DENIED' }

    prisma.user.findUnique.mockResolvedValue({ id: 'guest-1', role: 'GUEST', deletedAt: null })
    prisma.user.update.mockResolvedValue({
      id: 'guest-1',
      clerkId: 'clerk-1',
      email: 'guest@example.com',
      firstName: 'Guest',
      lastName: 'One',
      phone: null,
      role: 'GUEST',
      accountStatus: 'DENIED',
      accountStatusChangedAt: new Date(),
      accountStatusChangedBy: 'owner-1',
      marketingOptIn: false,
      preferredContactMethod: 'EMAIL',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    sendEmail.mockRejectedValueOnce(new Error('email failed'))

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      user: expect.objectContaining({ accountStatus: 'DENIED' }),
    })
  })

  it('rejects unsupported methods and auth failures', async () => {
    req.method = 'DELETE'
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' })
  })
})
