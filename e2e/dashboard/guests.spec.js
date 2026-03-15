import { test, expect } from '../helpers/fixtures.js'

test.describe('dashboard guest approvals', () => {
  test('reviews and approves pending guest accounts', async ({ adminPage }) => {
    const { page } = adminPage

    await page.goto('/dashboard')
    await page.getByRole('button', { name: /guests/i }).click()

    await expect(page.getByRole('heading', { name: /guest approvals/i })).toBeVisible()
    await expect(page.getByText('Perry Pending')).toBeVisible()

    await page.getByRole('button', { name: /^approve$/i }).click()
    await page.getByRole('button', { name: /approved/i }).click()

    await expect(page.getByText('Perry Pending')).toBeVisible()
    await expect(page.locator('.guest-card').filter({ hasText: 'Perry Pending' }).getByText(/approved/i)).toBeVisible()
  })
})
