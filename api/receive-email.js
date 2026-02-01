// Webhook endpoint for Resend inbound emails
// Forwards all emails received at *@druidsdenwi.com to campbell.ryan.r@gmail.com

import crypto from 'node:crypto'
import { sanitizeEmail, sanitizeText } from './utils/sanitize.js'

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verify webhook signature using Svix
    const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET
    
    if (WEBHOOK_SECRET) {
      const signature = req.headers['svix-signature']
      const timestamp = req.headers['svix-timestamp']
      const id = req.headers['svix-id']
      
      if (!signature || !timestamp || !id) {
        console.error('Missing Svix webhook signature headers')
        return res.status(401).json({ error: 'Unauthorized - missing signature' })
      }

      // Verify Svix signature
      const payload = `${id}.${timestamp}.${JSON.stringify(req.body)}`
      const expectedSignature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(payload)
        .digest('base64')
      
      // Svix signature format: "v1,<signature>"
      const signatureParts = signature.split(',')
      const actualSignature = signatureParts[1]
      
      if (actualSignature !== expectedSignature) {
        console.error('Invalid webhook signature')
        return res.status(401).json({ error: 'Unauthorized - invalid signature' })
      }
    }

    const webhookData = req.body
    const emailMetadata = webhookData.data

    // Sanitize email metadata to prevent injection attacks
    const sanitizedFrom = sanitizeEmail(emailMetadata.from)
    const sanitizedSubject = sanitizeText(emailMetadata.subject || '(No Subject)')
    const sanitizedTo = Array.isArray(emailMetadata.to) 
      ? emailMetadata.to.map(email => sanitizeEmail(email).sanitized).filter(e => e)
      : []

    // Log the incoming email
    console.log('Received inbound email:', {
      from: sanitizedFrom.sanitized,
      to: sanitizedTo,
      subject: sanitizedSubject,

      email_id: emailMetadata.email_id
    })

    // Forward the email using Resend
    const RESEND_API_KEY = process.env.RESEND_API_KEY

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return res.status(500).json({ error: 'Email service not configured' })
    }

    // Note: Resend's webhook only provides metadata, not the email body
    // For full content, users need to check the Resend dashboard
    const forwardedEmail = {
      from: 'grovekeeper@druidsdenwi.com',
      to: 'campbell.ryan.r@gmail.com',
      subject: `Fwd: ${sanitizedSubject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #464645; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>From:</strong> ${sanitizedFrom.sanitized}</p>
            <p style="margin: 5px 0;"><strong>To:</strong> ${sanitizedTo.join(', ')}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> ${sanitizedSubject}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(emailMetadata.created_at).toLocaleString()}</p>
          </div>
          <div style="padding: 15px; border: 1px solid #e0e0e0;">
            <p><em>View full email content in your Resend dashboard.</em></p>
            <p><strong>Email ID:</strong> ${emailMetadata.email_id}</p>
          </div>
        </div>
      `,
      text: `
New email received at ${sanitizedTo.join(', ')}

From: ${sanitizedFrom.sanitized}
Subject: ${sanitizedSubject}
Date: ${new Date(emailMetadata.created_at).toLocaleString()}

View full email content in your Resend dashboard.
Email ID: ${emailMetadata.email_id}
      `,
      ...(sanitizedFrom.valid ? { reply_to: sanitizedFrom.sanitized } : {})
    }

    // Send notification via Resend API
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
      console.error('Failed to forward email notification:', data)
      return res.status(500).json({ error: 'Failed to forward email', details: data })
    }

    console.log('Email notification forwarded successfully:', data.id)
    return res.status(200).json({ success: true, forwarded: true, emailId: data.id })

  } catch (error) {
    console.error('Error processing inbound email:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
