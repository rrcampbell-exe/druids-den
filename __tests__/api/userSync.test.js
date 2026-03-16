import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const findUniqueMock = vi.fn()
const updateMock = vi.fn()
const createMock = vi.fn()

vi.mock('../../api/_utils/db.js', () => ({
  prisma: {
    user: {
      findUnique: findUniqueMock,
      update: updateMock,
      create: createMock,
    },
  },
}))

describe('userSync utils', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    process.env.OWNER_EMAIL = 'owner@example.com'
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('normalizes Clerk payloads from camelCase and snake_case fields', async () => {
    const { normalizeClerkUser } = await import('../../api/_utils/userSync.js')

    expect(normalizeClerkUser({
      id: 'clerk-1',
      primaryEmailAddressId: 'email_1',
      emailAddresses: [{ id: 'email_1', emailAddress: 'Guest@Example.com' }],
      firstName: 'Guest',
      lastName: 'User',
      primaryPhoneNumberId: 'phone_1',
      phoneNumbers: [{ id: 'phone_1', phoneNumber: '555-0100' }],
    })).toEqual({
      clerkId: 'clerk-1',
      email: 'guest@example.com',
      firstName: 'Guest',
      lastName: 'User',
      phone: '555-0100',
    })

    expect(normalizeClerkUser({
      id: 'clerk-2',
      primary_email_address_id: 'email_2',
      email_addresses: [{ id: 'email_2', email_address: 'snake@example.com' }],
      first_name: 'Snake',
      last_name: 'Case',
      phone_numbers: [{ id: 'phone_2', phone_number: '555-0200' }],
      primary_phone_number_id: 'phone_2',
    })).toEqual({
      clerkId: 'clerk-2',
      email: 'snake@example.com',
      firstName: 'Snake',
      lastName: 'Case',
      phone: '555-0200',
    })
  })

  it('throws when the Clerk payload is missing required identity fields', async () => {
    const { normalizeClerkUser } = await import('../../api/_utils/userSync.js')

    expect(() => normalizeClerkUser({ id: 'clerk-1' })).toThrow(
      'Clerk user payload is missing an id or primary email address',
    )
  })

  it('bootstraps the owner account as approved', async () => {
    const { upsertClerkUser } = await import('../../api/_utils/userSync.js')
    findUniqueMock.mockResolvedValueOnce(null)
    findUniqueMock.mockResolvedValueOnce(null)
    createMock.mockResolvedValueOnce({ id: 'owner-1' })

    await upsertClerkUser({
      id: 'clerk-owner',
      primaryEmailAddressId: 'email_1',
      emailAddresses: [{ id: 'email_1', emailAddress: 'owner@example.com' }],
      firstName: 'Ryan',
      lastName: 'Owner',
    })

    expect(createMock).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        role: 'OWNER',
        accountStatus: 'APPROVED',
        accountStatusChangedAt: expect.any(Date),
        accountStatusChangedBy: 'system-owner-bootstrap',
      }),
    }))
  })

  it('preserves existing guest role and status when updating', async () => {
    const { upsertClerkUser } = await import('../../api/_utils/userSync.js')
    findUniqueMock.mockResolvedValueOnce({
      role: 'GUEST',
      accountStatus: 'DENIED',
      accountStatusChangedAt: new Date('2026-03-01T00:00:00.000Z'),
      accountStatusChangedBy: 'owner-1',
    })
    updateMock.mockResolvedValueOnce({ id: 'guest-1' })

    await upsertClerkUser({
      id: 'clerk-guest',
      primaryEmailAddressId: 'email_1',
      emailAddresses: [{ id: 'email_1', emailAddress: 'guest@example.com' }],
      firstName: 'Guest',
      lastName: 'User',
    })

    expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({
      where: { clerkId: 'clerk-guest' },
      data: expect.objectContaining({
        role: 'GUEST',
        accountStatus: 'DENIED',
        accountStatusChangedBy: 'owner-1',
      }),
    }))
  })

  it('defaults new non-owner accounts to pending approval', async () => {
    const { upsertClerkUser } = await import('../../api/_utils/userSync.js')
    findUniqueMock.mockResolvedValueOnce(null)
    findUniqueMock.mockResolvedValueOnce(null)
    createMock.mockResolvedValueOnce({ id: 'guest-2' })

    await upsertClerkUser({
      id: 'clerk-pending',
      primaryEmailAddressId: 'email_1',
      emailAddresses: [{ id: 'email_1', emailAddress: 'pending@example.com' }],
    })

    expect(createMock).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        role: 'GUEST',
        accountStatus: 'PENDING_APPROVAL',
        accountStatusChangedAt: null,
        accountStatusChangedBy: null,
      }),
    }))
  })

  it('claims an existing email when clerk id differs', async () => {
    const { upsertClerkUser } = await import('../../api/_utils/userSync.js')
    findUniqueMock
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'seed-owner',
        clerkId: 'seeded_clerk',
        email: 'owner@example.com',
        role: 'OWNER',
        accountStatus: 'APPROVED',
        accountStatusChangedAt: new Date('2026-01-01T00:00:00.000Z'),
        accountStatusChangedBy: 'seed',
      })
    updateMock.mockResolvedValueOnce({ id: 'seed-owner' })

    await upsertClerkUser({
      id: 'clerk-owner-real',
      primaryEmailAddressId: 'email_1',
      emailAddresses: [{ id: 'email_1', emailAddress: 'owner@example.com' }],
      firstName: 'Ryan',
      lastName: 'Campbell',
    })

    expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({
      where: { email: 'owner@example.com' },
      data: expect.objectContaining({
        clerkId: 'clerk-owner-real',
        email: 'owner@example.com',
      }),
    }))
  })
})
