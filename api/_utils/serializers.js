import { calculateEstimatedTotal } from './pricing.js'

export function serializeReservation(reservation) {
  const checkIn = reservation.checkIn.toISOString().split('T')[0]
  const checkOut = reservation.checkOut.toISOString().split('T')[0]

  return {
    id: reservation.id,
    firstName: reservation.guestFirstName,
    lastName: reservation.guestLastName,
    email: reservation.guestEmail,
    phone: reservation.guestPhone,
    checkIn,
    checkOut,
    adults: reservation.adults,
    children: reservation.children,
    specialRequests: reservation.specialRequests,
    status: reservation.status.toLowerCase(),
    isOwnerReservation: reservation.isOwnerReservation,
    submittedAt: reservation.submittedAt ? reservation.submittedAt.toISOString() : null,
    statusChangedAt: reservation.statusChangedAt ? reservation.statusChangedAt.toISOString() : null,
    approvedAt: reservation.status === 'APPROVED' && reservation.statusChangedAt
      ? reservation.statusChangedAt.toISOString()
      : null,
    estimatedTotal: calculateEstimatedTotal(checkIn, checkOut),
    ownerNote: reservation.isOwnerReservation ? reservation.ownerNotes : null,
    denialMessage: reservation.denialMessage,
    cancellationMessage: reservation.cancellationMessage,
    userId: reservation.userId,
  }
}

export function serializeUser(user) {
  return {
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
    accountStatus: user.accountStatus,
    accountStatusChangedAt: user.accountStatusChangedAt ? user.accountStatusChangedAt.toISOString() : null,
    accountStatusChangedBy: user.accountStatusChangedBy,
    marketingOptIn: user.marketingOptIn,
    preferredContactMethod: user.preferredContactMethod,
    createdAt: user.createdAt ? user.createdAt.toISOString() : null,
    updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
  }
}
