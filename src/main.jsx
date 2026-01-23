import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { Landing, WhatToExpect, Spooktoberfest } from './pages'
import { Navigate } from 'react-router'

let router = createBrowserRouter([
  {
    path: '/',
    Component: Landing
  },
  {
    path: '/spooktoberfest',
    Component: Spooktoberfest // seasonal redirect to main landing page
  },
  {
    path: '/what-to-expect',
    Component: WhatToExpect
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
