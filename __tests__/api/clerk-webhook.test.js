import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'

const {
  verifyMock,
  sendEmailMock,
  upsertClerkUserMock,
  updateManyMock,
  generateNewUserNotificationEmailMock,
} = vi.hoisted(() => ({
  verifyMock: vi.fn(),
  sendEmailMock: vi.fn(),
  upsertClerkUserMock: vi.fn(),
  updateManyMock: vi.fn(),
  generateNewUserNotificationEmailMock: vi.fn().mockReturnValue({
    subject: 'New guest awaiting approval',
    text: 'text body',
    html: '<p>html body</p>',
  }),
}))

vi.mock('svix', () => ({
  Webhook: class MockWebhook {
    constructor() {}

    verify(payload, headers) {
      return verifyMock(payload, headers)
    }
  },
}))

vi.mock('../../api/utils/emailService.js', () => ({
  sendEmail: sendEmailMock,
}))

vi.mock('../../api/utils/dashboardEmailTemplates.js', () => ({
  generateNewUserNotificationEmail: generateNewUserNotificationEmailMock,
}))

vi.mock('../../api/utils/userSync.js', () => ({
  upsertClerkUser: upsertClerkUserMock,
}))

vi.mock('../../api/utils/db.js', () => ({
  prisma: {
    user: {
      updateMany: updateManyMock,
    },
  },
}))

import handler from '../../api/webhooks/clerk'

describe('Clerk webhook API', () => {
  let req
  let res
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.CLERK_WEBHOOK_SIGNING_SECRET = 'whsec_test'
    process.env.OWNER_EMAIL = 'owner@example.com'
    req = {
      method: 'POST',
      headers: {
        'svix-id': 'msg_123',
        'svix-timestamp': '1234567890',
        'svix-signature': 'sig_123',
      },
      body: { hello: 'world' },
    }
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('rejects unsupported methods', async () => {
    req.method = 'GET'

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(405)
  })

  it('requires the webhook secret and svix headers', async () => {
    delete process.env.CLERK_WEBHOOK_SIGNING_SECRET
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(500)

    process.env.CLERK_WEBHOOK_SIGNING_SECRET = 'whsec_test'
    req.headers = {}
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing Svix headers' })
  })

  it('rejects invalid webhook signatures', async () => {
    verifyMock.mockImplementationOnce(() => {
      throw new Error('invalid signature')
    })

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid webhook signature' })
  })

  it('syncs created users and emails the owner for pending guests', async () => {
    verifyMock.mockReturnValueOnce({
      type: 'user.created',
      data: { id: 'clerk-1' },
    })
    upsertClerkUserMock.mockResolvedValueOnce({
      id: 'user-1',
      email: 'guest@example.com',
      role: 'GUEST',
      accountStatus: 'PENDING_APPROVAL',
    })

    await handler(req, res)

    expect(upsertClerkUserMock).toHaveBeenCalledWith({ id: 'clerk-1' })
    expect(generateNewUserNotificationEmailMock).toHaveBeenCalled()
    expect(sendEmailMock).toHaveBeenCalledWith(expect.objectContaining({
      to: 'owner@example.com',
      subject: 'New guest awaiting approval',
    }))
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ received: true })
  })

  it('syncs updated users without emailing the owner', async () => {
    verifyMock.mockReturnValueOnce({
      type: 'user.updated',
      data: { id: 'clerk-2' },
    })
    upsertClerkUserMock.mockResolvedValueOnce({
      id: 'user-2',
      role: 'GUEST',
      accountStatus: 'APPROVED',
    })

    await handler(req, res)

    expect(upsertClerkUserMock).toHaveBeenCalledWith({ id: 'clerk-2' })
    expect(sendEmailMock).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('soft deletes users when Clerk sends user.deleted', async () => {
    verifyMock.mockReturnValueOnce({
      type: 'user.deleted',
      data: { id: 'clerk-3' },
    })

    await handler(req, res)

    expect(updateManyMock).toHaveBeenCalledWith({
      where: { clerkId: 'clerk-3' },
      data: { deletedAt: expect.any(Date) },
    })
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('returns 500 when event processing fails', async () => {
    verifyMock.mockReturnValueOnce({
      type: 'user.created',
      data: { id: 'clerk-4' },
    })
    upsertClerkUserMock.mockRejectedValueOnce(new Error('sync failed'))

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to process Clerk webhook' })
  })
})
