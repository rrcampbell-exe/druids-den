import { prisma } from './_utils/db.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const reservations = await prisma.reservation.findMany({
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

    return res.status(200).json({
      reservations: reservations.map((reservation) => ({
        checkIn: reservation.checkIn.toISOString().split('T')[0],
        checkOut: reservation.checkOut.toISOString().split('T')[0],
      })),
    })
  } catch (error) {
    console.error('Error fetching reservation availability:', error)
    return res.status(500).json({
      error: 'Failed to fetch reservation availability',
    })
  }
}
