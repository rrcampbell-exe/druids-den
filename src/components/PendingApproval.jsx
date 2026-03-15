import { useAuth } from '@clerk/react'
import { Link } from 'react-router'
import './PendingApproval.scss'
import { Flower, Leaf, Awen } from './'
import { clearE2EAuthState, getE2EAuthState } from '../utils/e2eAuth'

const statusContent = {
  PENDING_APPROVAL: {
    title: 'Account Pending Approval',
    message: 'Your account has been created, but an owner still needs to approve it before you can make a reservation.',
    detail: 'We will reach out once your account has been reviewed.',
  },
  DENIED: {
    title: 'Account Access Denied',
    message: 'Your account has not been approved for reservations at this time.',
    detail: 'If you think this is a mistake, please contact the property owners directly.',
  },
  REVOKED: {
    title: 'Reservation Access Revoked',
    message: 'Your reservation access has been revoked by an owner.',
    detail: 'Please contact the property owners if you need more information.',
  },
}

const PendingApproval = ({ accountStatus = 'PENDING_APPROVAL' }) => {
  const { signOut } = useAuth()
  const content = statusContent[accountStatus] || statusContent.PENDING_APPROVAL
  const isE2EAuth = Boolean(getE2EAuthState())

  const handleSignOut = () => {
    if (isE2EAuth) {
      clearE2EAuthState()
      window.location.assign('/')
      return
    }

    signOut()
  }

  return (
    <div className='pending-approval-page'>
      <div className='pending-approval-card'>
        <Flower />
        <h1>{content.title}</h1>
        <p>{content.message}</p>
        <p>{content.detail}</p>

        <div className='pending-approval-actions'>
          <button type='button' onClick={handleSignOut}>
            Sign Out
          </button>
          <Link to='/'>
            <div className='back-navigation'><Awen /> Return Home</div>
          </Link>
        </div>
        <Leaf />
      </div>
    </div>
  )
}

export default PendingApproval
