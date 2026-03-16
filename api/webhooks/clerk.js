import { Webhook } from 'svix'
import { sendEmail } from '../_utils/emailService.js'
import { generateNewUserNotificationEmail } from '../_utils/dashboardEmailTemplates.js'
import { upsertClerkUser } from '../_utils/userSync.js'
import { prisma } from '../_utils/db.js'
import { checkRateLimit } from '../_utils/rateLimit.js'
import { trackServerEvent } from '../_utils/analytics.js'

const getWebhookHeaders = (req) => ({
  'svix-id': req.headers['svix-id'],
  'svix-timestamp': req.headers['svix-timestamp'],
  'svix-signature': req.headers['svix-signature'],
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const webhookSecret = process.env.LOCAL_CLERK_WEBHOOK_SIGNING_SECRET || process.env.CLERK_WEBHOOK_SIGNING_SECRET

  if (!webhookSecret) {
    return res.status(500).json({ error: 'Clerk webhook secret is not configured' })
  }

  const headers = getWebhookHeaders(req)

  if (!headers['svix-id'] || !headers['svix-timestamp'] || !headers['svix-signature']) {
    return res.status(400).json({ error: 'Missing Svix headers' })
  }

  const deliveryLimit = checkRateLimit(req, {
    keyPrefix: 'clerk-webhook',
    maxRequests: 240,
    windowMs: 60 * 1000,
    message: 'Too many webhook deliveries. Please retry shortly.',
  })

  if (deliveryLimit) {
    void trackServerEvent('clerk_webhook_rate_limited', {
      webhook_type: 'delivery',
    }, req)
    return res.status(deliveryLimit.statusCode).json(deliveryLimit.body)
  }

  const payload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
  const webhook = new Webhook(webhookSecret)

  let event

  try {
    event = webhook.verify(payload, headers)
  } catch (error) {
    console.error('Invalid Clerk webhook signature:', error)
    void trackServerEvent('clerk_webhook_invalid_signature', {}, req)
    return res.status(400).json({ error: 'Invalid webhook signature' })
  }

  if (event.type === 'user.created') {
    const signupLimit = checkRateLimit(req, {
      keyPrefix: 'clerk-webhook-user-created',
      maxRequests: 10,
      windowMs: 24 * 60 * 60 * 1000,
      message: 'Too many signup attempts. Please try again later.',
    })

    if (signupLimit) {
      void trackServerEvent('clerk_webhook_rate_limited', {
        webhook_type: 'user.created',
      }, req)
      return res.status(signupLimit.statusCode).json(signupLimit.body)
    }
  }

  try {
    if (event.type === 'user.created' || event.type === 'user.updated') {
      const syncedUser = await upsertClerkUser(event.data)

      if (event.type === 'user.created') {
        void trackServerEvent('account_created', {
          role: syncedUser.role,
          account_status: syncedUser.accountStatus,
        }, req)
      }

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

    if (event.type === 'session.created') {
      void trackServerEvent('login_succeeded', {
        source: 'clerk_webhook',
      }, req)
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    console.error('Error processing Clerk webhook:', error)
    void trackServerEvent('clerk_webhook_processing_failed', {
      event_type: event?.type || 'unknown',
    }, req)
    return res.status(500).json({ error: 'Failed to process Clerk webhook' })
  }
}
