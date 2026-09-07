import { describe, expect, it, vi } from 'vitest'
import { act, render, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import ScrollToTop from '../../src/components/ScrollToTop'

describe('ScrollToTop', () => {
  it('scrolls to the top when the route pathname changes', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const router = createMemoryRouter([
      {
        path: '/',
        Component: ScrollToTop,
        children: [
          { index: true, element: <div>Home</div> },
          { path: 'destination', element: <div>Destination</div> },
        ],
      },
    ])

    render(<RouterProvider router={router} />)
    await act(async () => {
      await router.navigate('/destination')
    })

    await waitFor(() => {
      expect(scrollTo).toHaveBeenCalledTimes(2)
    })
    expect(scrollTo).toHaveBeenLastCalledWith(0, 0)
  })
})