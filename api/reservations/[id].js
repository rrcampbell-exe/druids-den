import { prisma } from '../utils/db.js'
import { sendEmail } from '../utils/emailService.js'
import { generateApprovalEmail } from '../utils/emailTemplates.js'
import { generateDenialEmail, generateCancellationEmail, generateReservationModificationEmail } from '../utils/dashboardEmailTemplates.js'

export default async function handler(req, res) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'Reservation ID is required' })
  }

  // PATCH - Update reservation (status OR full details)
  if (req.method === 'PATCH') {
    try {
      const { 
        status, 
        denialMessage, 
        cancellationMessage, 
        statusChangedById,
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

      // Status change
      if (status) {
        const normalizedStatus = status.toLowerCase()
        if (!['approved', 'denied', 'cancelled', 'pending'].includes(normalizedStatus)) {
          return res.status(400).json({ error: 'Invalid status' })
        }
        updateData.status = normalizedStatus.toUpperCase()
        updateData.statusChangedAt = new Date()
        updateData.statusChangedById = statusChangedById || null
        
        if (normalizedStatus === 'denied') updateData.denialMessage = denialMessage
        if (normalizedStatus === 'cancelled') updateData.cancellationMessage = cancellationMessage
      }

      // Full reservation update with conflict checking
      if (checkIn || checkOut) {
        const newCheckIn = checkIn ? new Date(checkIn) : null
        const newCheckOut = checkOut ? new Date(checkOut) : null
        
        // Get current reservation to check against
        const currentReservation = await prisma.reservation.findUnique({
          where: { id }
        })
        
        if (!currentReservation) {
          return res.status(404).json({ error: 'Reservation not found' })
        }
        
        const checkInDate = newCheckIn || currentReservation.checkIn
        const checkOutDate = newCheckOut || currentReservation.checkOut
        
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
          updateData.checkIn = newCheckIn
          changes.dates = true
        }
        if (newCheckOut) {
          updateData.checkOut = newCheckOut
          changes.dates = true
        }
      }
      
      if (adults !== undefined) {
        updateData.adults = adults
        changes.guests = true
      }
      if (children !== undefined) {
        updateData.children = children
        changes.guests = true
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
          const reservationData = {
            firstName: updatedReservation.guestFirstName,
            checkIn: updatedReservation.checkIn,
            checkOut: updatedReservation.checkOut,
            adults: updatedReservation.adults,
            children: updatedReservation.children,
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
      const checkInDate = new Date(updatedReservation.checkIn)
      const checkOutDate = new Date(updatedReservation.checkOut)
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
      
      return res.status(200).json({
        id: updatedReservation.id,
        firstName: updatedReservation.guestFirstName,
        lastName: updatedReservation.guestLastName,
        email: updatedReservation.guestEmail,
        phone: updatedReservation.guestPhone,
        checkIn: updatedReservation.checkIn.toISOString().split('T')[0],
        checkOut: updatedReservation.checkOut.toISOString().split('T')[0],
        adults: updatedReservation.adults,
        children: updatedReservation.children,
        specialRequests: updatedReservation.specialRequests,
        status: updatedReservation.status.toLowerCase(),
        isOwnerReservation: updatedReservation.isOwnerReservation,
        submittedAt: updatedReservation.submittedAt ? updatedReservation.submittedAt.toISOString() : null,
        statusChangedAt: updatedReservation.statusChangedAt ? updatedReservation.statusChangedAt.toISOString() : null,
        approvedAt: updatedReservation.status === 'APPROVED' && updatedReservation.statusChangedAt 
          ? updatedReservation.statusChangedAt.toISOString() 
          : null,
        estimatedTotal: nights * 150,
        ownerNote: updatedReservation.isOwnerReservation ? updatedReservation.specialRequests : null,
        denialMessage: updatedReservation.denialMessage,
        cancellationMessage: updatedReservation.cancellationMessage,
      })
    } catch (error) {
      console.error('Error updating reservation:', error)
      return res.status(500).json({ 
        error: 'Failed to update reservation'
      })
    }
  }

  // DELETE - Soft delete reservation
  if (req.method === 'DELETE') {
    try {
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
