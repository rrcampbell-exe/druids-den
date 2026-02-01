import { prisma } from './utils/db.js'

export default async function handler(req, res) {
  // POST - Create new reservation (owner reservations)
  if (req.method === 'POST') {
    try {
      const { 
        checkIn, 
        checkOut, 
        adults = 2, 
        children = 0, 
        ownerNote,
        ownerEmail // Owner's email for future reference
      } = req.body

      if (!checkIn || !checkOut) {
        return res.status(400).json({ error: 'Check-in and check-out dates are required' })
      }

      if (!ownerEmail) {
        return res.status(400).json({ error: 'Owner email is required' })
      }

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

      // Create owner reservation without userId (will add when Clerk auth is implemented)
      const reservation = await prisma.reservation.create({
        data: {
          guestFirstName: 'Owner',
          guestLastName: 'Reservation',
          guestEmail: ownerEmail,
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
          submittedAt: new Date(),
        }
      })

      // Format response
      const responseCheckInDate = new Date(reservation.checkIn)
      const responseCheckOutDate = new Date(reservation.checkOut)
      const nights = Math.ceil((responseCheckOutDate - responseCheckInDate) / (1000 * 60 * 60 * 24))

      return res.status(201).json({
        id: reservation.id,
        firstName: reservation.guestFirstName,
        lastName: reservation.guestLastName,
        email: reservation.guestEmail,
        phone: reservation.guestPhone,
        checkIn: reservation.checkIn.toISOString().split('T')[0],
        checkOut: reservation.checkOut.toISOString().split('T')[0],
        adults: reservation.adults,
        children: reservation.children,
        specialRequests: reservation.specialRequests,
        status: reservation.status.toLowerCase(),
        isOwnerReservation: reservation.isOwnerReservation,
        submittedAt: reservation.submittedAt.toISOString(),
        statusChangedAt: reservation.statusChangedAt.toISOString(),
        approvedAt: reservation.statusChangedAt.toISOString(),
        estimatedTotal: nights * 150,
        ownerNote: reservation.ownerNotes,
      })
    } catch (error) {
      console.error('Error creating reservation:', error)
      return res.status(500).json({ 
        error: 'Failed to create reservation' 
      })
    }
  }

  // GET - Fetch all reservations
  if (req.method === 'GET') {

  try {
    // Fetch all non-deleted reservations with user data
    const reservations = await prisma.reservation.findMany({
      where: {
        deletedAt: null
      },
      orderBy: {
        checkIn: 'asc'
      }
    })

    // Transform to match the format expected by the frontend
    const formattedReservations = reservations.map(res => {
      // Calculate nights for estimatedTotal
      const checkInDate = new Date(res.checkIn)
      const checkOutDate = new Date(res.checkOut)
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
      const estimatedTotal = nights * 150 // $150 per night
      
      return {
        id: res.id,
        // Map to frontend field names (firstName/lastName not guestFirstName/guestLastName)
        firstName: res.guestFirstName,
        lastName: res.guestLastName,
        email: res.guestEmail,
        phone: res.guestPhone,
        checkIn: res.checkIn.toISOString().split('T')[0], // Format as YYYY-MM-DD
        checkOut: res.checkOut.toISOString().split('T')[0],
        adults: res.adults,
        children: res.children,
        specialRequests: res.specialRequests,
        status: res.status.toLowerCase(), // Convert PENDING to 'pending'
        isOwnerReservation: res.isOwnerReservation,
        submittedAt: res.submittedAt ? res.submittedAt.toISOString() : null,
        statusChangedAt: res.statusChangedAt ? res.statusChangedAt.toISOString() : null,
        approvedAt: res.status === 'APPROVED' && res.statusChangedAt ? res.statusChangedAt.toISOString() : null,
        estimatedTotal,
        ownerNote: res.isOwnerReservation ? res.ownerNotes : null
      }
    })

    return res.status(200).json({
      reservations: formattedReservations
    })
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return res.status(500).json({ 
      error: 'Failed to fetch reservations'
    })
  }
  }
}
