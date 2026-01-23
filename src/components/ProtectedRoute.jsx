import { useState, useEffect } from 'react'
import PasscodePrompt from './PasscodePrompt'

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check if user has a valid authentication token
    const token = localStorage.getItem('spooktoberfest_auth')
    
    if (token) {
      try {
        // Decode and validate the token
        const decoded = JSON.parse(atob(token))
        
        // Token is valid if it exists and has the authenticated flag
        // You could add expiration logic here if desired
        if (decoded.authenticated) {
          setIsAuthenticated(true)
        }
      } catch (err) {
        // Invalid token, clear it
        localStorage.removeItem('spooktoberfest_auth')
      }
    }
    
    setIsChecking(false)
  }, [])

  const handleAuthSuccess = () => {
    setIsAuthenticated(true)
  }

  // Show nothing while checking authentication
  if (isChecking) {
    return null
  }

  // Show passcode prompt if not authenticated
  if (!isAuthenticated) {
    return <PasscodePrompt onSuccess={handleAuthSuccess} />
  }

  // Show protected content if authenticated
  return children
}

export default ProtectedRoute
