import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Import using dynamic import to handle bracket syntax
const { default: handler } = await import(join(__dirname, '../../api/reservations/[id].js'))

// Mock the database utility
vi.mock('../../api/utils/db.js', () => ({
  prisma: {
    reservation: {
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn()
    }
  }
}))

// Mock email service
vi.mock('../../api/utils/emailService.js', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true })
}))

// Mock email templates
vi.mock('../../api/utils/emailTemplates.js', () => ({
  generateApprovalEmail: vi.fn().mockReturnValue({
    subject: 'Reservation Approved',
    text: 'Your reservation has been approved',
    html: '<p>Your reservation has been approved</p>'
  })
}))

vi.mock('../../api/utils/dashboardEmailTemplates.js', () => ({
  generateDenialEmail: vi.fn().mockReturnValue({
    subject: 'Reservation Denied',
    text: 'Your reservation has been denied',
    html: '<p>Your reservation has been denied</p>'
  }),
  generateCancellationEmail: vi.fn().mockReturnValue({
    subject: 'Reservation Cancelled',
    text: 'Your reservation has been cancelled',
    html: '<p>Your reservation has been cancelled</p>'
  }),
  generateReservationModificationEmail: vi.fn().mockReturnValue({
    subject: 'Reservation Modified',
    text: 'Your reservation has been modified',
    html: '<p>Your reservation has been modified</p>'
  })
}))

import { prisma } from '../../api/utils/db.js'

describe('reservations/[id] API', () => {
  let req, res

  beforeEach(() => {
    vi.clearAllMocks()

    req = {
      method: 'PATCH',
      query: { id: '1' },
      body: {}
    }

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    }
  })

  describe('PATCH /api/reservations/[id]', () => {
    it('updates reservation status to approved', async () => {
      req.body = { status: 'approved' }

      const mockReservation = {
        id: '1',
        checkIn: new Date('2026-02-15T00:00:00.000Z'),
        checkOut: new Date('2026-02-17T00:00:00.000Z'),
        adults: 2,
        children: 0,
        status: 'PENDING',
        guestFirstName: 'John',
        guestLastName: 'Doe',
        guestEmail: 'john@example.com',
        guestPhone: '(555) 123-4567',
        specialRequests: null,
        isOwnerReservation: false,
        submittedAt: new Date(),
        statusChangedAt: new Date(),
        denialMessage: null,
        cancellationMessage: null,
        deletedAt: null
      }

      const updatedReservation = { ...mockReservation, status: 'APPROVED' }

      prisma.reservation.update.mockResolvedValue(updatedReservation)

      await handler(req, res)

      expect(prisma.reservation.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          status: 'APPROVED',
          statusChangedAt: expect.any(Date),
          statusChangedById: null
        }
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('updates reservation status to denied with reason', async () => {
      req.body = { status: 'denied', denialMessage: 'Not available' }

      const mockReservation = {
        id: '1',
        status: 'PENDING',
        guestEmail: 'john@example.com',
        guestFirstName: 'John',
        guestLastName: 'Doe',
        guestPhone: '555-0123',
        checkIn: new Date('2026-02-15T00:00:00.000Z'),
        checkOut: new Date('2026-02-17T00:00:00.000Z'),
        adults: 2,
        children: 0,
        specialRequests: null,
        isOwnerReservation: false,
        submittedAt: new Date(),
        statusChangedAt: null,
        denialMessage: null,
        cancellationMessage: null,
        deletedAt: null
      }

      prisma.reservation.update.mockResolvedValue({ ...mockReservation, status: 'DENIED', denialMessage: 'Not available' })

      await handler(req, res)

      expect(prisma.reservation.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          status: 'DENIED',
          denialMessage: 'Not available',
          statusChangedAt: expect.any(Date),
          statusChangedById: null
        }
      })
    })

    it('updates reservation dates and checks for conflicts', async () => {
      req.body = {
        checkIn: '2026-03-01',
        checkOut: '2026-03-05',
        adults: 3,
        children: 1
      }

      const mockReservation = {
        id: 1,
        checkIn: new Date('2026-02-15T00:00:00.000Z'),
        checkOut: new Date('2026-02-17T00:00:00.000Z'),
        adults: 2,
        children: 0,
        status: 'APPROVED',
        guestEmail: 'john@example.com',
        guestFirstName: 'John',
        guestLastName: 'Doe',
        isOwnerReservation: false,
        deletedAt: null
      }

      prisma.reservation.findUnique.mockResolvedValue(mockReservation)
      prisma.reservation.findMany.mockResolvedValue([]) // No conflicts
      prisma.reservation.update.mockResolvedValue({
        ...mockReservation,
        checkIn: new Date('2026-03-01T00:00:00.000Z'),
        checkOut: new Date('2026-03-05T00:00:00.000Z'),
        adults: 3,
        children: 1
      })

      await handler(req, res)

      expect(prisma.reservation.findMany).toHaveBeenCalledWith({
        where: {
          id: { not: '1' },
          deletedAt: null,
          status: { in: ['APPROVED', 'PENDING'] },
          OR: expect.any(Array)
        }
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('returns 400 when checkIn date format is invalid', async () => {
      req.body = {
        checkIn: 'invalid-date',
        checkOut: '2026-03-05'
      }

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid check-in date format (use YYYY-MM-DD)'
      })
    })

    it('returns 400 when checkOut date format is invalid', async () => {
      req.body = {
        checkIn: '2026-03-01',
        checkOut: '03/05/2026'
      }

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid check-out date format (use YYYY-MM-DD)'
      })
    })

    it('returns 400 when checkOut is before or equal to checkIn', async () => {
      req.body = {
        checkIn: '2026-03-05',
        checkOut: '2026-03-01'
      }

      const mockReservation = {
        id: '1',
        checkIn: new Date('2026-02-15T00:00:00.000Z'),
        checkOut: new Date('2026-02-17T00:00:00.000Z'),
        deletedAt: null
      }

      prisma.reservation.findUnique.mockResolvedValue(mockReservation)

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Check-out date must be after check-in date'
      })
    })

    it('returns 400 when date conflict exists', async () => {
      req.body = {
        checkIn: '2026-03-01',
        checkOut: '2026-03-05'
      }

      const mockReservation = {
        id: '1',
        checkIn: new Date('2026-02-15T00:00:00.000Z'),
        checkOut: new Date('2026-02-17T00:00:00.000Z'),
        deletedAt: null
      }

      const conflictingReservation = {
        id: 2,
        checkIn: new Date('2026-03-02T00:00:00.000Z'),
        checkOut: new Date('2026-03-04T00:00:00.000Z')
      }

      prisma.reservation.findUnique.mockResolvedValue(mockReservation)
      prisma.reservation.findMany.mockResolvedValue([conflictingReservation])

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Date conflict',
        message: 'These dates overlap with an existing reservation',
        conflicts: [
          {
            checkIn: '2026-03-02',
            checkOut: '2026-03-04'
          }
        ]
      })
    })

    it('returns error when Prisma update fails', async () => {
      prisma.reservation.update.mockRejectedValue(new Error('Record not found'))
      
      req.body = { status: 'approved' }

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Failed to update reservation'
      })
    })

    it('updates reservation even if previously soft-deleted', async () => {
      prisma.reservation.update.mockResolvedValue({
        id: '1',
        guestFirstName: 'John',
        guestLastName: 'Doe',
        guestEmail: 'john@example.com',
        guestPhone: '555-0123',
        checkIn: new Date('2026-03-01'),
        checkOut: new Date('2026-03-03'),
        adults: 2,
        children: 0,
        specialRequests: null,
        status: 'APPROVED',
        isOwnerReservation: false,
        submittedAt: new Date('2026-01-01'),
        statusChangedAt: new Date(),
        denialMessage: null,
        cancellationMessage: null,
        deletedAt: new Date('2026-01-15') // Previously deleted
      })
      
      req.body = { status: 'approved' }

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        id: '1',
        status: 'approved'
      }))
    })
  })

  describe('DELETE /api/reservations/[id]', () => {
    beforeEach(() => {
      req.method = 'DELETE'
    })

    it('soft deletes a reservation', async () => {
      const mockReservation = {
        id: '1',
        status: 'APPROVED',
        guestEmail: 'john@example.com',
        guestFirstName: 'John',
        guestLastName: 'Doe',
        checkIn: new Date('2026-02-15T00:00:00.000Z'),
        checkOut: new Date('2026-02-17T00:00:00.000Z'),
        deletedAt: null
      }

      prisma.reservation.update.mockResolvedValue({
        ...mockReservation,
        deletedAt: new Date()
      })

      await handler(req, res)

      expect(prisma.reservation.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          deletedAt: expect.any(Date)
        }
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Reservation deleted successfully',
        id: '1'
      })
    })

    it('returns error when deletion fails', async () => {
      prisma.reservation.findUnique.mockResolvedValue({ id: '1' })
      prisma.reservation.update.mockRejectedValue(new Error('Record not found'))

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Failed to delete reservation'
      })
    })
  })
})
