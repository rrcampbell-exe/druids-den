import { describe, it, expect, beforeEach, vi } from 'vitest'
import handler from '../../api/receive-email'
import { setupTestEnv } from '../helpers/testEnv'

describe('receive-email API', () => {
  let req, res, fetchSpy

  setupTestEnv({
    RESEND_API_KEY: 'test-api-key-123',
    RESEND_WEBHOOK_SECRET: ''
  })

  beforeEach(() => {
    // Mock request object with proper webhook structure
    req = {
      method: 'POST',
      body: {
        type: 'email.received',
        data: {
          from: 'customer@example.com',
          to: ['info@druidsdenwi.com'],
          subject: 'Test Subject',
          email_id: 'email_123',
          created_at: '2026-01-25T00:00:00.000Z'
        }
      },
      headers: {}
    }

    // Mock response object
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    }

    // Mock fetch globally
    fetchSpy = vi.spyOn(global, 'fetch')
    
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('HTTP Method Validation', () => {
    it('returns 405 for GET requests', async () => {
      req.method = 'GET'
      
      await handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(405)
      expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' })
    })

    it('accepts POST requests', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-123' })
      })
      
      await handler(req, res)
      
      expect(res.status).not.toHaveBeenCalledWith(405)
    })
  })

  describe('Email Forwarding', () => {
    it('forwards email notification', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-123' })
      })
      
      await handler(req, res)
      
      expect(fetchSpy).toHaveBeenCalled()
      const firstCall = fetchSpy.mock.calls[0]
      const body = JSON.parse(firstCall[1].body)
      
      expect(body.to).toBe('campbell.ryan.r@gmail.com')
    })

    it('preserves original from address in reply_to', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-123' })
      })
      
      await handler(req, res)
      
      const firstCall = fetchSpy.mock.calls[0]
      const body = JSON.parse(firstCall[1].body)
      
      expect(body.reply_to).toBe('customer@example.com')
    })

    it('includes subject with Fwd: prefix', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-123' })
      })
      
      await handler(req, res)
      
      const firstCall = fetchSpy.mock.calls[0]
      const body = JSON.parse(firstCall[1].body)
      
      expect(body.subject).toBe('Fwd: Test Subject')
    })

    it('includes both HTML and text content', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-123' })
      })
      
      await handler(req, res)
      
      const firstCall = fetchSpy.mock.calls[0]
      const body = JSON.parse(firstCall[1].body)
      
      expect(body.html).toBeTruthy()
      expect(body.text).toBeTruthy()
      expect(body.html).toContain('customer@example.com')
      expect(body.text).toContain('customer@example.com')
    })

    it('returns 200 when email forwarded successfully', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-123' })
      })
      
      await handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('handles Resend API errors', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server error',
        json: async () => { throw new Error('Not JSON') }
      })
      
      await handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String)
        })
      )
    })

    it('handles network errors', async () => {
      fetchSpy.mockRejectedValue(new Error('Network error'))
      
      await handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  describe('Email Service Not Configured', () => {
    it('returns 500 when RESEND_API_KEY is not set', async () => {
      vi.stubEnv('RESEND_API_KEY', '')
      vi.stubEnv('RESEND_WEBHOOK_SECRET', '')
      
      await handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Email service not configured'
        })
      )
    })
  })

  describe('Webhook Signature Verification', () => {
    beforeEach(() => {
      vi.stubEnv('RESEND_WEBHOOK_SECRET', 'test-webhook-secret')
      vi.stubEnv('RESEND_API_KEY', 'test-api-key-123')
    })

    it('rejects requests missing svix-signature header', async () => {
      req.headers['svix-timestamp'] = '1234567890'
      req.headers['svix-id'] = 'msg_123'
      
      await handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized - missing signature' })
    })

    it('rejects requests missing svix-timestamp header', async () => {
      req.headers['svix-signature'] = 'v1,signature_here'
      req.headers['svix-id'] = 'msg_123'
      
      await handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized - missing signature' })
    })

    it('rejects requests missing svix-id header', async () => {
      req.headers['svix-signature'] = 'v1,signature_here'
      req.headers['svix-timestamp'] = '1234567890'
      
      await handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized - missing signature' })
    })

    it('rejects requests with invalid signature', async () => {
      req.headers['svix-signature'] = 'v1,invalid_signature'
      req.headers['svix-timestamp'] = '1234567890'
      req.headers['svix-id'] = 'msg_123'
      
      await handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized - invalid signature' })
    })

    it('accepts requests with valid signature', async () => {
      const crypto = await import('node:crypto')
      const timestamp = '1234567890'
      const id = 'msg_test_123'
      const payload = `${id}.${timestamp}.${JSON.stringify(req.body)}`
      const validSignature = crypto
        .createHmac('sha256', 'test-webhook-secret')
        .update(payload)
        .digest('base64')
      
      req.headers['svix-signature'] = `v1,${validSignature}`
      req.headers['svix-timestamp'] = timestamp
      req.headers['svix-id'] = id

      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email_forwarded_123' })
      })
      
      await handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(200)
    })
  })
})
