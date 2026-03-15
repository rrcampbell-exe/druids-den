import { Link, useLocation } from 'react-router'
import { useAuth } from '@clerk/react'
import PendingApproval from './PendingApproval'
import { useCurrentAppUser } from '../hooks/useCurrentAppUser'
import './ClerkAuthGate.scss'
import { Flower, Leaf } from './'

const ClerkAuthGate = ({ children, requireApproval = false, requiredRoles = [] }) => {
  const location = useLocation()
  const { isLoaded, isSignedIn } = useAuth()
  const { user, loading, error } = useCurrentAppUser()
  const redirect = encodeURIComponent(`${location.pathname}${location.search}`)

  if (!isLoaded) {
    return null
  }

  if (!isSignedIn) {
    return (
      <div className='clerk-auth-gate'>
        <div className='clerk-auth-card'>
          <Flower />
          <h1>Sign in to continue</h1>
          <p>You need an approved guest account to access this part of The Druids Den.</p>
          <div className='clerk-auth-actions'>
            <Link className='auth-link-button' to={`/sign-in?redirect=${redirect}`}>
              Sign In
            </Link>
            <Link className='auth-link-button secondary' to={`/sign-up?redirect=${redirect}`}>
              Create Account
            </Link>
          </div>
          <Leaf />
        </div>
      </div>
    )
  }

  if (loading) {
    return null
  }

  if (error) {
    return (
      <div className='clerk-auth-gate'>
        <div className='clerk-auth-card'>
          <h1>We couldn't load your account</h1>
          <p>{error}</p>
          <Link className='auth-link-button' to='/'>Return Home</Link>
        </div>
      </div>
    )
  }

  if (requireApproval && user?.accountStatus !== 'APPROVED') {
    return <PendingApproval accountStatus={user?.accountStatus} />
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
    return (
      <div className='clerk-auth-gate'>
        <div className='clerk-auth-card'>
          <h1>Access restricted</h1>
          <p>Your account does not have permission to view this page.</p>
          <Link className='auth-link-button' to='/'>Return Home</Link>
        </div>
      </div>
    )
  }

  return children
}

export default ClerkAuthGate
