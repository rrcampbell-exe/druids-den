// Webhook endpoint for Resend inbound emails
// Forwards all emails received at *@druidsdenwi.com to campbell.ryan.r@gmail.com

import crypto from 'node:crypto'

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Log all headers for debugging
    console.log('Webhook headers:', req.headers)
    
    // Verify webhook signature (temporarily disabled for debugging)
    const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET
    
    // TODO: Re-enable signature verification once we know the correct header names
    /*
    if (WEBHOOK_SECRET) {
      const signature = req.headers['resend-signature'] || req.headers['x-resend-signature']
      const timestamp = req.headers['resend-timestamp'] || req.headers['x-resend-timestamp']
      
      if (!signature || !timestamp) {
        console.error('Missing webhook signature or timestamp')
        return res.status(401).json({ error: 'Unauthorized - missing signature' })
      }

      // Verify signature
      const payload = `${timestamp}.${JSON.stringify(req.body)}`
      const expectedSignature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(payload)
        .digest('hex')
      
      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature')
        return res.status(401).json({ error: 'Unauthorized - invalid signature' })
      }
    }
    */

    const webhookData = req.body
    const emailMetadata = webhookData.data

    // Log the FULL webhook payload for debugging
    console.log('Full webhook payload:', JSON.stringify(webhookData, null, 2))

    // Log the incoming email for debugging
    console.log('Received inbound email webhook:', {
      type: webhookData.type,
      email_id: emailMetadata.email_id,
      from: emailMetadata.from,
      to: emailMetadata.to,
      subject: emailMetadata.subject,
      receivedAt: new Date().toISOString()
    })

    // Forward the email using Resend
    const RESEND_API_KEY = process.env.RESEND_API_KEY

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return res.status(500).json({ error: 'Email service not configured' })
    }

    // Fetch the full email content using the email_id
    // Try the inbound emails endpoint instead of the regular emails endpoint
    const emailResponse = await fetch(`https://api.resend.com/inbound/${emailMetadata.email_id}`, {
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Failed to fetch email content:', errorText)
      
      // If inbound endpoint fails, try the regular endpoint
      const fallbackResponse = await fetch(`https://api.resend.com/emails/${emailMetadata.email_id}`, {
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
      })
      
      if (!fallbackResponse.ok) {
        console.error('Fallback also failed:', await fallbackResponse.text())
        return res.status(500).json({ error: 'Failed to fetch email content from both endpoints' })
      }
      
      const fullEmail = await fallbackResponse.json()
      console.log('Fetched from fallback endpoint:', { has_html: !!fullEmail.html, has_text: !!fullEmail.text })
    } else {
      const fullEmail = await emailResponse.json()
      console.log('Fetched from inbound endpoint:', { has_html: !!fullEmail.html, has_text: !!fullEmail.text, keys: Object.keys(fullEmail) })
    }

    const fullEmail = await emailResponse.json()
    console.log('Fetched full email:', { has_html: !!fullEmail.html, has_text: !!fullEmail.text })

    // Prepare forwarded email
    const forwardedEmail = {
      from: 'grovekeeper@druidsdenwi.com',
      to: 'campbell.ryan.r@gmail.com',
      subject: `Fwd: ${emailMetadata.subject || '(No Subject)'}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #464645; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>From:</strong> ${emailMetadata.from}</p>
            <p style="margin: 5px 0;"><strong>To:</strong> ${emailMetadata.to.join(', ')}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> ${emailMetadata.subject || '(No Subject)'}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(emailMetadata.created_at).toLocaleString()}</p>
          </div>
          <div style="padding: 15px; border: 1px solid #e0e0e0;">
            ${fullEmail.html || `<p>${fullEmail.text || '(No content)'}</p>`}
          </div>
        </div>
      `,
      text: `
Forwarded Message:
From: ${emailMetadata.from}
To: ${emailMetadata.to.join(', ')}
Subject: ${emailMetadata.subject || '(No Subject)'}
Date: ${new Date(emailMetadata.created_at).toLocaleString()}

---

${fullEmail.text || fullEmail.html || '(No content)'}
      `,
      reply_to: emailMetadata.from // Allow direct reply to original sender
    }

    // Send via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(forwardedEmail),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Failed to forward email:', data)
      return res.status(500).json({ error: 'Failed to forward email', details: data })
    }

    console.log('Email forwarded successfully:', data.id)
    return res.status(200).json({ success: true, forwarded: true, emailId: data.id })

  } catch (error) {
    console.error('Error processing inbound email:', error)
    return res.status(500).json({ error: 'Internal server error', message: error.message })
  }
}
