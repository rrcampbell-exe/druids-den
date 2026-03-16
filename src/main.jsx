import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { ClerkProvider } from '@clerk/react'
import { Landing, WhatToExpect, Spooktoberfest, Reservations, Dashboard, Feedback, AuthPage } from './pages'
import { Navigate } from 'react-router'
import { ClerkAuthGate, ProtectedRoute } from './components'

const isLocalDev = import.meta.env.DEV && typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)
const PUBLISHABLE_KEY = isLocalDev
  ? import.meta.env.VITE_LOCAL_CLERK_PUBLISHABLE_KEY || import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
  : import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

let router = createBrowserRouter([
  {
    path: '/',
    Component: Landing
  },
  {
    path: '/spooktoberfest',
    element: (
      <ProtectedRoute page='spooktoberfest'>
        <Spooktoberfest />
      </ProtectedRoute>
    )
  },
  {
    path: '/reservations',
    element: (
      <ClerkAuthGate requireApproval>
        <Reservations />
      </ClerkAuthGate>
    )
  },
  {
    path: '/what-to-expect',
    Component: WhatToExpect
  },
  {
    path: '/dashboard',
    element: (
      <ClerkAuthGate requiredRoles={['OWNER', 'ADMIN']}>
        <Dashboard />
      </ClerkAuthGate>
    )
  },
  {
    path: '/sign-in',
    element: <AuthPage mode='sign-in' />,
  },
  {
    path: '/sign-up',
    element: <AuthPage mode='sign-up' />,
  },
  {
    path: '/feedback/:reservationId',
    Component: Feedback
  },
  {
    path: '/*',
    element: <Navigate to='/' replace />
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl='/'>
      <RouterProvider router={router} />
    </ClerkProvider>
  </StrictMode>,
)
