import { prisma } from './utils/db.js'
import { sendEmail } from './utils/emailService.js'
import { generateCustomMessageEmail } from './utils/dashboardEmailTemplates.js'

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { reservationId, message } = req.body

  // Validate required fields
  if (!reservationId) {
    return res.status(400).json({ error: 'Reservation ID is required' })
  }

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' })
  }

  try {
    // Fetch the reservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId }
    })

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' })
    }

    // Don't allow messages to owner reservations
    if (reservation.isOwnerReservation) {
      return res.status(400).json({ error: 'Cannot send messages to owner reservations' })
    }

    // Ensure reservation has guest email
    if (!reservation.guestEmail) {
      return res.status(400).json({ error: 'Guest email not found' })
    }

    // Prepare reservation data for email template
    const reservationData = {
      firstName: reservation.guestFirstName,
      lastName: reservation.guestLastName,
      checkIn: reservation.checkIn.toISOString().split('T')[0],
      checkOut: reservation.checkOut.toISOString().split('T')[0],
      adults: reservation.adults,
      children: reservation.children
    }

    // Generate email content
    const emailContent = generateCustomMessageEmail(reservationData, message.trim())

    // Send the email
    await sendEmail({
      from: 'The Druids Den <grovekeeper@druidsdenwi.com>',
      to: reservation.guestEmail,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html
    })

    return res.status(200).json({ 
      success: true,
      message: 'Message sent successfully' 
    })
  } catch (error) {
    console.error('Error sending custom message:', error)
    return res.status(500).json({ 
      error: 'Failed to send message'
    })
  }
}
