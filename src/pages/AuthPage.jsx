import { useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router'
import { SignIn, SignUp } from '@clerk/react'
import './AuthPage.scss'
import { Awen } from '../components'
import { trackEvent } from '../utils/analytics'

const clerkAppearance = {
  variables: {
    colorPrimary: '#464645',
    colorText: '#464645',
    colorBackground: '#ffffff',
    colorInputBackground: '#ffffff',
    colorInputText: '#464645',
    fontFamily: 'Coelbren, sans-serif',
    borderRadius: '12px',
  },
  elements: {
    rootBox: 'auth-clerk-root',
    card: 'auth-clerk-card',
    headerTitle: 'auth-clerk-title',
    headerSubtitle: 'auth-clerk-subtitle',
    socialButtonsBlockButton: 'auth-clerk-social-button',
    formButtonPrimary: 'auth-clerk-primary-button',
    formFieldInput: 'auth-clerk-input',
    formFieldLabel: 'auth-clerk-label',
    footerActionLink: 'auth-clerk-link',
    dividerLine: 'auth-clerk-divider-line',
    dividerText: 'auth-clerk-divider-text',
    otpCodeFieldInput: 'auth-clerk-input',
  },
}

const AuthPage = ({ mode = 'sign-in' }) => {
  const location = useLocation()

  const redirectPath = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get('redirect') || '/reservations'
  }, [location.search])

  useEffect(() => {
    trackEvent('auth_page_viewed', {
      mode,
      redirect_path: redirectPath,
    })
  }, [mode, redirectPath])

  return (
    <div className='auth-page'>
      <div className='auth-shell'>
        <Link to='/' className='auth-back-link'><Awen /> Back Home</Link>
        <div className='auth-shell-inner'>
          {mode === 'sign-up' ? (
            <SignUp
              path='/sign-up'
              fallbackRedirectUrl={redirectPath}
              signInUrl={`/sign-in?redirect=${encodeURIComponent(redirectPath)}`}
              appearance={clerkAppearance}
            />
          ) : (
            <SignIn
              path='/sign-in'
              fallbackRedirectUrl={redirectPath}
              signUpUrl={`/sign-up?redirect=${encodeURIComponent(redirectPath)}`}
              appearance={clerkAppearance}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthPage
