import { useMemo } from 'react'
import { Link, useLocation } from 'react-router'
import { SignIn, SignUp } from '@clerk/react'
import './AuthPage.scss'
import { Awen } from '../components'

const AuthPage = ({ mode = 'sign-in' }) => {
  const location = useLocation()

  const redirectPath = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get('redirect') || '/reservations'
  }, [location.search])

  return (
    <div className='auth-page'>
      <div className='auth-shell'>
        <Link to='/' className='auth-back-link'><Awen /> Back Home</Link>
        <div className='auth-shell-inner'>
          {mode === 'sign-up' ? (
            <SignUp
              fallbackRedirectUrl={redirectPath}
              signInUrl={`/sign-in?redirect=${encodeURIComponent(redirectPath)}`}
            />
          ) : (
            <SignIn
              fallbackRedirectUrl={redirectPath}
              signUpUrl={`/sign-up?redirect=${encodeURIComponent(redirectPath)}`}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthPage
