import { test, expect } from '../helpers/fixtures.js'

const formatDateParts = (date) => ({
  month: date.toLocaleString('en-US', { month: 'long' }),
  year: date.getFullYear(),
  day: date.getDate(),
})

const pickDashboardDate = async (page, targetDate) => {
  const { month, year, day } = formatDateParts(targetDate)

  while (true) {
    const visibleMonth = await page.locator('.calendar-container .month-year').textContent()
    if (visibleMonth?.trim() === `${month} ${year}`) {
      break
    }

    await page.getByRole('button', { name: /next/i }).first().click()
  }

  await page.locator('.calendar-grid .calendar-day').filter({
    has: page.locator('.day-number', { hasText: new RegExp(`^${day}$`) }),
  }).first().click()
}

test.describe('dashboard at a glance', () => {
  test('approves a pending reservation', async ({ adminPage }) => {
    const { page } = adminPage

    await page.goto('/dashboard')

    await expect(page.getByRole('heading', { name: /owner dashboard/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /reservation calendar/i })).toBeVisible()
    await expect(page.getByText('Hazel Trail')).toBeVisible()

    await page.getByRole('button', { name: /approve reservation/i }).click()

    await expect(page.getByText(/reservation approved and guest notified via email/i)).toBeVisible()
    await expect(page.getByText(/no pending reservation requests/i)).toBeVisible()
  })

  test('creates an owner date block from the calendar', async ({ adminPage }) => {
    const { page } = adminPage

    await page.goto('/dashboard')
    await page.getByRole('button', { name: /block dates/i }).click()

    await expect(page.getByText(/click a date to select check-in/i)).toBeVisible()

    const checkIn = new Date()
    checkIn.setHours(12, 0, 0, 0)
    checkIn.setDate(checkIn.getDate() + 50)

    const checkOut = new Date(checkIn)
    checkOut.setDate(checkOut.getDate() + 3)

    await pickDashboardDate(page, checkIn)
    await pickDashboardDate(page, checkOut)

    await expect(page.getByRole('heading', { name: /block dates for owners/i })).toBeVisible()
    await page.getByLabel(/owner's note/i).fill('Playwright owner hold for a family weekend.')
    await page.getByRole('button', { name: /reserve for owners/i }).click()

    await expect(page.getByText(/owner reservation created successfully/i)).toBeVisible()
  })
})
