import { test, expect } from '../helpers/fixtures.js'

test.describe('dashboard reports', () => {
  test('renders analytics widgets and charts', async ({ adminPage }) => {
    const { page } = adminPage

    await page.goto('/dashboard')
    await page.getByRole('button', { name: /reports/i }).click()

    await expect(page.getByRole('heading', { name: /analytics & reports/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /key metrics/i })).toBeVisible()
    await expect(page.getByText(/total revenue/i)).toBeVisible()
    await expect(page.getByText(/occupancy rate/i)).toBeVisible()
  })
})
