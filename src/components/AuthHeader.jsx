import { UserButton, useUser } from '@clerk/react'
import './AuthHeader.scss'

const AuthHeader = () => {
  const { user, isLoaded } = useUser()

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
