import { test, expect } from '@playwright/test'
import { mockWeather } from '../helpers/mock-api.js'

test.describe('public landing page', () => {
  test('shows core calls to action and weather', async ({ page }) => {
    await mockWeather(page)

    await page.goto('/')

    await expect(page.getByRole('link', { name: /begin your northwoods adventure/i })).toHaveAttribute('href', '/what-to-expect')
    await expect(page.getByLabel(/current weather for conover, wisconsin/i)).toContainText('CONOVER, WI')
    await expect(page.getByLabel(/current weather for conover, wisconsin/i)).toContainText('PARTLY CLOUDY')
  })

  test('navigates from the landing page to what to expect', async ({ page }) => {
    await mockWeather(page)

    await page.goto('/')
    await page.getByRole('link', { name: /begin your northwoods adventure/i }).click()

    await expect(page).toHaveURL(/\/what-to-expect$/)
    await expect(page.getByRole('heading', { level: 1, name: /what to expect/i })).toBeVisible()
  })
})
