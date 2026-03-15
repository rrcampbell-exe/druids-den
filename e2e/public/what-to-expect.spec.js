import { test, expect } from '@playwright/test'

test.describe('what to expect page', () => {
  test('renders the cabin guide and section navigation', async ({ page }) => {
    await page.goto('/what-to-expect')

    await expect(page.getByRole('heading', { level: 1, name: /what to expect/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /the cabin/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /year-round essentials/i })).toBeVisible()

    await page.getByRole('link', { name: /^summer$/i }).click()

    await expect(page).toHaveURL(/#summer$/)
    await expect(page.getByRole('heading', { name: /^summer$/i })).toBeVisible()
  })
})
