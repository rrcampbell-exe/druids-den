/**
 * Additional email template generators for dashboard functionality
 * These complement the existing emailTemplates.js file
 */

/**
 * Format date string to "Month Day, Year" format
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date (e.g., "January 25, 2026")
 */
function formatDateForEmail(dateString) {
  // Parse YYYY-MM-DD as UTC to avoid timezone shifts
  // Split the date string and create date using year, month-1, day
  const [year, month, day] = dateString.split('T')[0].split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Generate pre-arrival check-in instructions email
 * @param {Object} reservation - The reservation details
 * @param {string} doorCode - The door lock code
 * @param {string} wifiPassword - The WiFi password
 * @returns {Object} Email content with subject, text, and html
 */
export function generatePreArrivalEmail(reservation, doorCode = '[DOOR CODE]', wifiPassword = '[WIFI PASSWORD]') {
  const { firstName, checkIn } = reservation
  
  const subject = `Check-in Instructions for The Druids Den - Arriving ${new Date(checkIn).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
  
  const text = `
Welcome to The Druids Den!

Hi ${firstName},

Your stay is just around the corner! Here's everything you need for a smooth check-in.

ACCESS INFORMATION:
Door Lock Code: ${doorCode}
WiFi Password: ${wifiPassword}

(Please keep this information private)

CHECK-IN DETAILS:
Check-in time: 3:00 PM on ${formatDateForEmail(checkIn)}

Have questions? Reply to this email.

Safe travels!

Best regards,
Ryan and Lacey at The Druids Den
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
    <div style="background: linear-gradient(135deg, rgba(107, 142, 111, 0.9) 0%, rgba(107, 142, 111, 0.85) 100%); padding: 40px 30px; text-align: center; border-bottom: 3px solid #4a6b4d;">
      <h1 style="margin: 0; font-size: 32px; font-weight: 600; color: white;">🌲 Welcome! 🌲</h1>
    </div>
    
    <div style="padding: 40px 30px; background-color: #fff;">
      <p style="margin: 0 0 20px 0;">Hi ${firstName},</p>
      
      <div style="background: #6b8e6f; color: white; padding: 25px; border-radius: 8px; margin: 30px 0;">
        <h2 style="margin: 0 0 20px 0; color: white;">🔑 Access Information</h2>
        <p style="font-size: 20px; margin: 15px 0; font-weight: 600;">Door Code: ${doorCode}</p>
        <p style="font-size: 20px; margin: 15px 0; font-weight: 600;">WiFi: ${wifiPassword}</p>
      </div>
      
      <p>Check-in: 3:00 PM on ${formatDateForEmail(checkIn)}</p>
      
      <p style="margin: 20px 0 0 0;">
        Best regards,<br>
        <strong>Ryan and Lacey</strong>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
  
  return { subject, text, html }
}

/**
 * Generate post-checkout feedback request email
 * @param {Object} reservation - The reservation details
 * @param {string} baseUrl - The base URL of your site (e.g., 'https://druidsdenwi.com')
 * @returns {Object} Email content with subject, text, and html
 */
export function generatePostCheckoutEmail(reservation, baseUrl = 'https://druidsdenwi.com') {
  const { firstName, checkIn, checkOut, id: reservationId } = reservation
  
  const feedbackUrl = `${baseUrl}/feedback/${reservationId}`
  
  const subject = `Thank You for Staying at The Druids Den! 🌲`
  
  const text = `
Thank You!

Dear ${firstName},

We hope you enjoyed your stay from ${formatDateForEmail(checkIn)} to ${formatDateForEmail(checkOut)}.

Your feedback helps us improve. Please share your experience:
${feedbackUrl}

Best regards,
Ryan and Lacey at The Druids Den
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
    <div style="background: linear-gradient(135deg, rgba(107, 142, 111, 0.9) 0%, rgba(107, 142, 111, 0.85) 100%); padding: 40px 30px; text-align: center; border-bottom: 3px solid #4a6b4d;">
      <h1 style="margin: 0; font-size: 32px; font-weight: 600; color: white;">🌲 Thank You! 🌲</h1>
    </div>
    
    <div style="padding: 40px 30px; background-color: #fff;">
      <p>Dear ${firstName},</p>
      
      <p>We hope you enjoyed your stay from ${formatDateForEmail(checkIn)} to ${formatDateForEmail(checkOut)}.</p>
      
      <p>Your feedback helps us improve and helps future guests know what to expect. We'd love to hear about your experience!</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${feedbackUrl}" style="display: inline-block; background: #6b8e6f; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px;">Share Your Feedback</a>
      </div>
      
      <p style="margin: 30px 0 0 0;">
        Best regards,<br>
        <strong>Ryan and Lacey</strong>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
  
  return { subject, text, html }
}

/**
 * Generate denial email
 * @param {Object} reservation - The reservation details
 * @param {string} denialMessage - The custom denial message
 * @returns {Object} Email content with subject, text, and html
 */
export function generateDenialEmail(reservation, denialMessage) {
  const { firstName, checkIn, checkOut } = reservation
  
  const subject = `Update on Your Druids Den Reservation Request`
  
  const text = `
Dear ${firstName},

Thank you for your interest in staying at The Druids Den from ${formatDateForEmail(checkIn)} to ${formatDateForEmail(checkOut)}.

Unfortunately, we're unable to accommodate your reservation request:

${denialMessage}

We hope to host you in the future!

Best regards,
Ryan and Lacey
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
    <div style="background: rgba(186, 182, 162, 0.9); padding: 40px 30px; text-align: center; border-bottom: 3px solid #464645;">
      <h1 style="margin: 0; font-size: 28px; color: #464645;">Reservation Update</h1>
    </div>
    
    <div style="padding: 40px 30px; background-color: #fff;">
      <p>Dear ${firstName},</p>
      
      <p>Thank you for your interest in staying at The Druids Den from ${formatDateForEmail(checkIn)} to ${formatDateForEmail(checkOut)}.</p>
      
      <div style="background: rgba(200, 100, 100, 0.1); border-left: 4px solid rgba(200, 100, 100, 0.8); padding: 20px; border-radius: 8px; margin: 30px 0;">
        <p style="margin: 0;">${denialMessage}</p>
      </div>
      
      <p>We hope to host you in the future!</p>
      
      <p style="margin: 20px 0 0 0;">
        Best regards,<br>
        <strong>Ryan and Lacey</strong>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
  
  return { subject, text, html }
}

/**
 * Generate cancellation email
 * @param {Object} reservation - The reservation details
 * @param {string} cancellationMessage - The custom cancellation message
 * @returns {Object} Email content with subject, text, and html
 */
export function generateCancellationEmail(reservation, cancellationMessage) {
  const { firstName, checkIn, checkOut } = reservation
  
  const subject = `The Druids Den Reservation Cancelled`
  
  const text = `
Dear ${firstName},

Your reservation from ${formatDateForEmail(checkIn)} to ${formatDateForEmail(checkOut)} has been cancelled.

${cancellationMessage}

We apologize for any inconvenience.

Best regards,
Ryan and Lacey
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
    <div style="background: rgba(186, 182, 162, 0.9); padding: 40px 30px; text-align: center; border-bottom: 3px solid #464645;">
      <h1 style="margin: 0; font-size: 28px; color: #464645;">Reservation Cancelled</h1>
    </div>
    
    <div style="padding: 40px 30px; background-color: #fff;">
      <p>Dear ${firstName},</p>
      
      <p>Your reservation from ${formatDateForEmail(checkIn)} to ${formatDateForEmail(checkOut)} has been cancelled.</p>
      
      <div style="background: rgba(200, 100, 100, 0.1); border-left: 4px solid rgba(200, 100, 100, 0.8); padding: 20px; border-radius: 8px; margin: 30px 0;">
        <p style="margin: 0;">${cancellationMessage}</p>
      </div>
      
      <p>We apologize for any inconvenience.</p>
      
      <p style="margin: 20px 0 0 0;">
        Best regards,<br>
        <strong>Ryan and Lacey</strong>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
  
  return { subject, text, html }
}

/**
 * Generate reservation modification email
 * @param {Object} reservation - The updated reservation details
 * @param {Object} changes - Object describing what changed
 * @returns {Object} Email content with subject, text, and html
 */
export function generateReservationModificationEmail(reservation, changes) {
  const { firstName, checkIn, checkOut } = reservation
  
  const subject = `Your Druids Den Reservation Has Been Updated`
  
  let changesText = ''
  if (changes.dates) {
    changesText += `New Dates: ${formatDateForEmail(checkIn)} to ${formatDateForEmail(checkOut)}\n`
  }
  if (changes.guests) {
    changesText += `Guests: ${reservation.adults} adult(s)`
    if (reservation.children > 0) changesText += `, ${reservation.children} child(ren)`
    changesText += '\n'
  }
  
  const text = `
Dear ${firstName},

Your reservation at The Druids Den has been updated with the following changes:

${changesText}
${changes.note ? `Note: ${changes.note}\n` : ''}
If you have any questions about these changes, please don't hesitate to reach out.

Best regards,
Ryan and Lacey
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
    <div style="background: linear-gradient(135deg, rgba(212, 185, 66, 0.9) 0%, rgba(212, 185, 66, 0.85) 100%); padding: 40px 30px; text-align: center; border-bottom: 3px solid #6b5a0f;">
      <h1 style="margin: 0; font-size: 28px; color: #464645;">Reservation Updated</h1>
    </div>
    
    <div style="padding: 40px 30px; background-color: #fff;">
      <p>Dear ${firstName},</p>
      
      <p>Your reservation at The Druids Den has been updated with the following changes:</p>
      
      <div style="background: rgba(212, 185, 66, 0.1); border-left: 4px solid #d4b942; padding: 20px; border-radius: 8px; margin: 30px 0;">
        ${changes.dates ? `<p style="margin: 0 0 10px 0;"><strong>New Dates:</strong><br>${formatDateForEmail(checkIn)} to ${formatDateForEmail(checkOut)}</p>` : ''}
        ${changes.guests ? `<p style="margin: 0;"><strong>Guests:</strong><br>${reservation.adults} adult(s)${reservation.children > 0 ? `, ${reservation.children} child(ren)` : ''}</p>` : ''}
      </div>
      
      ${changes.note ? `<p style="background: rgba(186, 182, 162, 0.1); padding: 15px; border-radius: 8px; margin: 20px 0;"><strong>Note:</strong> ${changes.note}</p>` : ''}
      
      <p>If you have any questions about these changes, please don't hesitate to reach out.</p>
      
      <p style="margin: 20px 0 0 0;">
        Best regards,<br>
        <strong>Ryan and Lacey</strong>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
  
  return { subject, text, html }
}

/**
 * Generate custom message email
 * @param {Object} reservation - The reservation details
 * @param {string} message - The custom message
 * @returns {Object} Email content with subject, text, and html
 */
export function generateCustomMessageEmail(reservation, message) {
  const { firstName } = reservation
  
  const subject = 'Message from Druid\'s Den'
  
  const text = `
Hi ${firstName},

${message}

Best regards,
Ryan and Lacey at The Druids Den
  `.trim()
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #464645; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #BAB6A2;">
  <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,1,0.1);">
    <div style="background: rgba(186, 182, 162, 0.9); padding: 40px 30px; text-align: center; border-bottom: 3px solid #464645;">
      <h1 style="margin: 0; font-size: 28px; color: #464645;">Message from The Druids Den</h1>
    </div>
    
    <div style="padding: 40px 30px; background-color: #fff;">
      <p>Hi ${firstName},</p>
      
      <div style="background: rgba(186, 182, 162, 0.1); border-left: 4px solid #464645; padding: 20px; border-radius: 8px; margin: 30px 0; white-space: pre-wrap;">
${message}
      </div>
      
      <p style="margin: 20px 0 0 0;">
        Best regards,<br>
        <strong>Ryan and Lacey</strong>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
  
  return { subject, text, html }
}
