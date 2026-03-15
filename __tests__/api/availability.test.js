import { describe, it, expect, beforeEach, vi } from 'vitest'
import handler from '../../api/availability'

vi.mock('../../api/_utils/db.js', () => ({
  prisma: {
    reservation: {
      findMany: vi.fn(),
    },
  },
}))

import { prisma } from '../../api/_utils/db.js'

describe('availability API', () => {
  let req
  let res

  beforeEach(() => {
    vi.clearAllMocks()
    req = { method: 'GET' }
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }
  })

  it('returns reservation availability for approved and pending reservations', async () => {
    prisma.reservation.findMany.mockResolvedValue([
      {
        checkIn: new Date('2026-06-01T00:00:00.000Z'),
        checkOut: new Date('2026-06-03T00:00:00.000Z'),
      },
    ])

    await handler(req, res)

    expect(prisma.reservation.findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        status: {
          in: ['APPROVED', 'PENDING'],
        },
      },
      select: {
        checkIn: true,
        checkOut: true,
      },
      orderBy: {
        checkIn: 'asc',
      },
    })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      reservations: [
        {
          checkIn: '2026-06-01',
          checkOut: '2026-06-03',
        },
      ],
    })
  })

  it('rejects unsupported methods', async () => {
    req.method = 'POST'

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' })
  })

  it('returns a 500 when the query fails', async () => {
    prisma.reservation.findMany.mockRejectedValue(new Error('db down'))

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch reservation availability' })
  })
})
