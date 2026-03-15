import { test, expect } from '@playwright/test'

test.describe('sign-in access control', () => {
  test('prompts unauthenticated visitors when opening reservations', async ({ page }) => {
    await page.goto('/reservations')

    await expect(page.getByRole('heading', { name: /sign in to continue/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /^sign in$/i })).toHaveAttribute('href', /\/sign-in\?redirect=%2Freservations$/)
    await expect(page.getByRole('link', { name: /create account/i })).toHaveAttribute('href', /\/sign-up\?redirect=%2Freservations$/)
  })

  test('loads the dedicated sign-in route with redirect context', async ({ page }) => {
    await page.goto('/sign-in?redirect=%2Freservations')

    await expect(page).toHaveURL(/\/sign-in\?redirect=%2Freservations$/)
    await expect(page.getByText(/sign in/i).first()).toBeVisible()
  })

  test('prompts unauthenticated visitors when opening the dashboard', async ({ page }) => {
    await page.goto('/dashboard')

    await expect(page.getByRole('heading', { name: /sign in to continue/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /^sign in$/i })).toHaveAttribute('href', /\/sign-in\?redirect=%2Fdashboard$/)
  })
})
