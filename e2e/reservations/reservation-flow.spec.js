import { test, expect } from '../helpers/fixtures.js'
import { mockReservationSubmission } from '../helpers/mock-api.js'

const formatDateParts = (date) => ({
  month: date.toLocaleString('en-US', { month: 'long' }),
  year: date.getFullYear(),
  day: date.getDate(),
})

const pickDate = async (page, targetDate) => {
  const { month, year, day } = formatDateParts(targetDate)

  while (true) {
    const visibleMonth = await page.locator('.calendar-dropdown .month-year').textContent()
    if (visibleMonth?.trim() === `${month} ${year}`) {
      break
    }

    await page.getByRole('button', { name: /next month/i }).click()
  }

  await page.locator('.calendar-dropdown .calendar-day').filter({ hasText: new RegExp(`^${day}$`) }).click()
}

test.describe('reservation flow', () => {
  test('lets an approved guest submit a reservation request', async ({ authenticatedPage }) => {
    let submittedPayload

    await mockReservationSubmission(authenticatedPage, async (payload) => {
      submittedPayload = payload
    })

    await authenticatedPage.goto('/reservations')

    await authenticatedPage.getByLabel(/first name/i).fill('Poppy')
    await authenticatedPage.getByLabel(/last name/i).fill('Guest')
    await expect(authenticatedPage.getByLabel(/email address/i)).toHaveValue('playwright.approved@example.com')
    await authenticatedPage.getByLabel(/phone number/i).fill('7155550198')

    await authenticatedPage.getByRole('button', { name: /open calendar/i }).click()

    const checkIn = new Date()
    checkIn.setHours(12, 0, 0, 0)
    checkIn.setDate(checkIn.getDate() + 7)

    const checkOut = new Date(checkIn)
    checkOut.setDate(checkOut.getDate() + 3)

    await pickDate(authenticatedPage, checkIn)
    await pickDate(authenticatedPage, checkOut)

    await authenticatedPage.getByLabel(/adults/i).fill('2')
    await authenticatedPage.getByLabel(/children/i).fill('1')
    await authenticatedPage.getByLabel(/anything else we should know/i).fill('We will arrive later in the evening.')
    await authenticatedPage.getByRole('button', { name: /submit reservation request and make deposit/i }).click()

    await expect(authenticatedPage.getByRole('heading', { name: /reservation request received/i })).toBeVisible()
    await expect(authenticatedPage.getByText(/thank you for your reservation request/i)).toBeVisible()

    expect(submittedPayload).toMatchObject({
      firstName: 'Poppy',
      lastName: 'Guest',
      email: 'playwright.approved@example.com',
      children: 1,
      specialRequests: 'We will arrive later in the evening.',
    })
    expect(submittedPayload.checkIn).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(submittedPayload.checkOut).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
