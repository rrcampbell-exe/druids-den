import { Webhook } from 'svix'
import { sendEmail } from '../utils/emailService.js'
import { generateNewUserNotificationEmail } from '../utils/dashboardEmailTemplates.js'
import { upsertClerkUser } from '../utils/userSync.js'
import { prisma } from '../utils/db.js'

const getWebhookHeaders = (req) => ({
  'svix-id': req.headers['svix-id'],
  'svix-timestamp': req.headers['svix-timestamp'],
  'svix-signature': req.headers['svix-signature'],
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const webhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET

  if (!webhookSecret) {
    return res.status(500).json({ error: 'Clerk webhook secret is not configured' })
  }

  const headers = getWebhookHeaders(req)

  if (!headers['svix-id'] || !headers['svix-timestamp'] || !headers['svix-signature']) {
    return res.status(400).json({ error: 'Missing Svix headers' })
  }

  const payload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
  const webhook = new Webhook(webhookSecret)

  let event

  try {
    event = webhook.verify(payload, headers)
  } catch (error) {
    console.error('Invalid Clerk webhook signature:', error)
    return res.status(400).json({ error: 'Invalid webhook signature' })
  }

  try {
    if (event.type === 'user.created' || event.type === 'user.updated') {
      const syncedUser = await upsertClerkUser(event.data)

      if (event.type === 'user.created' && syncedUser.role === 'GUEST' && syncedUser.accountStatus === 'PENDING_APPROVAL' && process.env.OWNER_EMAIL) {
        const emailContent = generateNewUserNotificationEmail(syncedUser)

        await sendEmail({
          from: 'The Druids Den <grovekeeper@druidsdenwi.com>',
          to: process.env.OWNER_EMAIL,
          subject: emailContent.subject,
          text: emailContent.text,
          html: emailContent.html,
        })
      }
    }

    if (event.type === 'user.deleted') {
      const clerkId = event.data.id

      if (clerkId) {
        await prisma.user.updateMany({
          where: {
            clerkId,
          },
          data: {
            deletedAt: new Date(),
          },
        })
      }
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    console.error('Error processing Clerk webhook:', error)
    return res.status(500).json({ error: 'Failed to process Clerk webhook' })
  }
}
