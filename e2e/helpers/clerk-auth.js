import { E2E_AUTH_STORAGE_KEY } from '../../src/utils/e2eAuth.js'
import { testUsers } from './test-data.js'

async function enableE2EAuth(page, user) {
  await page.addInitScript(({ storageKey, state }) => {
    window.localStorage.setItem(storageKey, JSON.stringify(state))
  }, {
    storageKey: E2E_AUTH_STORAGE_KEY,
    state: {
      isSignedIn: true,
      user: user.appUser,
    },
  })
}

export async function signInAsApprovedGuest(page) {
  await enableE2EAuth(page, testUsers.approvedGuest)
}

export async function signInAsPendingGuest(page) {
  await enableE2EAuth(page, testUsers.pendingGuest)
}

export async function signInAsOwner(page) {
  await enableE2EAuth(page, testUsers.owner)
}
