import { describe, it, expect, beforeEach, vi } from 'vitest'
import { sendEmail, sendBulkEmails } from '../../api/utils/emailService'
import { setupTestEnv } from '../helpers/testEnv'

describe('emailService', () => {
  let fetchSpy, consoleLogSpy, consoleErrorSpy

  setupTestEnv({
    RESEND_API_KEY: 'test-api-key-123'
  })

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch')
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
  })

  afterEach(() => {
    fetchSpy.mockClear()
    vi.restoreAllMocks()
  })

  describe('sendEmail', () => {
    const validEmail = {
      from: 'The Druids Den <grovekeeper@druidsdenwi.com>',
      to: 'test@example.com',
      subject: 'Test Subject',
      html: '<p>Test HTML</p>',
      text: 'Test text'
    }

    it('sends email via Resend API', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-123' })
      })

      const result = await sendEmail(validEmail)

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.resend.com/emails',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key-123',
            'Content-Type': 'application/json'
          })
        })
      )
      expect(result.success).toBe(true)
    })

    it('includes from address in email', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-123' })
      })

      await sendEmail(validEmail)

      const callArgs = fetchSpy.mock.calls[0]
      const body = JSON.parse(callArgs[1].body)
      
      expect(body.from).toContain('The Druids Den')
      expect(body.from).toContain('grovekeeper@druidsdenwi.com')
    })

    it('includes all email fields in request', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-123' })
      })

      await sendEmail(validEmail)

      const callArgs = fetchSpy.mock.calls[0]
      const body = JSON.parse(callArgs[1].body)
      
      expect(body.to).toBe('test@example.com')
      expect(body.subject).toBe('Test Subject')
      expect(body.html).toBe('<p>Test HTML</p>')
      expect(body.text).toBe('Test text')
    })

    it('returns success when email sent', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-123' })
      })

      const result = await sendEmail(validEmail)

      expect(result).toEqual({
        success: true,
        provider: 'resend',
        result: { id: 'email-123' }
      })
    })

    it('returns error when Resend API fails', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => 'Bad request'
      })

      await expect(sendEmail(validEmail)).rejects.toThrow('Failed to send email via Resend: 400')
    })

    it('handles network errors', async () => {
      fetchSpy.mockRejectedValue(new Error('Network error'))

      await expect(sendEmail(validEmail)).rejects.toThrow('Network error')
    })

    it('validates required fields', async () => {
      const invalidEmail = {
        to: 'test@example.com'
        // missing from, subject, text
      }

      await expect(sendEmail(invalidEmail)).rejects.toThrow('Missing required email fields')
      
      expect(fetchSpy).not.toHaveBeenCalled()
    })

    it('logs when API key is not configured', async () => {
      vi.stubEnv('RESEND_API_KEY', '')

      const validEmail = {
        from: 'The Druids Den <grovekeeper@druidsdenwi.com>',
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test text'
      }

      const result = await sendEmail(validEmail)

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('EMAIL NOT SENT')
      )
      expect(result.success).toBe(false)
      expect(fetchSpy).not.toHaveBeenCalled()
    })

    it('logs email details when API key is not configured', async () => {
      vi.stubEnv('RESEND_API_KEY', '')

      const validEmail = {
        from: 'The Druids Den <grovekeeper@druidsdenwi.com>',
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test text'
      }

      await sendEmail(validEmail)

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('test@example.com')
      )
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test Subject')
      )
    })
  })

  describe('sendBulkEmails', () => {
    const emails = [
      {
        from: 'The Druids Den <grovekeeper@druidsdenwi.com>',
        to: 'admin@example.com',
        subject: 'Admin Email',
        html: '<p>Admin content</p>',
        text: 'Admin content'
      },
      {
        from: 'The Druids Den <grovekeeper@druidsdenwi.com>',
        to: 'customer@example.com',
        subject: 'Customer Email',
        html: '<p>Customer content</p>',
        text: 'Customer content'
      }
    ]

    it('sends all emails sequentially', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-123' })
      })

      await sendBulkEmails(emails)

      expect(fetchSpy).toHaveBeenCalledTimes(2)
    })

    it('returns results for all emails', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-123' })
      })

      const results = await sendBulkEmails(emails)

      expect(results).toHaveLength(2)
      expect(results[0].success).toBe(true)
      expect(results[1].success).toBe(true)
    })

    it('continues sending even if one fails', async () => {
      fetchSpy
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          text: async () => 'Error'
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 'email-456' })
        })

      const results = await sendBulkEmails(emails)

      expect(results[0].success).toBe(false)
      expect(results[1].success).toBe(true)
      expect(fetchSpy).toHaveBeenCalledTimes(2)
    })

    it('handles empty array', async () => {
      const results = await sendBulkEmails([])

      expect(results).toEqual([])
      expect(fetchSpy).not.toHaveBeenCalled()
    })

    it('handles single email', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-789' })
      })

      const results = await sendBulkEmails([emails[0]])

      expect(results).toHaveLength(1)
      expect(results[0].success).toBe(true)
    })

    it('sends each email sequentially', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-123' })
      })

      const results = await sendBulkEmails(emails)

      expect(results).toHaveLength(2)
      expect(results[0].success).toBe(true)
      expect(results[1].success).toBe(true)
      expect(fetchSpy).toHaveBeenCalledTimes(2)
    })

    it('logs errors for failed emails', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => 'Bad request'
      })

      await sendBulkEmails(emails)

      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })

  describe('Integration scenarios', () => {
    it('handles reservation confirmation workflow', async () => {
      const adminEmail = {
        from: 'The Druids Den <grovekeeper@druidsdenwi.com>',
        to: 'grovekeeper@druidsdenwi.com',
        subject: 'New Reservation',
        html: '<p>New reservation received</p>',
        text: 'New reservation received'
      }

      const customerEmail = {
        from: 'The Druids Den <grovekeeper@druidsdenwi.com>',
        to: 'customer@example.com',
        subject: 'Confirmation',
        html: '<p>We received your request</p>',
        text: 'We received your request'
      }

      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-123' })
      })

      const results = await sendBulkEmails([adminEmail, customerEmail])

      expect(results).toHaveLength(2)
      expect(results.every(r => r.success)).toBe(true)
    })

    it('provides partial success information', async () => {
      fetchSpy
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 'email-success' })
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: async () => 'Server error'
        })

      const results = await sendBulkEmails([
        { from: 'The Druids Den <grovekeeper@druidsdenwi.com>', to: 'a@test.com', subject: 'Test', html: 'Test', text: 'Test' },
        { from: 'The Druids Den <grovekeeper@druidsdenwi.com>', to: 'b@test.com', subject: 'Test', html: 'Test', text: 'Test' }
      ])

      const successCount = results.filter(r => r.success).length
      const failureCount = results.filter(r => !r.success).length

      expect(successCount).toBe(1)
      expect(failureCount).toBe(1)
    })
  })
})
