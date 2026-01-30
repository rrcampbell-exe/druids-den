import { prisma } from './utils/db.js'

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Fetch all non-deleted reservations with user data
    const reservations = await prisma.reservation.findMany({
      where: {
        deletedAt: null
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
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
        ownerNote: res.isOwnerReservation ? res.specialRequests : null // Owner notes stored in specialRequests
      }
    })

    return res.status(200).json({
      reservations: formattedReservations
    })
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return res.status(500).json({ 
      error: 'Failed to fetch reservations',
      details: error.message 
    })
  }
}
