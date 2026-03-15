import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@clerk/react'
import { buildAuthHeaders } from '../utils/authHeaders'

export const useCurrentAppUser = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!isLoaded) {
      return null
    }

    if (!isSignedIn) {
      setUser(null)
      setLoading(false)
      setError('')
      return null
    }

    setLoading(true)
    setError('')

    try {
      const headers = await buildAuthHeaders(getToken)
      const response = await fetch('/api/user/status', {
        headers,
      })

      const contentType = response.headers?.get?.('content-type') || ''
      if (contentType && !contentType.includes('application/json')) {
        throw new Error('Account service is unavailable in this dev mode. Run `npm start` (Vercel dev) instead of `npm run dev`.')
      }

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        if (parseError instanceof SyntaxError) {
          throw new Error('Account service returned an unexpected response. Run `npm start` (Vercel dev) so /api routes are available.')
        }
        throw parseError
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load your account')
      }

      setUser(data.user)
      return data.user
    } catch (loadError) {
      console.error('Error loading current app user:', loadError)
      setError(loadError.message || 'Failed to load your account')
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [getToken, isLoaded, isSignedIn])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    user,
    loading,
    error,
    refresh,
  }
}
