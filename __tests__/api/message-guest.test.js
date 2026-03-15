import { describe, it, expect, beforeEach, vi } from 'vitest'
import handler from '../../api/message-guest'

vi.mock('../../api/_utils/db.js', () => ({
  prisma: {
    reservation: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('../../api/_utils/emailService.js', () => ({
  sendEmail: vi.fn(),
}))

vi.mock('../../api/_utils/dashboardEmailTemplates.js', () => ({
  generateCustomMessageEmail: vi.fn().mockReturnValue({
    subject: 'Guest Message',
    text: 'Plain text body',
    html: '<p>HTML body</p>',
  }),
}))

vi.mock('../../api/_utils/auth.js', () => ({
  requireRole: vi.fn().mockResolvedValue({
    user: { id: 'owner-1', role: 'OWNER', accountStatus: 'APPROVED' },
  }),
  getErrorResponse: (error, fallbackMessage = 'Internal server error') => ({
    statusCode: error?.statusCode || 500,
    body: {
      error: error?.message || fallbackMessage,
    },
  }),
}))

import { prisma } from '../../api/_utils/db.js'
import { sendEmail } from '../../api/_utils/emailService.js'
import { generateCustomMessageEmail } from '../../api/_utils/dashboardEmailTemplates.js'
import { requireRole } from '../../api/_utils/auth.js'

describe('message-guest API', () => {
  let req
  let res

  beforeEach(() => {
    vi.clearAllMocks()
    req = {
      method: 'POST',
      body: {
        reservationId: 'res-1',
        message: ' Hello guest ',
      },
    }
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }
  })

  it('rejects unsupported methods', async () => {
    req.method = 'GET'

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(405)
  })

  it('validates required fields', async () => {
    req.body = { message: 'hello' }
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Reservation ID is required' })

    req.body = { reservationId: 'res-1', message: '   ' }
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Message is required' })
  })

  it('returns 404 when the reservation does not exist', async () => {
    prisma.reservation.findUnique.mockResolvedValue(null)

    await handler(req, res)

    expect(requireRole).toHaveBeenCalledWith(req, ['OWNER', 'ADMIN'])
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ error: 'Reservation not found' })
  })

  it('rejects owner reservations and missing guest emails', async () => {
    prisma.reservation.findUnique.mockResolvedValueOnce({ isOwnerReservation: true })

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Cannot send messages to owner reservations' })

    prisma.reservation.findUnique.mockResolvedValueOnce({ isOwnerReservation: false, guestEmail: '' })
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Guest email not found' })
  })

  it('sends a guest message email', async () => {
    prisma.reservation.findUnique.mockResolvedValue({
      id: 'res-1',
      isOwnerReservation: false,
      guestEmail: 'guest@example.com',
      guestFirstName: 'Guest',
      guestLastName: 'User',
      checkIn: new Date('2026-06-10T00:00:00.000Z'),
      checkOut: new Date('2026-06-12T00:00:00.000Z'),
      adults: 2,
      children: 1,
    })

    await handler(req, res)

    expect(generateCustomMessageEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Guest',
        lastName: 'User',
        checkIn: '2026-06-10',
        checkOut: '2026-06-12',
      }),
      'Hello guest',
    )
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'guest@example.com',
      subject: 'Guest Message',
    }))
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Message sent successfully' })
  })

  it('uses the auth error helper for failures', async () => {
    requireRole.mockRejectedValueOnce(new Error('Not allowed'))

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'Not allowed' })
  })
})
