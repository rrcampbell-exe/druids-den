import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { Landing, Spooktoberfest } from './pages'
import { Navigate } from 'react-router'

let router = createBrowserRouter([
  {
    path: '/',
    Component: Landing
  },
  {
    path: '/spooktoberfest',
    Component: Spooktoberfest
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
