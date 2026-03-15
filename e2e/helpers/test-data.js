const toIsoDate = (date) => date.toISOString().split('T')[0]

const daysFromToday = (days) => {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return date
}

const createReservation = ({
  id,
  firstName,
  lastName,
  email,
  phone,
  checkInOffset,
  checkOutOffset,
  adults = 2,
  children = 0,
  specialRequests = '',
  status = 'pending',
  isOwnerReservation = false,
  ownerNote = null,
  submittedOffset = -1,
}) => {
  const submittedAt = new Date()
  submittedAt.setHours(12, 0, 0, 0)
  submittedAt.setDate(submittedAt.getDate() + submittedOffset)

  return {
    id,
    firstName,
    lastName,
    email,
    phone,
    checkIn: toIsoDate(daysFromToday(checkInOffset)),
    checkOut: toIsoDate(daysFromToday(checkOutOffset)),
    adults,
    children,
    specialRequests,
    status,
    isOwnerReservation,
    submittedAt: submittedAt.toISOString(),
    statusChangedAt: submittedAt.toISOString(),
    approvedAt: status === 'approved' ? submittedAt.toISOString() : null,
    estimatedTotal: Math.max(checkOutOffset - checkInOffset, 2) * 150,
    ownerNote,
    denialMessage: null,
    cancellationMessage: null,
    userId: null,
  }
}

export const testUsers = {
  approvedGuest: {
    email: process.env.E2E_APPROVED_GUEST_EMAIL || 'playwright.approved@example.com',
    password: process.env.E2E_APPROVED_GUEST_PASSWORD || '',
    appUser: {
      id: 'guest-approved-1',
      clerkId: 'clerk-approved-1',
      email: process.env.E2E_APPROVED_GUEST_EMAIL || 'playwright.approved@example.com',
      firstName: 'Poppy',
      lastName: 'Guest',
      phone: '(715) 555-0111',
      role: 'GUEST',
      accountStatus: 'APPROVED',
      accountStatusChangedAt: new Date().toISOString(),
      accountStatusChangedBy: 'owner-1',
      marketingOptIn: false,
      preferredContactMethod: 'EMAIL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  pendingGuest: {
    email: process.env.E2E_PENDING_GUEST_EMAIL || 'playwright.pending@example.com',
    password: process.env.E2E_PENDING_GUEST_PASSWORD || '',
    appUser: {
      id: 'guest-pending-1',
      clerkId: 'clerk-pending-1',
      email: process.env.E2E_PENDING_GUEST_EMAIL || 'playwright.pending@example.com',
      firstName: 'Perry',
      lastName: 'Pending',
      phone: '(715) 555-0112',
      role: 'GUEST',
      accountStatus: 'PENDING_APPROVAL',
      accountStatusChangedAt: null,
      accountStatusChangedBy: null,
      marketingOptIn: false,
      preferredContactMethod: 'EMAIL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  owner: {
    email: process.env.E2E_OWNER_EMAIL || 'playwright.owner@example.com',
    password: process.env.E2E_OWNER_PASSWORD || '',
    appUser: {
      id: 'owner-1',
      clerkId: 'clerk-owner-1',
      email: process.env.E2E_OWNER_EMAIL || 'playwright.owner@example.com',
      firstName: 'Rowan',
      lastName: 'Owner',
      phone: '(715) 555-0100',
      role: 'OWNER',
      accountStatus: 'APPROVED',
      accountStatusChangedAt: new Date().toISOString(),
      accountStatusChangedBy: 'owner-1',
      marketingOptIn: false,
      preferredContactMethod: 'EMAIL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
}

export const availabilityReservations = [
  createReservation({
    id: 'reservation-approved-1',
    firstName: 'Astrid',
    lastName: 'North',
    email: 'astrid@example.com',
    phone: '(715) 555-0130',
    checkInOffset: 14,
    checkOutOffset: 17,
    status: 'approved',
  }),
  createReservation({
    id: 'reservation-pending-1',
    firstName: 'Bram',
    lastName: 'Pine',
    email: 'bram@example.com',
    phone: '(715) 555-0131',
    checkInOffset: 24,
    checkOutOffset: 27,
    status: 'pending',
  }),
]

export const dashboardReservations = [
  createReservation({
    id: 'reservation-pending-dashboard',
    firstName: 'Hazel',
    lastName: 'Trail',
    email: 'hazel@example.com',
    phone: '(715) 555-0132',
    checkInOffset: 20,
    checkOutOffset: 23,
    specialRequests: 'Would love an early check-in if possible.',
    status: 'pending',
  }),
  createReservation({
    id: 'reservation-approved-dashboard',
    firstName: 'Silas',
    lastName: 'Lake',
    email: 'silas@example.com',
    phone: '(715) 555-0133',
    checkInOffset: 35,
    checkOutOffset: 39,
    specialRequests: 'Bringing snowshoes.',
    status: 'approved',
  }),
  createReservation({
    id: 'reservation-owner-dashboard',
    firstName: 'Owner',
    lastName: 'Reservation',
    email: 'owner@example.com',
    phone: '(715) 555-0199',
    checkInOffset: 42,
    checkOutOffset: 46,
    status: 'approved',
    isOwnerReservation: true,
    ownerNote: 'Family weekend at the cabin.',
  }),
]

export const guestAccounts = [
  {
    ...testUsers.pendingGuest.appUser,
  },
  {
    ...testUsers.approvedGuest.appUser,
  },
  {
    id: 'guest-denied-1',
    clerkId: 'clerk-denied-1',
    email: 'playwright.denied@example.com',
    firstName: 'Della',
    lastName: 'Denied',
    phone: '(715) 555-0113',
    role: 'GUEST',
    accountStatus: 'DENIED',
    accountStatusChangedAt: new Date().toISOString(),
    accountStatusChangedBy: 'owner-1',
    marketingOptIn: false,
    preferredContactMethod: 'EMAIL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'guest-revoked-1',
    clerkId: 'clerk-revoked-1',
    email: 'playwright.revoked@example.com',
    firstName: 'Rhea',
    lastName: 'Revoked',
    phone: '(715) 555-0114',
    role: 'GUEST',
    accountStatus: 'REVOKED',
    accountStatusChangedAt: new Date().toISOString(),
    accountStatusChangedBy: 'owner-1',
    marketingOptIn: false,
    preferredContactMethod: 'EMAIL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const weatherFixture = {
  current: {
    temp_f: 47,
    condition: {
      text: 'Partly Cloudy',
    },
  },
}
