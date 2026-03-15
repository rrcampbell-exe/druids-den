import { prisma } from './utils/db.js'
import { requireRole, getErrorResponse } from './utils/auth.js'
import { serializeReservation } from './utils/serializers.js'

export default async function handler(req, res) {
  // POST - Create new reservation (owner reservations)
  if (req.method === 'POST') {
    try {
      const { user: actor } = await requireRole(req, ['OWNER', 'ADMIN'])
      const { 
        checkIn, 
        checkOut, 
        adults = 2, 
        children = 0, 
        ownerNote,
        ownerEmail // Backwards-compatible fallback until the dashboard is updated
      } = req.body

      if (!checkIn || !checkOut) {
        return res.status(400).json({ error: 'Check-in and check-out dates are required' })
      }

      const reservationOwnerEmail = actor.email || ownerEmail

      // Validate date order
      const checkInDate = new Date(checkIn)
      const checkOutDate = new Date(checkOut)
      
      if (checkOutDate <= checkInDate) {
        return res.status(400).json({ error: 'Check-out date must be after check-in date' })
      }

      // Check for conflicts with existing APPROVED/PENDING reservations
      const conflictingReservations = await prisma.reservation.findMany({
        where: {
          deletedAt: null,
          status: { in: ['APPROVED', 'PENDING'] },
          OR: [
            {
              AND: [
                { checkIn: { lte: checkInDate } },
                { checkOut: { gt: checkInDate } }
              ]
            },
            {
              AND: [
                { checkIn: { lt: checkOutDate } },
                { checkOut: { gte: checkOutDate } }
              ]
            },
            {
              AND: [
                { checkIn: { gte: checkInDate } },
                { checkOut: { lte: checkOutDate } }
              ]
            }
          ]
        }
      })
      
      if (conflictingReservations.length > 0) {
        return res.status(400).json({ 
          error: 'Date conflict',
          message: 'These dates overlap with an existing reservation',
          conflicts: conflictingReservations.map(r => ({
            checkIn: r.checkIn.toISOString().split('T')[0],
            checkOut: r.checkOut.toISOString().split('T')[0]
          }))
        })
      }

      const reservation = await prisma.reservation.create({
        data: {
          userId: actor.id,
          guestFirstName: 'Owner',
          guestLastName: 'Reservation',
          guestEmail: reservationOwnerEmail,
          guestPhone: '',
          checkIn: checkInDate,
          checkOut: checkOutDate,
          adults,
          children,
          specialRequests: null,
          ownerNotes: ownerNote,
          status: 'APPROVED',
          isOwnerReservation: true,
          statusChangedAt: new Date(),
          statusChangedById: actor.id,
          submittedAt: new Date(),
        }
      })

      return res.status(201).json(serializeReservation(reservation))
    } catch (error) {
      const { statusCode, body } = getErrorResponse(error, 'Failed to create reservation')
      return res.status(statusCode).json(body)
    }
  }

  // GET - Fetch all reservations
  if (req.method === 'GET') {

  try {
    await requireRole(req, ['OWNER', 'ADMIN'])
    // Fetch all non-deleted reservations with user data
    const reservations = await prisma.reservation.findMany({
      where: {
        deletedAt: null
      },
      orderBy: {
        checkIn: 'asc'
      }
    })

    return res.status(200).json({
      reservations: reservations.map(serializeReservation)
    })
  } catch (error) {
    const { statusCode, body } = getErrorResponse(error, 'Failed to fetch reservations')
    return res.status(statusCode).json(body)
  }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
