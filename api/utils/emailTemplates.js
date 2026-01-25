/**
 * Email template generators for The Druids Den reservations
 */

/**
 * Format date string to "Month Day, Year" format
 * @param {string} dateString - Date string in any format
 * @returns {string} Formatted date (e.g., "January 25, 2026")
 */
function formatDateForEmail(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Chicago'
  })
}

/**
 * Generate admin notification email for new reservation
 * @param {Object} reservationData - The reservation details
 * @returns {Object} Email content with subject, text, and html
 */
export function generateAdminNotificationEmail(reservationData) {
  const submittedDate = new Date().toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    dateStyle: 'full',
    timeStyle: 'short'
  })

  const subject = `New Reservation Request: ${reservationData.firstName} ${reservationData.lastName}`

  const text = `
New Reservation Request for The Druids Den

GUEST INFORMATION:
Name: ${reservationData.firstName} ${reservationData.lastName}
Email: ${reservationData.email}
Phone: ${reservationData.phone || 'Not provided'}

RESERVATION DETAILS:
Check-In: ${reservationData.checkIn}
Check-Out: ${reservationData.checkOut}
Adults: ${reservationData.adults}
Children: ${reservationData.children || 0}

SPECIAL REQUESTS:
${reservationData.specialRequests || 'None'}

Submitted: ${submittedDate}
  `.trim()

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #464645; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #BAB6A2;">
  <div style="background: linear-gradient(135deg, rgba(186, 182, 162, 0.9) 0%, rgba(186, 182, 162, 0.85) 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center; border-bottom: 3px solid #464645;">
    <h1 style="margin: 0; font-size: 24px; font-weight: 400; color: #464645; letter-spacing: 0.5px;">New Reservation Request</h1>
    <p style="margin: 10px 0 0 0; color: #464645; opacity: 0.8;">The Druids Den</p>
  </div>
  
  <div style="background: #fff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: rgba(186, 182, 162, 0.1); padding: 25px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #464645;">
      <h2 style="margin: 0 0 15px 0; color: #464645; font-size: 18px;">Guest Information</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #666;">Name:</td>
          <td style="padding: 8px 0; color: #464645;">${reservationData.firstName} ${reservationData.lastName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #666;">Email:</td>
          <td style="padding: 8px 0;"><a href="mailto:${reservationData.email}" style="color: #464645; font-weight: 600;">${reservationData.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #666;">Phone:</td>
          <td style="padding: 8px 0; color: #464645;">${reservationData.phone || 'Not provided'}</td>
        </tr>
      </table>
    </div>
    
    <div style="background: rgba(186, 182, 162, 0.1); padding: 25px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #464645;">
      <h2 style="margin: 0 0 15px 0; color: #464645; font-size: 18px;">Reservation Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #666;">Check-In:</td>
          <td style="padding: 8px 0; color: #464645;">${formatDateForEmail(reservationData.checkIn)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #666;">Check-Out:</td>
          <td style="padding: 8px 0; color: #464645;">${formatDateForEmail(reservationData.checkOut)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #666;">Adults:</td>
          <td style="padding: 8px 0; color: #464645;">${reservationData.adults}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #666;">Children:</td>
          <td style="padding: 8px 0; color: #464645;">${reservationData.children || 0}</td>
        </tr>
      </table>
    </div>
    
    ${reservationData.specialRequests ? `
    <div style="background: rgba(186, 182, 162, 0.1); padding: 25px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #464645;">
      <h2 style="margin: 0 0 15px 0; color: #464645; font-size: 18px;">Special Requests</h2>
      <p style="margin: 0; white-space: pre-wrap; color: #464645;">${reservationData.specialRequests}</p>
    </div>
    ` : ''}
    
    <div style="text-align: center; padding-top: 20px; font-size: 14px; color: #666;">
      <p style="margin: 0;">Submitted: ${submittedDate}</p>
    </div>
  </div>
</body>
</html>
  `.trim()

  return { subject, text, html }
}

/**
 * Generate customer confirmation email
 * @param {Object} reservationData - The reservation details
 * @returns {Object} Email content with subject, text, and html
 */
export function generateCustomerConfirmationEmail(reservationData) {
  const subject = `Reservation Request Received - The Druids Den`

  const text = `
Dear ${reservationData.firstName},

Thank you for your reservation request at The Druids Den! We've received your information and will be in touch soon to confirm your stay.

RESERVATION DETAILS:
Check-In: ${reservationData.checkIn}
Check-Out: ${reservationData.checkOut}
Guests: ${reservationData.adults} adult(s)${reservationData.children ? `, ${reservationData.children} child(ren)` : ''}

${reservationData.specialRequests ? `Special Requests: ${reservationData.specialRequests}\n` : ''}
We'll review your request and send you a confirmation email within 24 hours. If you have any questions in the meantime, please don't hesitate to reach out.

We look forward to welcoming you to The Druids Den!

Warmly,
Ryan and Lacey at The Druids Den
grovekeeper@druidsdenwi.com

---
This is an automated confirmation. Please do not reply to this email. For questions, contact us at grovekeeper@druidsdenwi.com.
  `.trim()

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #464645; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #BAB6A2;">
  <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, rgba(186, 182, 162, 0.9) 0%, rgba(186, 182, 162, 0.85) 100%); padding: 40px 30px; text-align: center; border-bottom: 3px solid #464645;">
      <h1 style="margin: 0 0 10px 0; font-size: 32px; font-weight: 600; color: #464645; letter-spacing: 1px;">The Druids Den</h1>
      <p style="margin: 0; font-size: 16px; color: #464645; opacity: 0.8;">Your Reservation Request</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px; background-color: #fff;">
      <p style="margin: 0 0 20px 0; font-size: 16px;">Dear ${reservationData.firstName},</p>
      
      <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.8;">
        Thank you for your reservation request at <strong>The Druids Den</strong>! We've received your information and will be in touch soon to confirm your stay.
      </p>
      
      <!-- Reservation Details Card -->
      <div style="background: rgba(186, 182, 162, 0.15); border-left: 4px solid #464645; padding: 25px; border-radius: 8px; margin: 30px 0;">
        <h2 style="margin: 0 0 20px 0; color: #464645; font-size: 18px;">Your Reservation Details</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; font-weight: 600; color: #666; width: 35%;">Check-In:</td>
            <td style="padding: 10px 0; color: #333;">${formatDateForEmail(reservationData.checkIn)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: 600; color: #666;">Check-Out:</td>
            <td style="padding: 10px 0; color: #333;">${formatDateForEmail(reservationData.checkOut)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: 600; color: #666;">Guests:</td>
            <td style="padding: 10px 0; color: #333;">${reservationData.adults} adult(s)${reservationData.children ? `, ${reservationData.children} child(ren)` : ''}</td>
          </tr>
        </table>
        
        ${reservationData.specialRequests ? `
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0 0 10px 0; font-weight: 600; color: #666;">Special Requests:</p>
          <p style="margin: 0; color: #333; white-space: pre-wrap;">${reservationData.specialRequests}</p>
        </div>
        ` : ''}
      </div>
      
      <!-- Next Steps -->
      <div style="background: rgba(186, 182, 162, 0.2); border: 2px solid #464645; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <h3 style="margin: 0 0 10px 0; color: #464645; font-size: 16px;">What happens next?</h3>
        <p style="margin: 0; color: #464645; line-height: 1.7;">
          We'll review your request and send you a confirmation email within <strong>24 hours</strong>. If you have any questions in the meantime, please don't hesitate to reach out.
        </p>
      </div>
      
      <p style="margin: 30px 0 0 0; font-size: 16px; line-height: 1.8;">
        We look forward to welcoming you to The Druids Den!
      </p>
      
      <p style="margin: 20px 0 0 0; font-size: 16px;">
        Warmly,<br>
        <strong>Ryan and Lacey at The Druids Den</strong>
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background: rgba(186, 182, 162, 0.15); padding: 25px 30px; border-top: 1px solid #e0e0e0; text-align: center;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #464645;">
        Questions? Contact us at <a href="mailto:grovekeeper@druidsdenwi.com" style="color: #464645; text-decoration: none; font-weight: 600;">grovekeeper@druidsdenwi.com</a>
      </p>
      <p style="margin: 0; font-size: 12px; color: rgba(70, 70, 69, 0.6);">
        This is an automated confirmation. Please do not reply to this email.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()

  return { subject, text, html }
}
