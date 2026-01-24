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
    // For now, we'll use a simple email service
    // You can integrate with SendGrid, Resend, or AWS SES later
    const emailContent = `
New Reservation Request for Druids Den

GUEST INFORMATION:
Name: ${reservationData.firstName} ${reservationData.lastName}
Email: ${reservationData.email}
Phone: ${reservationData.phone}

RESERVATION DETAILS:
Check-In: ${reservationData.checkIn}
Check-Out: ${reservationData.checkOut}
Adults: ${reservationData.adults}
Children: ${reservationData.children}

SPECIAL REQUESTS:
${reservationData.specialRequests || 'None'}

Submitted: ${new Date().toLocaleString()}
    `

    // Option 1: Use Resend (recommended)
    if (process.env.RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'reservations@druidsdenwi.com',
          to: 'campbell.ryan.r@gmail.com',
          subject: `New Reservation Request: ${reservationData.firstName} ${reservationData.lastName}`,
          text: emailContent
        })
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('Resend API error:', error)
        throw new Error('Failed to send email via Resend')
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Reservation request sent successfully' 
      })
    }

    // Option 2: Use SendGrid
    if (process.env.SENDGRID_API_KEY) {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: 'campbell.ryan.r@gmail.com' }]
          }],
          from: { email: 'reservations@druidsdenwi.com' },
          subject: `New Reservation: ${reservationData.firstName} ${reservationData.lastName}`,
          content: [{
            type: 'text/plain',
            value: emailContent
          }]
        })
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('SendGrid API error:', error)
        throw new Error('Failed to send email via SendGrid')
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Reservation request sent successfully' 
      })
    }

    // Fallback: Log to console (development only)
    console.log('=== NEW RESERVATION REQUEST ===')
    console.log(emailContent)
    console.log('================================')

    return res.status(200).json({ 
      success: true, 
      message: 'Reservation logged (email service not configured)',
      note: 'To send emails, set RESEND_API_KEY or SENDGRID_API_KEY environment variable'
    })

  } catch (error) {
    console.error('Error processing reservation:', error)
    return res.status(500).json({ 
      error: 'Failed to process reservation request',
      details: error.message 
    })
  }
}
