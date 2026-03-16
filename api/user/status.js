import { getCurrentUser, getErrorResponse } from '../_utils/auth.js'
import { serializeUser } from '../_utils/serializers.js'
import { checkRateLimit } from '../_utils/rateLimit.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const limit = checkRateLimit(req, {
    keyPrefix: 'user-status',
    maxRequests: 120,
    windowMs: 60 * 1000,
    message: 'Too many account status checks. Please try again shortly.',
  })

  if (limit) {
    return res.status(limit.statusCode).json(limit.body)
  }

  try {
    const { user } = await getCurrentUser(req)

    return res.status(200).json({
      user: serializeUser(user),
    })
  } catch (error) {
    const { statusCode, body } = getErrorResponse(error)
    return res.status(statusCode).json(body)
  }
}
