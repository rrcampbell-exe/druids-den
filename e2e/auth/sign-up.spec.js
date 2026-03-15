import { test, expect } from '../helpers/fixtures.js'

test.describe('sign-up and pending approval states', () => {
  test('loads the sign-up route with redirect context', async ({ page }) => {
    await page.goto('/sign-up?redirect=%2Freservations')

    await expect(page).toHaveURL(/\/sign-up\?redirect=%2Freservations$/)
    await expect(page.locator('.auth-shell-inner')).toBeVisible()
    await expect(page.getByRole('link', { name: /back home/i })).toBeVisible()
  })

  test('shows the pending approval gate for signed-in guests awaiting review', async ({ pendingGuestPage }) => {
    await pendingGuestPage.goto('/reservations')

    await expect(pendingGuestPage.getByRole('heading', { name: /account pending approval/i })).toBeVisible()
    await expect(pendingGuestPage.getByText(/owner still needs to approve it/i)).toBeVisible()
  })
})
