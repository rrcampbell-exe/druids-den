import { getCurrentUser, getErrorResponse } from '../utils/auth.js'
import { serializeUser } from '../utils/serializers.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
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
