export const E2E_AUTH_STORAGE_KEY = '__druids_den_e2e_auth__'

const isBrowser = typeof window !== 'undefined'

const canUseE2EAuth = () => isBrowser && import.meta.env.DEV

const parseStoredState = (rawValue) => {
  if (!rawValue) {
    return null
  }

  try {
    const parsed = JSON.parse(rawValue)
    if (!parsed?.isSignedIn || !parsed?.user) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export const getE2EAuthState = () => {
  if (!canUseE2EAuth()) {
    return null
  }

  return parseStoredState(window.localStorage.getItem(E2E_AUTH_STORAGE_KEY))
}

export const clearE2EAuthState = () => {
  if (!canUseE2EAuth()) {
    return
  }

  window.localStorage.removeItem(E2E_AUTH_STORAGE_KEY)
}

export const getE2EClerkLikeUser = () => {
  const authState = getE2EAuthState()

  if (!authState?.user) {
    return null
  }

  return {
    firstName: authState.user.firstName || '',
    lastName: authState.user.lastName || '',
    primaryEmailAddress: {
      emailAddress: authState.user.email || '',
    },
    primaryPhoneNumber: authState.user.phone
      ? { phoneNumber: authState.user.phone }
      : null,
  }
}
