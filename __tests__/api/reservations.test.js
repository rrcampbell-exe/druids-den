import { describe, it, expect, beforeEach, vi } from 'vitest'
import handler from '../../api/reservations'

vi.mock('../../api/utils/auth.js', () => ({
  requireRole: vi.fn().mockResolvedValue({
    user: {
      id: 'owner-1',
      email: 'owner@example.com',
      role: 'OWNER',
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
      create: vi.fn(),
      findMany: vi.fn()
    }
  }
}))

import { prisma } from '../../api/utils/db.js'

describe('reservations API', () => {
  let req, res

  beforeEach(() => {
    vi.clearAllMocks()

    req = {
      method: 'GET',
      body: {}
    }

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    }
  })

  describe('GET /api/reservations', () => {
    it('returns all reservations', async () => {
      const mockReservations = [
        {
          id: 1,
          checkIn: new Date('2026-02-15T00:00:00.000Z'),
          checkOut: new Date('2026-02-17T00:00:00.000Z'),
          adults: 2,
          children: 0,
          status: 'PENDING',
          guestFirstName: 'John',
          guestLastName: 'Doe',
          guestEmail: 'john@example.com',
          guestPhone: '(555) 123-4567',
          specialRequests: 'Early check-in',
          isOwnerReservation: false,
          submittedAt: new Date('2026-01-15T00:00:00.000Z'),
          statusChangedAt: new Date('2026-01-15T00:00:00.000Z'),
          deletedAt: null
        },
        {
          id: 2,
          checkIn: new Date('2026-03-10T00:00:00.000Z'),
          checkOut: new Date('2026-03-12T00:00:00.000Z'),
          adults: 2,
          children: 0,
          status: 'APPROVED',
          isOwnerReservation: true,
          specialRequests: 'Owner block',
          submittedAt: new Date('2026-01-20T00:00:00.000Z'),
          statusChangedAt: new Date('2026-01-20T00:00:00.000Z'),
          deletedAt: null
        }
      ]

      prisma.reservation.findMany.mockResolvedValue(mockReservations)

      await handler(req, res)

      expect(prisma.reservation.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { checkIn: 'asc' }
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        reservations: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            checkIn: '2026-02-15',
            checkOut: '2026-02-17',
            status: 'pending'
          }),
          expect.objectContaining({
            id: 2,
            checkIn: '2026-03-10',
            checkOut: '2026-03-12',
            status: 'approved',
            isOwnerReservation: true
          })
        ])
      })
    })

    it('filters out soft-deleted reservations', async () => {
      prisma.reservation.findMany.mockResolvedValue([])

      await handler(req, res)

      expect(prisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deletedAt: null }
        })
      )
    })

    it('handles database errors gracefully', async () => {
      prisma.reservation.findMany.mockRejectedValue(new Error('Database error'))

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Database error'
      })
    })
  })

  describe('POST /api/reservations', () => {
    beforeEach(() => {
      req.method = 'POST'
      // Mock no conflicts for POST tests
      prisma.reservation.findMany.mockResolvedValue([])
    })

    it('creates owner reservation successfully', async () => {
      req.body = {
        checkIn: '2026-04-01',
        checkOut: '2026-04-05',
        adults: 2,
        children: 0,
        ownerNote: 'Personal use',
        ownerEmail: 'owner@example.com'
      }

      const mockCreatedReservation = {
        id: 3,
        checkIn: new Date('2026-04-01T00:00:00.000Z'),
        checkOut: new Date('2026-04-05T00:00:00.000Z'),
        adults: 2,
        children: 0,
        status: 'APPROVED',
        isOwnerReservation: true,
        specialRequests: 'Personal use',
        submittedAt: new Date(),
        statusChangedAt: new Date(),
        deletedAt: null
      }

      prisma.reservation.create.mockResolvedValue(mockCreatedReservation)

      await handler(req, res)

      expect(prisma.reservation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          checkIn: expect.any(Date),
          checkOut: expect.any(Date),
          adults: 2,
          children: 0,
          status: 'APPROVED',
          isOwnerReservation: true,
          ownerNotes: 'Personal use',
          guestEmail: 'owner@example.com',
          guestFirstName: 'Owner',
          guestLastName: 'Reservation'
        })
      })
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 3,
          checkIn: '2026-04-01',
          checkOut: '2026-04-05',
          status: 'approved',
          isOwnerReservation: true
        })
      )
    })

    it('returns 400 when checkIn is missing', async () => {
      req.body = {
        checkOut: '2026-04-05',
        ownerEmail: 'owner@example.com'
      }

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Check-in and check-out dates are required'
      })
    })

    it('returns 400 when checkOut is missing', async () => {
      req.body = {
        checkIn: '2026-04-01',
        ownerEmail: 'owner@example.com'
      }

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Check-in and check-out dates are required'
      })
    })

    it('uses the authenticated owner email when ownerEmail is missing', async () => {
      req.body = {
        checkIn: '2026-04-01',
        checkOut: '2026-04-05'
      }

      prisma.reservation.create.mockResolvedValue({
        id: 4,
        checkIn: new Date('2026-04-01T00:00:00.000Z'),
        checkOut: new Date('2026-04-05T00:00:00.000Z'),
        adults: 2,
        children: 0,
        status: 'APPROVED',
        isOwnerReservation: true,
        submittedAt: new Date(),
        statusChangedAt: new Date(),
        guestFirstName: 'Owner',
        guestLastName: 'Reservation',
        guestEmail: 'owner@example.com',
        guestPhone: '',
        specialRequests: null,
        ownerNotes: null,
      })

      await handler(req, res)

      expect(prisma.reservation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'owner-1',
          guestEmail: 'owner@example.com',
          statusChangedById: 'owner-1',
        })
      })
      expect(res.status).toHaveBeenCalledWith(201)
    })

    it('handles database errors during creation', async () => {
      req.body = {
        checkIn: '2026-04-01',
        checkOut: '2026-04-05',
        ownerEmail: 'owner@example.com'
      }

      prisma.reservation.create.mockRejectedValue(new Error('Database error'))

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Database error'
      })
    })

    it('uses default values for adults and children', async () => {
      req.body = {
        checkIn: '2026-04-01',
        checkOut: '2026-04-05',
        ownerEmail: 'owner@example.com'
      }

      prisma.reservation.create.mockResolvedValue({
        id: 4,
        checkIn: new Date('2026-04-01T00:00:00.000Z'),
        checkOut: new Date('2026-04-05T00:00:00.000Z'),
        adults: 2,
        children: 0,
        status: 'APPROVED',
        isOwnerReservation: true,
        submittedAt: new Date(),
        statusChangedAt: new Date(),
        deletedAt: null
      })

      await handler(req, res)

      expect(prisma.reservation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          adults: 2,
          children: 0
        })
      })
    })
  })
})
