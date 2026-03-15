import { UserButton, useUser } from '@clerk/react'
import './AuthHeader.scss'
import { getE2EAuthState } from '../utils/e2eAuth'

const AuthHeader = () => {
  const { user, isLoaded } = useUser()
  const e2eAuthState = getE2EAuthState()
  const e2eUser = e2eAuthState?.user

  if (e2eUser) {
    const displayName = [e2eUser.firstName, e2eUser.lastName].filter(Boolean).join(' ') || e2eUser.email

    return (
      <div className='auth-header'>
        <div className='auth-header-copy'>
          <span className='auth-header-label'>Signed in as</span>
          <span className='auth-header-name'>{displayName}</span>
        </div>
      </div>
    )
  }

  if (!isLoaded || !user) {
    return null
  }

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.primaryEmailAddress?.emailAddress

  return (
    <div className='auth-header'>
      <div className='auth-header-copy'>
        <span className='auth-header-label'>Signed in as</span>
        <span className='auth-header-name'>{displayName}</span>
      </div>
      <UserButton afterSignOutUrl='/' />
    </div>
  )
}

export default AuthHeader
