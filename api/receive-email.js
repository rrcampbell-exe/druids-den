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

    const inboundEmail = req.body

    // Log the incoming email for debugging
    console.log('Received inbound email:', {
      from: inboundEmail.from,
      to: inboundEmail.to,
      subject: inboundEmail.subject,
      receivedAt: new Date().toISOString()
    })

    // Forward the email using Resend
    const RESEND_API_KEY = process.env.RESEND_API_KEY

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return res.status(500).json({ error: 'Email service not configured' })
    }

    // Prepare forwarded email
    const forwardedEmail = {
      from: 'grovekeeper@druidsdenwi.com',
      to: 'campbell.ryan.r@gmail.com',
      subject: `Fwd: ${inboundEmail.subject || '(No Subject)'}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #464645; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>From:</strong> ${inboundEmail.from}</p>
            <p style="margin: 5px 0;"><strong>To:</strong> ${inboundEmail.to}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> ${inboundEmail.subject || '(No Subject)'}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(inboundEmail.date || Date.now()).toLocaleString()}</p>
          </div>
          <div style="padding: 15px; border: 1px solid #e0e0e0;">
            ${inboundEmail.html || `<p>${inboundEmail.text || '(No content)'}</p>`}
          </div>
        </div>
      `,
      text: `
Forwarded Message:
From: ${inboundEmail.from}
To: ${inboundEmail.to}
Subject: ${inboundEmail.subject || '(No Subject)'}
Date: ${new Date(inboundEmail.date || Date.now()).toLocaleString()}

---

${inboundEmail.text || '(No content)'}
      `,
      reply_to: inboundEmail.from // Allow direct reply to original sender
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
