import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const verifyTokenMock = vi.fn()
const getUserMock = vi.fn()
const findUniqueMock = vi.fn()
const upsertClerkUserMock = vi.fn()

vi.mock('@clerk/backend', () => ({
  createClerkClient: vi.fn().mockImplementation(() => ({
    users: {
      getUser: getUserMock,
    },
  })),
  verifyToken: verifyTokenMock,
}))

vi.mock('../../api/_utils/db.js', () => ({
  prisma: {
    user: {
      findUnique: findUniqueMock,
    },
  },
}))

vi.mock('../../api/_utils/userSync.js', () => ({
  upsertClerkUser: upsertClerkUserMock,
}))

describe('auth utils', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    process.env.CLERK_SECRET_KEY = 'sk_test'
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('formats error responses', async () => {
    const { getErrorResponse } = await import('../../api/_utils/auth.js')

    expect(getErrorResponse(new Error('boom'))).toEqual({
      statusCode: 500,
      body: { error: 'boom' },
    })
  })

  it('verifies bearer tokens', async () => {
    const { verifyAuth } = await import('../../api/_utils/auth.js')
    verifyTokenMock.mockResolvedValueOnce({ sub: 'clerk-1' })

    const result = await verifyAuth({ headers: { authorization: 'Bearer test-token' } })

    expect(verifyTokenMock).toHaveBeenCalledWith('test-token', { secretKey: 'sk_test' })
    expect(result).toEqual({ sub: 'clerk-1' })
  })

  it('prefers the local Clerk secret override when present', async () => {
    process.env.CLERK_SECRET_KEY = 'sk_live'
    process.env.LOCAL_CLERK_SECRET_KEY = 'sk_test_local'

    const { verifyAuth } = await import('../../api/_utils/auth.js')
    verifyTokenMock.mockResolvedValueOnce({ sub: 'clerk-local' })

    await verifyAuth({ headers: { authorization: 'Bearer local-token' } })

    expect(verifyTokenMock).toHaveBeenCalledWith('local-token', { secretKey: 'sk_test_local' })
  })

  it('rejects missing config, missing tokens, and invalid tokens', async () => {
    process.env.CLERK_SECRET_KEY = ''
    let authModule = await import('../../api/_utils/auth.js')
    await expect(authModule.verifyAuth({ headers: {} })).rejects.toMatchObject({
      statusCode: 500,
      message: 'Clerk secret key is not configured',
    })

    vi.resetModules()
    process.env.CLERK_SECRET_KEY = 'sk_test'
    authModule = await import('../../api/_utils/auth.js')
    await expect(authModule.verifyAuth({ headers: {} })).rejects.toMatchObject({
      statusCode: 401,
      message: 'Authentication required',
    })

    verifyTokenMock.mockRejectedValueOnce(new Error('bad token'))
    await expect(authModule.verifyAuth({ headers: { Authorization: 'Bearer bad' } })).rejects.toMatchObject({
      statusCode: 401,
      message: 'Invalid or expired authentication token',
    })
  })

  it('returns the current database user when present', async () => {
    const { getCurrentUser } = await import('../../api/_utils/auth.js')
    verifyTokenMock.mockResolvedValueOnce({ sub: 'clerk-1' })
    findUniqueMock.mockResolvedValueOnce({ id: 'user-1', accountStatus: 'APPROVED', role: 'OWNER' })

    const result = await getCurrentUser({ headers: { authorization: 'Bearer valid' } })

    expect(result).toEqual({
      user: { id: 'user-1', accountStatus: 'APPROVED', role: 'OWNER' },
      tokenClaims: { sub: 'clerk-1' },
    })
  })

  it('bootstraps a user from Clerk when no local user exists', async () => {
    const { getCurrentUser } = await import('../../api/_utils/auth.js')
    verifyTokenMock.mockResolvedValueOnce({ sub: 'clerk-2' })
    findUniqueMock.mockResolvedValueOnce(null)
    getUserMock.mockResolvedValueOnce({ id: 'clerk-2' })
    upsertClerkUserMock.mockResolvedValueOnce({ id: 'user-2', role: 'GUEST', accountStatus: 'PENDING_APPROVAL' })

    const result = await getCurrentUser({ headers: { authorization: 'Bearer valid' } })

    expect(getUserMock).toHaveBeenCalledWith('clerk-2')
    expect(upsertClerkUserMock).toHaveBeenCalledWith({ id: 'clerk-2' })
    expect(result.user.id).toBe('user-2')
  })

  it('throws when the token is missing a subject or Clerk client is unavailable', async () => {
    const { getCurrentUser } = await import('../../api/_utils/auth.js')
    verifyTokenMock.mockResolvedValueOnce({})
    await expect(getCurrentUser({ headers: { authorization: 'Bearer valid' } })).rejects.toMatchObject({
      statusCode: 401,
      message: 'Authenticated session is missing a user id',
    })

    vi.resetModules()
    process.env.CLERK_SECRET_KEY = ''
    const noSecretModule = await import('../../api/_utils/auth.js')
    await expect(noSecretModule.getCurrentUser({ headers: { authorization: 'Bearer valid' } })).rejects.toMatchObject({
      statusCode: 500,
    })
  })

  it('enforces approved accounts and required roles', async () => {
    const { requireApprovedUser, requireRole } = await import('../../api/_utils/auth.js')
    verifyTokenMock.mockResolvedValueOnce({ sub: 'clerk-1' })
    findUniqueMock.mockResolvedValueOnce({ id: 'user-1', accountStatus: 'DENIED', role: 'GUEST' })
    await expect(requireApprovedUser({ headers: { authorization: 'Bearer valid' } })).rejects.toMatchObject({
      statusCode: 403,
      message: 'Account is denied',
    })

    verifyTokenMock.mockResolvedValueOnce({ sub: 'clerk-2' })
    findUniqueMock.mockResolvedValueOnce({ id: 'user-2', accountStatus: 'APPROVED', role: 'GUEST' })
    await expect(requireRole({ headers: { authorization: 'Bearer valid' } }, ['OWNER'])).rejects.toMatchObject({
      statusCode: 403,
      message: 'You do not have permission to access this resource',
    })
  })
})
