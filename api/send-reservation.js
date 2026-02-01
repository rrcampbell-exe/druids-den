import { prisma } from './utils/db.js'
import { sendBulkEmails } from './utils/emailService.js'
import { 
  generateAdminNotificationEmail, 
  generateCustomerConfirmationEmail 
} from './utils/emailTemplates.js'
import { sanitizeReservationData } from './utils/sanitize.js'

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const rawReservationData = req.body

  // Validate and sanitize all input data
  const { sanitized, errors } = sanitizeReservationData(rawReservationData)

  // Check for any validation errors
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ 
      error: 'Invalid reservation data',
      details: errors
    })
  }

  // Ensure required fields passed validation
  if (!sanitized.firstName || !sanitized.email || !sanitized.checkIn) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // Convert YYYY-MM-DD dates to ISO-8601 DateTime for Prisma
    const checkInDate = new Date(sanitized.checkIn + 'T00:00:00.000Z')
    const checkOutDate = new Date(sanitized.checkOut + 'T00:00:00.000Z')
    
    // Check for conflicts with existing APPROVED/PENDING reservations
    const conflictingReservations = await prisma.reservation.findMany({
      where: {
        deletedAt: null,
        status: { in: ['APPROVED', 'PENDING'] },
        OR: [
          {
            AND: [
              { checkIn: { lte: checkInDate } },
              { checkOut: { gt: checkInDate } }
            ]
          },
          {
            AND: [
              { checkIn: { lt: checkOutDate } },
              { checkOut: { gte: checkOutDate } }
            ]
          },
          {
            AND: [
              { checkIn: { gte: checkInDate } },
              { checkOut: { lte: checkOutDate } }
            ]
          }
        ]
      }
    })
    
    if (conflictingReservations.length > 0) {
      return res.status(409).json({ 
        error: 'Date conflict',
        message: 'These dates overlap with an existing reservation. Please select different dates.',
        conflicts: conflictingReservations.map(r => ({
          checkIn: r.checkIn.toISOString().split('T')[0],
          checkOut: r.checkOut.toISOString().split('T')[0]
        }))
      })
    }
    
    // Create reservation in database with pending status
    await prisma.reservation.create({
      data: {
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        adults: sanitized.adults || 1,
        children: sanitized.children || 0,
        specialRequests: sanitized.specialRequests,
        status: 'PENDING',
        guestFirstName: sanitized.firstName,
        guestLastName: sanitized.lastName,
        guestEmail: sanitized.email,
        guestPhone: sanitized.phone
      }
    })

    // Generate email templates
    const adminEmail = generateAdminNotificationEmail(sanitized)
    const customerEmail = generateCustomerConfirmationEmail(sanitized)

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
        to: sanitized.email,
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
      error: 'Failed to process reservation request'
    })
  }
}
