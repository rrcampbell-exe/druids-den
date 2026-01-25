import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { Landing, WhatToExpect, Spooktoberfest, Reservations, Dashboard } from './pages'
import { Navigate } from 'react-router'
import { ProtectedRoute } from './components'

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
      <ProtectedRoute page='reservations'>
        <Reservations />
      </ProtectedRoute>
    )
  },
  {
    path: '/what-to-expect',
    Component: WhatToExpect
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute page='dashboard'>
        <Dashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/*',
    element: <Navigate to='/' replace />
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
