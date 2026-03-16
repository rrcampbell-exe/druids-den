import { prisma } from './_utils/db.js'
import { sendBulkEmails } from './_utils/emailService.js'
import { 
  generateAdminNotificationEmail, 
  generateCustomerConfirmationEmail 
} from './_utils/emailTemplates.js'
import { sanitizeReservationData } from './_utils/sanitize.js'
import { calculateEstimatedTotal } from './_utils/pricing.js'
import { requireApprovedUser, getErrorResponse } from './_utils/auth.js'
import { checkRateLimit } from './_utils/rateLimit.js'
import { trackServerEvent } from './_utils/analytics.js'

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const limit = checkRateLimit(req, {
    keyPrefix: 'send-reservation',
    maxRequests: 60,
    windowMs: 60 * 1000,
    message: 'Too many reservation attempts. Please wait and try again.',
  })

  if (limit) {
    await trackServerEvent('reservation_api_rate_limited', {
      route: '/api/send-reservation',
    }, req)
    return res.status(limit.statusCode).json(limit.body)
  }

  const rawReservationData = req.body

  // Validate and sanitize all input data
  const { sanitized, errors } = sanitizeReservationData(rawReservationData)

  // Check for any validation errors
  if (Object.keys(errors).length > 0) {
    await trackServerEvent('reservation_api_validation_failed', {
      error_count: Object.keys(errors).length,
    }, req)
    return res.status(400).json({ 
      error: 'Invalid reservation data',
      details: errors
    })
  }

  // Ensure required fields passed validation
  if (!sanitized.firstName || !sanitized.email || !sanitized.checkIn) {
    await trackServerEvent('reservation_api_validation_failed', {
      reason: 'missing_required_fields',
    }, req)
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const { user } = await requireApprovedUser(req)

    // Convert YYYY-MM-DD dates to ISO-8601 DateTime for Prisma
    // Using noon UTC (12:00) instead of midnight to avoid timezone boundary issues
    // This ensures the date part stays consistent when converted to any timezone
    const checkInDate = new Date(sanitized.checkIn + 'T12:00:00.000Z')
    const checkOutDate = new Date(sanitized.checkOut + 'T12:00:00.000Z')
    
    // Calculate estimated total for this reservation
    const estimatedTotal = calculateEstimatedTotal(sanitized.checkIn, sanitized.checkOut)
    
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
      await trackServerEvent('reservation_api_conflict', {
        reason: 'date_overlap',
      }, req)
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
        userId: user.id,
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        adults: sanitized.adults || 1,
        children: sanitized.children || 0,
        specialRequests: sanitized.specialRequests,
        status: 'PENDING',
        guestFirstName: sanitized.firstName || user.firstName || 'Guest',
        guestLastName: sanitized.lastName || user.lastName || 'Guest',
        guestEmail: user.email,
        guestPhone: sanitized.phone || user.phone
      }
    })

    // Generate email templates
    const reservationDataWithTotal = {
      ...sanitized,
      email: user.email,
      estimatedTotal
    }
    const adminEmail = generateAdminNotificationEmail(reservationDataWithTotal)
    const customerEmail = generateCustomerConfirmationEmail(reservationDataWithTotal)

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
        to: user.email,
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
      await trackServerEvent('reservation_api_created', {
        email_provider_configured: false,
      }, req)
      return res.status(200).json({
        success: true,
        message: 'Reservation logged (email service not configured)',
        note: 'To send emails, set RESEND_API_KEY environment variable',
        emailResults: results
      })
    }

    if (allSuccessful) {
      await trackServerEvent('reservation_api_created', {
        email_provider_configured: true,
        email_delivery_status: 'all_success',
      }, req)
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
    await trackServerEvent('reservation_api_created', {
      email_provider_configured: true,
      email_delivery_status: 'partial_failure',
    }, req)
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
    await trackServerEvent('reservation_api_failed', {
      reason: 'handler_exception',
    }, req)
    const { statusCode, body } = getErrorResponse(error, 'Failed to process reservation request')
    return res.status(statusCode).json(body)
  }
}
