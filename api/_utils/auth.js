import { createClerkClient, verifyToken } from '@clerk/backend'
import { prisma } from './db.js'
import { upsertClerkUser } from './userSync.js'

const clerkSecretKey = process.env.CLERK_SECRET_KEY
const clerkClient = clerkSecretKey
  ? createClerkClient({ secretKey: clerkSecretKey })
  : null

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.name = 'HttpError'
    this.statusCode = statusCode
  }
}

const createHttpError = (statusCode, message) => new HttpError(statusCode, message)

const getBearerToken = (req) => {
  const authorizationHeader = req.headers.authorization || req.headers.Authorization

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return null
  }

  return authorizationHeader.slice(7).trim()
}

export const getErrorResponse = (error, fallbackMessage = 'Internal server error') => ({
  statusCode: error?.statusCode || 500,
  body: {
    error: error?.message || fallbackMessage,
  },
})

export async function verifyAuth(req) {
  if (!clerkSecretKey) {
    throw createHttpError(500, 'Clerk secret key is not configured')
  }

  const token = getBearerToken(req)

  if (!token) {
    throw createHttpError(401, 'Authentication required')
  }

  try {
    return await verifyToken(token, {
      secretKey: clerkSecretKey,
    })
  } catch (error) {
    console.error('Failed to verify Clerk token:', error)
    throw createHttpError(401, 'Invalid or expired authentication token')
  }
}

export async function getCurrentUser(req) {
  const tokenClaims = await verifyAuth(req)
  const clerkId = tokenClaims.sub

  if (!clerkId) {
    throw createHttpError(401, 'Authenticated session is missing a user id')
  }

  let user = await prisma.user.findUnique({
    where: {
      clerkId,
    },
  })

  if (!user) {
    if (!clerkClient) {
      throw createHttpError(500, 'Clerk backend client is not configured')
    }

    const clerkUser = await clerkClient.users.getUser(clerkId)
    user = await upsertClerkUser(clerkUser)
  }

  return {
    user,
    tokenClaims,
  }
}

export async function requireApprovedUser(req) {
  const { user, tokenClaims } = await getCurrentUser(req)

  if (user.accountStatus !== 'APPROVED') {
    throw createHttpError(403, `Account is ${user.accountStatus.toLowerCase().replace(/_/g, ' ')}`)
  }

  return {
    user,
    tokenClaims,
  }
}

export async function requireRole(req, allowedRoles = []) {
  const { user, tokenClaims } = await requireApprovedUser(req)

  if (!allowedRoles.includes(user.role)) {
    throw createHttpError(403, 'You do not have permission to access this resource')
  }

  return {
    user,
    tokenClaims,
  }
}
