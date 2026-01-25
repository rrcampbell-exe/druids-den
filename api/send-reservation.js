import { sendBulkEmails } from './utils/emailService.js'
import { 
  generateAdminNotificationEmail, 
  generateCustomerConfirmationEmail 
} from './utils/emailTemplates.js'

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const reservationData = req.body

  // Basic validation
  if (!reservationData.firstName || !reservationData.email || !reservationData.checkIn) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // Generate email templates
    const adminEmail = generateAdminNotificationEmail(reservationData)
    const customerEmail = generateCustomerConfirmationEmail(reservationData)

    // Prepare emails to send
    const emails = [
      // 1. Admin notification email
      {
        from: 'The Druids Den <grovekeeper@druidsdenwi.com>',
        to: 'grovekeeper@druidsdenwi.com',
        subject: adminEmail.subject,
        text: adminEmail.text,
        html: adminEmail.html
      },
      // 2. Customer confirmation email
      {
        from: 'The Druids Den <grovekeeper@druidsdenwi.com>',
        to: reservationData.email,
        subject: customerEmail.subject,
        text: customerEmail.text,
        html: customerEmail.html
      }
    ]

    // Send all emails
    const results = await sendBulkEmails(emails)

    // Check if any emails failed
    const failedEmails = results.filter(r => !r.success)
    const allSuccessful = failedEmails.length === 0

    // Determine if email service is configured
    const serviceConfigured = results.some(r => r.provider !== 'none')

    if (!serviceConfigured) {
      return res.status(200).json({
        success: true,
        message: 'Reservation logged (email service not configured)',
        note: 'To send emails, set RESEND_API_KEY environment variable',
        emailResults: results
      })
    }

    if (allSuccessful) {
      return res.status(200).json({
        success: true,
        message: 'Reservation request sent successfully',
        details: {
          adminNotified: true,
          customerNotified: true,
          provider: results[0].provider
        }
      })
    }

    // Partial success - some emails sent, some failed
    return res.status(207).json({
      success: true,
      message: 'Reservation processed with some email failures',
      emailResults: results,
      details: {
        adminNotified: results[0]?.success || false,
        customerNotified: results[1]?.success || false
      }
    })

  } catch (error) {
    console.error('Error processing reservation:', error)
    return res.status(500).json({
      error: 'Failed to process reservation request',
      details: error.message
    })
  }
}
