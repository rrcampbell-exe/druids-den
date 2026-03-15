import { useState } from 'react'
import { useAuth } from '@clerk/react'
import './Dashboard.scss'
import { Coelbren, Awen, AuthHeader } from '../components'
import { Link } from 'react-router'
import AtAGlance from './dashboard/AtAGlance'
import Reports from './dashboard/Reports'
import Guests from './dashboard/Guests'
import { useCurrentAppUser } from '../hooks/useCurrentAppUser'

const Dashboard = () => {
  const { getToken } = useAuth()
  const { user: currentUser } = useCurrentAppUser()
  const [activeTab, setActiveTab] = useState('at-a-glance')

  const tabs = [
    { id: 'at-a-glance', label: 'At A Glance', icon: '📅' },
    { id: 'guests', label: 'Guests', icon: '👥' },
    { id: 'reports', label: 'Reports', icon: '📊' },
    { id: 'insights', label: 'Insights', icon: '💡', disabled: true }
  ]

  return (
    <div className='dashboard-page'>
      <div className='page-header'>
        <div>
          <h1>
            Owner Dashboard
          </h1>
          <p className='coelbren-subheading'>
            <Coelbren>Tending to The Druids Den</Coelbren>
          </p>
          <div className='bottom-border' />
        </div>
        <div>
          <AuthHeader />
          <div className='back-navigation'>
            <Link to='/' className='back-link'><Awen /> Back Home</Link>
          </div>
        </div>
      </div>

      <div className='dashboard-tabs'>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''} ${tab.disabled ? 'disabled' : ''}`}
            onClick={() => !tab.disabled && setActiveTab(tab.id)}
            disabled={tab.disabled}
          >
            <span className='tab-icon'>{tab.icon}</span>
            <span className='tab-label'>{tab.label}</span>
            {tab.disabled && <span className='coming-soon'>Coming Soon</span>}
          </button>
        ))}
      </div>

      <div className='dashboard-content'>
        {activeTab === 'at-a-glance' && <AtAGlance currentUser={currentUser} getToken={getToken} />}
        {activeTab === 'guests' && <Guests getToken={getToken} />}
        {activeTab === 'reports' && <Reports getToken={getToken} />}
        {activeTab === 'insights' && (
          <div className='placeholder-tab'>
            <h2>Insights</h2>
            <p>Business insights and trends will be available here.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
