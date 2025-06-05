import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router'
import Landing from './pages/Landing.jsx'
import Spooktoberfest from './pages/Spooktoberfest.jsx'

let router = createBrowserRouter([
  {
    path: '/',
    Component: Landing
  },
  {
    path: '/spooktoberfest',
    Component: Spooktoberfest
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
