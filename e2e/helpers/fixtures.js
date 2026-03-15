import { test as base, expect } from '@playwright/test'
import { signInAsApprovedGuest, signInAsOwner, signInAsPendingGuest } from './clerk-auth.js'
import { mockApprovedGuestApis, mockDashboardApis, mockPendingGuestApis } from './mock-api.js'

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await mockApprovedGuestApis(page)
    await signInAsApprovedGuest(page)
    await use(page)
  },

  pendingGuestPage: async ({ page }, use) => {
    await mockPendingGuestApis(page)
    await signInAsPendingGuest(page)
    await use(page)
  },

  adminPage: async ({ page }, use) => {
    const apiState = await mockDashboardApis(page)
    await signInAsOwner(page)
    await use({ page, apiState })
  },
})

export { expect }
