import { useEffect, useRef } from 'react'
import './Landing.scss'
import { Coelbren, Awen, Weather } from '../components'
import { Link } from 'react-router'
import { useAuth } from '@clerk/react'
import { useCurrentAppUser } from '../hooks/useCurrentAppUser'

const Landing = () => {
  const ref = useRef()
  const { isSignedIn } = useAuth()
  const { user } = useCurrentAppUser()

  // Check if current date is April 2026 or later
  const now = new Date()
  const showSpooktoberfest = now >= new Date('2026-04-01')
  const showOwnerDashboard = isSignedIn && (user?.role === 'OWNER' || user?.role === 'ADMIN')

  useEffect(() => {
    const img = new window.Image()
    img.src = '/assets/images/druids_den_summer_daisies_evening.jpg'
    img.onload = () => {
      if (ref.current) {
        ref.current.classList.add('image-loaded')
      }
    }
  }, [])

  return (
    <div className='landing-page' ref={ref}>
      <h1 className='landing-title'>
        <Coelbren className='the'>The</Coelbren>
        <Coelbren className='druids-den'>Druids Den</Coelbren>
        <p className='three-rays'><Awen /></p>
      </h1>
      <Link to='/what-to-expect' className='landing-cta'>
        Begin Your Northwoods Adventure &gt;
      </Link>
      {showSpooktoberfest && (
        <Link to='/spooktoberfest' className='landing-cta'>
          Spooktoberfest 2026 &gt;
        </Link>
      )}
      {showOwnerDashboard && (
        <Link to='/dashboard' className='landing-cta'>
          Owner Dashboard &gt;
        </Link>
      )}
      <Weather />
    </div>
  )
}

export default Landing
