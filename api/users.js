import { prisma } from './utils/db.js'
import { requireRole, getErrorResponse } from './utils/auth.js'
import { serializeUser } from './utils/serializers.js'
import { sendEmail } from './utils/emailService.js'
import {
  generateAccountApprovedEmail,
  generateAccountDeniedEmail,
  generateAccountRevokedEmail,
} from './utils/dashboardEmailTemplates.js'

const VALID_STATUSES = ['PENDING_APPROVAL', 'APPROVED', 'DENIED', 'REVOKED']

const sendGuestStatusEmail = async (user) => {
  let emailContent = null

  if (user.accountStatus === 'APPROVED') {
    emailContent = generateAccountApprovedEmail(user)
  } else if (user.accountStatus === 'DENIED') {
    emailContent = generateAccountDeniedEmail(user)
  } else if (user.accountStatus === 'REVOKED') {
    emailContent = generateAccountRevokedEmail(user)
  }

  if (!emailContent) {
    return
  }

  await sendEmail({
    from: 'The Druids Den <grovekeeper@druidsdenwi.com>',
    to: user.email,
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html,
  })
}

export default async function handler(req, res) {
  try {
    const { user: actor } = await requireRole(req, ['OWNER', 'ADMIN'])

    if (req.method === 'GET') {
      const users = await prisma.user.findMany({
        where: {
          deletedAt: null,
          role: 'GUEST',
        },
        orderBy: [
          { accountStatus: 'asc' },
          { createdAt: 'desc' },
        ],
      })

      return res.status(200).json({
        users: users.map(serializeUser),
      })
    }

    if (req.method === 'PATCH') {
      const { userId, accountStatus } = req.body || {}

      if (!userId || !accountStatus) {
        return res.status(400).json({ error: 'userId and accountStatus are required' })
      }

      if (!VALID_STATUSES.includes(accountStatus)) {
        return res.status(400).json({ error: 'Invalid account status' })
      }

      const existingUser = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      })

      if (!existingUser || existingUser.deletedAt) {
        return res.status(404).json({ error: 'Guest account not found' })
      }

      if (existingUser.role !== 'GUEST') {
        return res.status(400).json({ error: 'Only guest accounts can be updated here' })
      }

      const updatedUser = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          accountStatus,
          accountStatusChangedAt: new Date(),
          accountStatusChangedBy: actor.id,
        },
      })

      try {
        await sendGuestStatusEmail(updatedUser)
      } catch (emailError) {
        console.error('Failed to send guest account status email:', emailError)
      }

      return res.status(200).json({
        user: serializeUser(updatedUser),
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    const { statusCode, body } = getErrorResponse(error)
    return res.status(statusCode).json(body)
  }
}
