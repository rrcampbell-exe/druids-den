import { prisma } from '../utils/db.js'
import { sendEmail } from '../utils/emailService.js'
import { generateApprovalEmail } from '../utils/emailTemplates.js'
import { generateDenialEmail, generateCancellationEmail, generateReservationModificationEmail } from '../utils/dashboardEmailTemplates.js'
import { sanitizeDate } from '../utils/sanitize.js'
import { calculateEstimatedTotal } from '../utils/pricing.js'
import { requireRole, getErrorResponse } from '../utils/auth.js'
import { serializeReservation } from '../utils/serializers.js'

export default async function handler(req, res) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'Reservation ID is required' })
  }

  // PATCH - Update reservation (status OR full details)
  if (req.method === 'PATCH') {
    try {
      const { user: actor } = await requireRole(req, ['OWNER', 'ADMIN'])
      const { 
        status, 
        denialMessage, 
        cancellationMessage, 
        // Full update fields
        checkIn,
        checkOut,
        adults,
        children,
        specialRequests,
        ownerNote
      } = req.body

      const updateData = {}
      const changes = { dates: false, guests: false, note: null }

      // Get current reservation first (needed for change detection)
      const currentReservation = await prisma.reservation.findUnique({
        where: { id }
      })

      if (!currentReservation) {
        return res.status(404).json({ error: 'Reservation not found' })
      }

      // Status change
      if (status) {
        const normalizedStatus = status.toLowerCase()
        if (!['approved', 'denied', 'cancelled', 'pending'].includes(normalizedStatus)) {
          return res.status(400).json({ error: 'Invalid status' })
        }
        updateData.status = normalizedStatus.toUpperCase()
        updateData.statusChangedAt = new Date()
        updateData.statusChangedById = actor.id
        
        if (normalizedStatus === 'denied') updateData.denialMessage = denialMessage
        if (normalizedStatus === 'cancelled') updateData.cancellationMessage = cancellationMessage
      }

      // Full reservation update with conflict checking
      if (checkIn || checkOut) {
        // Validate date formats if provided
        if (checkIn) {
          const checkInValidation = sanitizeDate(checkIn)
          if (!checkInValidation.valid) {
            return res.status(400).json({ error: 'Invalid check-in date format (use YYYY-MM-DD)' })
          }
        }
        
        if (checkOut) {
          const checkOutValidation = sanitizeDate(checkOut)
          if (!checkOutValidation.valid) {
            return res.status(400).json({ error: 'Invalid check-out date format (use YYYY-MM-DD)' })
          }
        }
        
        // Convert YYYY-MM-DD to DateTime using noon UTC to avoid timezone issues
        const newCheckIn = checkIn ? new Date(checkIn + 'T12:00:00.000Z') : null
        const newCheckOut = checkOut ? new Date(checkOut + 'T12:00:00.000Z') : null
        
        const checkInDate = newCheckIn || currentReservation.checkIn
        const checkOutDate = newCheckOut || currentReservation.checkOut
        
        // Validate that checkout is after checkin
        if (checkOutDate <= checkInDate) {
          return res.status(400).json({ error: 'Check-out date must be after check-in date' })
        }
        
        // Check for conflicts with other reservations
        const conflictingReservations = await prisma.reservation.findMany({
          where: {
            id: { not: id }, // Exclude current reservation
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
          return res.status(400).json({ 
            error: 'Date conflict',
            message: 'These dates overlap with an existing reservation',
            conflicts: conflictingReservations.map(r => ({
              checkIn: r.checkIn.toISOString().split('T')[0],
              checkOut: r.checkOut.toISOString().split('T')[0]
            }))
          })
        }
        
        if (newCheckIn) {
          const currentCheckInISO = currentReservation.checkIn.toISOString().split('T')[0]
          if (checkIn !== currentCheckInISO) {
            updateData.checkIn = newCheckIn
            changes.dates = true
          }
        }
        if (newCheckOut) {
          const currentCheckOutISO = currentReservation.checkOut.toISOString().split('T')[0]
          if (checkOut !== currentCheckOutISO) {
            updateData.checkOut = newCheckOut
            changes.dates = true
          }
        }
      }
      
      if (adults !== undefined) {
        if (adults !== currentReservation.adults) {
          updateData.adults = adults
          changes.guests = true
        }
      }
      if (children !== undefined) {
        if (children !== currentReservation.children) {
          updateData.children = children
          changes.guests = true
        }
      }
      if (specialRequests !== undefined) updateData.specialRequests = specialRequests
      if (ownerNote !== undefined) {
        updateData.ownerNotes = ownerNote
        changes.note = ownerNote
      }

      // Update the reservation
      const updatedReservation = await prisma.reservation.update({
        where: { id },
        data: updateData,
      })

      // Send email notifications
      if (!updatedReservation.isOwnerReservation) {
        try {
          let emailContent
          const checkInStr = updatedReservation.checkIn.toISOString().split('T')[0]
          const checkOutStr = updatedReservation.checkOut.toISOString().split('T')[0]
          const reservationData = {
            firstName: updatedReservation.guestFirstName,
            lastName: updatedReservation.guestLastName,
            checkIn: checkInStr,
            checkOut: checkOutStr,
            adults: updatedReservation.adults,
            children: updatedReservation.children,
            estimatedTotal: calculateEstimatedTotal(checkInStr, checkOutStr),
            specialRequests: updatedReservation.specialRequests
          }

          // Status change emails
          if (status) {
            if (status.toLowerCase() === 'approved') {
              emailContent = generateApprovalEmail(reservationData)
            } else if (status.toLowerCase() === 'denied') {
              emailContent = generateDenialEmail(reservationData, denialMessage || 'Unfortunately, we are unable to accommodate your reservation at this time.')
            } else if (status.toLowerCase() === 'cancelled') {
              emailContent = generateCancellationEmail(reservationData, cancellationMessage || 'Your reservation has been cancelled.')
            }
          }
          // Reservation modification email
          else if (changes.dates || changes.guests) {
            emailContent = generateReservationModificationEmail(reservationData, changes)
          }

          if (emailContent) {
            await sendEmail({
              from: 'The Druids Den <reservations@druidsdenwi.com>',
              to: updatedReservation.guestEmail,
              subject: emailContent.subject,
              text: emailContent.text,
              html: emailContent.html
            })
          }
        } catch (emailError) {
          // Log email error but don't fail the request
          console.error('Failed to send email notification:', emailError)
        }
      }

      // Format response
      return res.status(200).json(serializeReservation(updatedReservation))
    } catch (error) {
      const { statusCode, body } = getErrorResponse(error, 'Failed to update reservation')
      return res.status(statusCode).json(body)
    }
  }

  // DELETE - Soft delete reservation
  if (req.method === 'DELETE') {
    try {
      await requireRole(req, ['OWNER', 'ADMIN'])
      const existingReservation = await prisma.reservation.findUnique({
        where: { id }
      })

      if (!existingReservation) {
        return res.status(404).json({ error: 'Reservation not found' })
      }

      const updatedReservation = await prisma.reservation.update({
        where: { id },
        data: {
          deletedAt: new Date()
        }
      })

      return res.status(200).json({
        message: 'Reservation deleted successfully',
        id: updatedReservation.id
      })
    } catch (error) {
      console.error('Error deleting reservation:', error)
      return res.status(500).json({ 
        error: 'Failed to delete reservation'
      })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
