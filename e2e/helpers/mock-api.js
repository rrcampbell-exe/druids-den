import { availabilityReservations, dashboardReservations, guestAccounts, testUsers, weatherFixture } from './test-data.js'

const json = async (route, payload, status = 200) => {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(payload),
  })
}

export async function mockWeather(page, fixture = weatherFixture) {
  await page.route('https://api.weatherapi.com/**', async (route) => {
    await json(route, fixture)
  })
}

export async function mockCurrentUser(page, user) {
  await page.route('**/api/user/status', async (route) => {
    await json(route, { user })
  })
}

export async function mockAvailability(page, reservations = availabilityReservations) {
  await page.route('**/api/availability', async (route) => {
    await json(route, { reservations })
  })
}

export async function mockReservationSubmission(page, onSubmit) {
  await page.route('**/api/send-reservation', async (route) => {
    const payload = route.request().postDataJSON()

    if (onSubmit) {
      await onSubmit(payload)
    }

    await json(route, {
      success: true,
      reservationId: 'reservation-playwright-created',
    })
  })
}

export async function mockApprovedGuestApis(page) {
  await mockCurrentUser(page, testUsers.approvedGuest.appUser)
  await mockAvailability(page)
}

export async function mockPendingGuestApis(page) {
  await mockCurrentUser(page, testUsers.pendingGuest.appUser)
}

export async function mockDashboardApis(page) {
  const reservations = structuredClone(dashboardReservations)
  const users = structuredClone(guestAccounts)

  await page.route('**/api/user/status', async (route) => {
    await json(route, { user: testUsers.owner.appUser })
  })

  await page.route('**/api/message-guest', async (route) => {
    await json(route, { success: true })
  })

  await page.route('**/api/users', async (route) => {
    const method = route.request().method()

    if (method === 'GET') {
      await json(route, { users })
      return
    }

    if (method === 'PATCH') {
      const payload = route.request().postDataJSON()
      const user = users.find((entry) => entry.id === payload.userId)

      if (!user) {
        await json(route, { error: 'Guest account not found' }, 404)
        return
      }

      user.accountStatus = payload.accountStatus
      user.accountStatusChangedAt = new Date().toISOString()
      user.accountStatusChangedBy = testUsers.owner.appUser.id

      await json(route, { user })
      return
    }

    await json(route, { error: 'Method not allowed' }, 405)
  })

  await page.route('**/api/reservations', async (route) => {
    const method = route.request().method()

    if (method === 'GET') {
      await json(route, { reservations })
      return
    }

    if (method === 'POST') {
      const payload = route.request().postDataJSON()
      const created = {
        id: `reservation-owner-${reservations.length + 1}`,
        firstName: 'Owner',
        lastName: 'Reservation',
        email: payload.ownerEmail,
        phone: testUsers.owner.appUser.phone,
        checkIn: payload.checkIn,
        checkOut: payload.checkOut,
        adults: 2,
        children: 0,
        specialRequests: '',
        status: 'approved',
        isOwnerReservation: true,
        submittedAt: new Date().toISOString(),
        statusChangedAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
        estimatedTotal: 150,
        ownerNote: payload.ownerNote,
        denialMessage: null,
        cancellationMessage: null,
        userId: testUsers.owner.appUser.id,
      }

      reservations.push(created)
      await json(route, created, 201)
      return
    }

    await json(route, { error: 'Method not allowed' }, 405)
  })

  await page.route(/\/api\/reservations\/[^/?#]+$/, async (route) => {
    const method = route.request().method()
    const reservationId = route.request().url().split('/').pop()
    const reservation = reservations.find((entry) => entry.id === reservationId)

    if (!reservation) {
      await json(route, { error: 'Reservation not found' }, 404)
      return
    }

    if (method === 'PATCH') {
      const payload = route.request().postDataJSON()

      if (payload.status) {
        reservation.status = payload.status
        reservation.statusChangedAt = new Date().toISOString()
        if (payload.status === 'approved') {
          reservation.approvedAt = reservation.statusChangedAt
        }
        if (payload.denialMessage) {
          reservation.denialMessage = payload.denialMessage
        }
        if (payload.cancellationMessage) {
          reservation.cancellationMessage = payload.cancellationMessage
        }
      }

      if (payload.checkIn) reservation.checkIn = payload.checkIn
      if (payload.checkOut) reservation.checkOut = payload.checkOut
      if (payload.adults !== undefined) reservation.adults = payload.adults
      if (payload.children !== undefined) reservation.children = payload.children
      if (payload.specialRequests !== undefined) reservation.specialRequests = payload.specialRequests
      if (payload.ownerNote !== undefined) reservation.ownerNote = payload.ownerNote

      await json(route, reservation)
      return
    }

    await json(route, { error: 'Method not allowed' }, 405)
  })

  return {
    reservations,
    users,
  }
}
