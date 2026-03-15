/**
 * Email service module for sending emails via Resend
 */

/**
 * Send an email using Resend API
 * @param {Object} emailData - Email configuration
 * @param {string} emailData.from - Sender email address
 * @param {string} emailData.to - Recipient email address
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.text - Plain text email body
 * @param {string} emailData.html - HTML email body (optional)
 * @param {string} apiKey - Resend API key
 * @returns {Promise<Object>} Response from the email service
 */
async function sendViaResend(emailData, apiKey) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html || undefined
    })
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Resend API error:', error)
    throw new Error(`Failed to send email via Resend: ${response.status}`)
  }

  return await response.json()
}

/**
 * Send an email using Resend
 * @param {Object} emailData - Email configuration
 * @param {string} emailData.from - Sender email address
 * @param {string} emailData.to - Recipient email address
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.text - Plain text email body
 * @param {string} emailData.html - HTML email body (optional)
 * @returns {Promise<Object>} Result of the email send operation
 */
export async function sendEmail(emailData) {
  // Validate required fields
  if (!emailData.from || !emailData.to || !emailData.subject || !emailData.text) {
    throw new Error('Missing required email fields: from, to, subject, text')
  }

  // Check if Resend is configured
  if (!process.env.RESEND_API_KEY) {
    // No email service configured - log to console (development only)
    console.log('=== EMAIL NOT SENT (No service configured) ===')
    console.log(`From: ${emailData.from}`)
    console.log(`To: ${emailData.to}`)
    console.log(`Subject: ${emailData.subject}`)
    console.log('---')
    console.log(emailData.text)
    console.log('=============================================')

    return {
      success: false,
      provider: 'none',
      message: 'Email service not configured. Set RESEND_API_KEY environment variable.'
    }
  }

  // Send via Resend
  const result = await sendViaResend(emailData, process.env.RESEND_API_KEY)
  return {
    success: true,
    provider: 'resend',
    result
  }
}

/**
 * Send multiple emails in sequence
 * @param {Array<Object>} emails - Array of email data objects
 * @returns {Promise<Array>} Array of results for each email
 */
export async function sendBulkEmails(emails) {
  const results = []
  
  for (const emailData of emails) {
    try {
      const result = await sendEmail(emailData)
      results.push({
        success: true,
        to: emailData.to,
        ...result
      })
    } catch (error) {
      results.push({
        success: false,
        to: emailData.to,
        error: 'Failed to send email'
      })
    }
  }
  
  return results
}
