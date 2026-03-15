import { test, expect } from '@playwright/test'

const createAuthToken = () => Buffer.from(JSON.stringify({ authenticated: true })).toString('base64')

test.describe('spooktoberfest passcode protection', () => {
  test('requires a passcode and persists access after successful entry', async ({ page }) => {
    await page.route('**/api/verify-passcode', async (route) => {
      const { passcode } = route.request().postDataJSON()

      if (passcode === (process.env.SPOOKTOBERFEST_PASSCODE || 'hectorthespecter')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, token: createAuthToken() }),
        })
        return
      }

      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: false }),
      })
    })

    await page.goto('/spooktoberfest')

    await expect(page.getByRole('heading', { name: /spooktoberfest/i })).toBeVisible()
    await expect(page.getByText(/please enter the code from the back of your invitation/i)).toBeVisible()

    await page.getByPlaceholder(/enter passcode/i).fill('definitely-wrong')
    await page.getByRole('button', { name: /^enter$/i }).click()
    await expect(page.getByText(/invalid passcode/i)).toBeVisible()

    await page.getByPlaceholder(/enter passcode/i).fill(process.env.SPOOKTOBERFEST_PASSCODE || 'hectorthespecter')
    await page.getByRole('button', { name: /^enter$/i }).click()

    await expect(page.getByRole('heading', { name: /what to expect/i })).toBeVisible()

    await page.reload()
    await expect(page.getByRole('heading', { name: /what to expect/i })).toBeVisible()

    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await expect(page.getByText(/please enter the code from the back of your invitation/i)).toBeVisible()
  })
})
