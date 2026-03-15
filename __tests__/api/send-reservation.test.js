import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import handler from '../../api/send-reservation'
import { prisma } from '../../api/utils/db.js'
import { setupTestEnv } from '../helpers/testEnv'

vi.mock('../../api/utils/auth.js', () => ({
  requireApprovedUser: vi.fn().mockResolvedValue({
    user: {
      id: 'guest-1',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '(555) 123-4567',
      accountStatus: 'APPROVED',
    },
  }),
  getErrorResponse: (error, fallbackMessage = 'Internal server error') => ({
    statusCode: error?.statusCode || 500,
    body: {
      error: error?.message || fallbackMessage,
    },
  }),
}))

// Mock the database utility
vi.mock('../../api/utils/db.js', () => ({
  prisma: {
    reservation: {
      findMany: vi.fn().mockResolvedValue([]), // No conflicts by default
      create: vi.fn().mockResolvedValue({
        id: 1,
        checkIn: new Date('2026-06-01T00:00:00.000Z'),
        checkOut: new Date('2026-06-03T00:00:00.000Z'),
        adults: 2,
        children: 0,
        specialRequests: 'Early check-in please',
        status: 'PENDING',
        guestFirstName: 'John',
        guestLastName: 'Doe',
        guestEmail: 'john@example.com',
        guestPhone: '(555) 123-4567',
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
  }
}))

describe('send-reservation API', () => {
  let req, res, fetchSpy

  setupTestEnv({
    RESEND_API_KEY: 'test-api-key-123'
  })

  beforeEach(() => {
    // Mock request object
    req = {
      method: 'POST',
      body: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '(555) 123-4567',
        checkIn: '2026-06-01',
        checkOut: '2026-06-03',
        adults: 2,
        children: 0,
        specialRequests: 'Early check-in please'
      }
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
    fetchSpy.mockRestore()
    // Reset the findMany mock to default (no conflicts)
    prisma.reservation.findMany.mockResolvedValue([])
    // Clear mock call history
    prisma.reservation.findMany.mockClear()
    prisma.reservation.create.mockClear()
  })

  describe('HTTP Method Validation', () => {
    it('returns 405 for GET requests', async () => {
      req.method = 'GET'
      
      await handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(405)
      expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' })
    })

    it('returns 405 for PUT requests', async () => {
      req.method = 'PUT'
      
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

  describe('Request Validation', () => {
    it('returns 400 when firstName is missing', async () => {
      delete req.body.firstName
      
      await handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ 
          error: 'Invalid reservation data'
        })
      )
    })

    it('returns 400 when email is missing', async () => {
      delete req.body.email
      
      await handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ 
          error: 'Invalid reservation data'
        })
      )
    })

    it('returns 400 when checkIn is missing', async () => {
      delete req.body.checkIn
      
      await handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ 
          error: 'Invalid reservation data'
        })
      )
    })
  })

  describe('Date Conflict Detection', () => {
    it('returns 409 when dates conflict with existing reservation', async () => {
      // Mock findMany to return a conflicting reservation
      prisma.reservation.findMany.mockResolvedValueOnce([
        {
          id: 999,
          checkIn: new Date('2026-06-01T00:00:00.000Z'),
          checkOut: new Date('2026-06-04T00:00:00.000Z'),
          status: 'APPROVED',
          guestFirstName: 'Jane',
          guestLastName: 'Smith'
        }
      ])

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(409)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Date conflict',
          message: 'These dates overlap with an existing reservation. Please select different dates.',
          conflicts: expect.arrayContaining([
            expect.objectContaining({
              checkIn: '2026-06-01',
              checkOut: '2026-06-04'
            })
          ])
        })
      )

      // Should not create reservation or send emails
      expect(prisma.reservation.create).not.toHaveBeenCalled()
      expect(fetchSpy).not.toHaveBeenCalled()
    })

    it('returns 409 when dates conflict with pending reservation', async () => {
      // Mock findMany to return a pending conflicting reservation
      prisma.reservation.findMany.mockResolvedValueOnce([
        {
          id: 888,
          checkIn: new Date('2026-05-30T00:00:00.000Z'),
          checkOut: new Date('2026-06-02T00:00:00.000Z'),
          status: 'PENDING'
        }
      ])

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(409)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Date conflict'
        })
      )
    })

    it('allows reservation when no conflicts exist', async () => {
      // Default mock returns empty array (no conflicts)
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-123' })
      })

      await handler(req, res)

      expect(prisma.reservation.findMany).toHaveBeenCalled()
      expect(prisma.reservation.create).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
    })
  })

  describe('Approved user requirements', () => {
    it('links the reservation to the approved user account', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-123' })
      })

      await handler(req, res)

      expect(prisma.reservation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'guest-1',
          guestEmail: 'john@example.com',
        })
      })
    })
  })

  describe('Email Sending with Resend', () => {
    it('sends emails to admin and customer', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-123' })
      })
      
      await handler(req, res)
      
      // Should call fetch at least once (could be multiple for both emails)
      expect(fetchSpy).toHaveBeenCalled()
    })

    it('sends admin notification email to grovekeeper', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-123' })
      })
      
      await handler(req, res)
      
      const firstCall = fetchSpy.mock.calls[0]
      const body = JSON.parse(firstCall[1].body)
      
      expect(body.to).toBe('grovekeeper@druidsdenwi.com')
      expect(body.from).toContain('The Druids Den')
      expect(body.subject).toContain('New Reservation Request')
      expect(body.subject).toContain('John Doe')
    })

    it('sends customer confirmation email', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-123' })
      })
      
      await handler(req, res)
      
      const secondCall = fetchSpy.mock.calls[1]
      const body = JSON.parse(secondCall[1].body)
      
      expect(body.to).toBe('john@example.com')
      expect(body.from).toContain('The Druids Den')
      expect(body.subject).toContain('Reservation Request Received')
    })

    it('includes HTML content in emails', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-123' })
      })
      
      await handler(req, res)
      
      const firstCall = fetchSpy.mock.calls[0]
      const body = JSON.parse(firstCall[1].body)
      
      expect(body.html).toBeTruthy()
      expect(body.text).toBeTruthy()
    })

    it('returns 200 with success message when emails sent', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-123' })
      })
      
      await handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Reservation request sent successfully'
        })
      )
    })
  })

  describe('Email Service Not Configured', () => {
    it('returns 200 with note when RESEND_API_KEY is not set', async () => {
      vi.stubEnv('RESEND_API_KEY', '')
      
      await handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Reservation logged (email service not configured)',
          note: 'To send emails, set RESEND_API_KEY environment variable'
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('handles Resend API errors gracefully', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Server error'
      })
      
      await handler(req, res)
      
      // Should return 207 (partial success) or 500 depending on failures
      expect([207, 500]).toContain(res.status.mock.calls[0][0])
    })

    it('handles network errors', async () => {
      fetchSpy.mockRejectedValue(new Error('Network error'))
      
      await handler(req, res)
      
      // Could be 207 (partial) or 500 (full failure)  
      expect([207, 500]).toContain(res.status.mock.calls[0][0])
    })
  })

  describe('Reservation Data Handling', () => {
    it('includes all reservation details in emails', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-123' })
      })
      
      await handler(req, res)
      
      const firstCall = fetchSpy.mock.calls[0]
      const body = JSON.parse(firstCall[1].body)
      
      expect(body.text).toContain('John')
      expect(body.text).toContain('Doe')
      expect(body.text).toContain('john@example.com')
      expect(body.text).toContain('2026-06-01')
      expect(body.text).toContain('2026-06-03')
    })

    it('handles optional fields correctly', async () => {
      delete req.body.specialRequests
      delete req.body.children
      
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-123' })
      })
      
      await handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(200)
    })
  })
})
