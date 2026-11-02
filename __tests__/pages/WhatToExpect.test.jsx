import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import WhatToExpect from '../../src/pages/WhatToExpect'

const CurrentPath = () => {
  const location = useLocation()
  return <p>Current path: {location.pathname}</p>
}

describe('WhatToExpect Page', () => {
  it('redirects the legacy route to the current cabin page', () => {
    render(
      <MemoryRouter initialEntries={['/what-to-expect']}>
        <Routes>
          <Route path='/what-to-expect' element={<WhatToExpect />} />
          <Route path='/the-den' element={<CurrentPath />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Current path: /the-den')).toBeInTheDocument()
  })
})
