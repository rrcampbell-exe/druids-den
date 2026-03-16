import { useCallback, useEffect, useMemo, useState } from 'react'
import './Guests.scss'
import { buildAuthHeaders } from '../../utils/authHeaders'

const STATUS_LABELS = {
  PENDING_APPROVAL: 'Pending',
  APPROVED: 'Approved',
  DENIED: 'Denied',
  REVOKED: 'Revoked',
}

const defaultGetToken = async () => null

const Guests = ({ getToken = defaultGetToken }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeStatus, setActiveStatus] = useState('PENDING_APPROVAL')
  const [updatingUserId, setUpdatingUserId] = useState('')

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const headers = await buildAuthHeaders(getToken)
      const response = await fetch('/api/users', { headers })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load guest accounts')
      }

      setUsers(data.users || [])
    } catch (loadError) {
      console.error('Error loading guest accounts:', loadError)
      setError(loadError.message || 'Failed to load guest accounts')
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const counts = useMemo(() => users.reduce((totals, user) => {
    totals[user.accountStatus] = (totals[user.accountStatus] || 0) + 1
    return totals
  }, {
    PENDING_APPROVAL: 0,
    APPROVED: 0,
    DENIED: 0,
    REVOKED: 0,
  }), [users])

  const filteredUsers = useMemo(
    () => users.filter((user) => user.accountStatus === activeStatus),
    [activeStatus, users],
  )

  const updateUserStatus = async (userId, accountStatus) => {
    setUpdatingUserId(userId)

    try {
      const headers = await buildAuthHeaders(getToken, {
        'Content-Type': 'application/json',
      })

      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ userId, accountStatus }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update guest account')
      }

      setUsers((currentUsers) => currentUsers.map((user) => (
        user.id === userId ? data.user : user
      )))
    } catch (updateError) {
      console.error('Error updating guest status:', updateError)
      setError(updateError.message || 'Failed to update guest account')
    } finally {
      setUpdatingUserId('')
    }
  }

  if (loading) {
    return <div className='guests-panel'><p>Loading guest accounts...</p></div>
  }

  return (
    <div className='guests-panel'>
      <div className='guests-header'>
        <div>
          <h2>Guest Approvals</h2>
          <p>Approve known guests before they can submit reservation requests.</p>
        </div>
        <button type='button' className='refresh-button' onClick={loadUsers}>Refresh</button>
      </div>

      {error && <p className='guests-error'>{error}</p>}

      <div className='guest-status-tabs'>
        {Object.entries(STATUS_LABELS).map(([status, label]) => (
          <button
            key={status}
            type='button'
            className={`status-tab ${activeStatus === status ? 'active' : ''}`}
            onClick={() => setActiveStatus(status)}
          >
            {label} ({counts[status] || 0})
          </button>
        ))}
      </div>

      {filteredUsers.length === 0 ? (
        <div className='guests-empty-state'>No guests in this status yet.</div>
      ) : (
        <div className='guest-card-grid'>
          {filteredUsers.map((user) => {
            const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Unnamed guest'
            const isUpdating = updatingUserId === user.id

            return (
              <article key={user.id} className='guest-card'>
                <div className='guest-card-top'>
                  <div>
                    <h3>{fullName}</h3>
                    <p>{user.email}</p>
                  </div>
                  <span className={`status-pill ${user.accountStatus.toLowerCase()}`}>
                    {STATUS_LABELS[user.accountStatus]}
                  </span>
                </div>

                <dl className='guest-meta'>
                  <div>
                    <dt>Signed up</dt>
                    <dd>{user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}</dd>
                  </div>
                  <div>
                    <dt>Last reviewed</dt>
                    <dd>{user.accountStatusChangedAt ? new Date(user.accountStatusChangedAt).toLocaleString() : 'Not reviewed yet'}</dd>
                  </div>
                </dl>

                <div className='guest-card-actions'>
                  {user.accountStatus !== 'APPROVED' && (
                    <button type='button' disabled={isUpdating} onClick={() => updateUserStatus(user.id, 'APPROVED')}>
                      {user.accountStatus === 'PENDING_APPROVAL' ? 'Approve' : 'Re-approve'}
                    </button>
                  )}
                  {user.accountStatus !== 'DENIED' && (
                    <button type='button' disabled={isUpdating} className='secondary danger' onClick={() => updateUserStatus(user.id, 'DENIED')}>
                      Deny
                    </button>
                  )}
                  {user.accountStatus === 'APPROVED' && (
                    <button type='button' disabled={isUpdating} className='secondary danger' onClick={() => updateUserStatus(user.id, 'REVOKED')}>
                      Revoke
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Guests
