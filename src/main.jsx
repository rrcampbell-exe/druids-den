import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Landing, TheDen, Gallery, Northwoods, Story, Traditions, Stay, Guide, Spooktoberfest } from './pages'
import { Navigate } from 'react-router'
import { ProtectedRoute } from './components'
import ScrollToTop from './components/ScrollToTop'

const router = createBrowserRouter([
  {
    path: '/',
    Component: ScrollToTop,
    children: [
      {
        index: true,
        Component: Landing
      },
      {
        path: 'spooktoberfest',
        element: (
          <ProtectedRoute page='spooktoberfest'>
            <Spooktoberfest />
          </ProtectedRoute>
        )
      },
      {
        path: 'the-den',
        Component: TheDen
      },
      {
        path: 'what-to-expect',
        Component: TheDen
      },
      {
        path: 'gallery',
        Component: Gallery
      },
      {
        path: 'northwoods',
        Component: Northwoods
      },
      {
        path: 'story',
        Component: Story
      },
      // Keep traditions deployed but unlinked as dark prod until more traditions are ready.
      {
        path: 'traditions',
        Component: Traditions
      },
      {
        path: 'stay',
        Component: Stay
      },
      {
        path: 'guide',
        Component: Guide
      },
      {
        path: '*',
        element: <Navigate to='/' replace />
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Analytics />
    <SpeedInsights />
  </StrictMode>,
)
