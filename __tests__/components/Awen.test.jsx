import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Awen from '../../src/components/Awen'

describe('Awen', () => {
  it('renders the Awen Unicode character', () => {
    const { container } = render(<Awen />)
    expect(container.textContent).toBe('\uE000')
  })

  it('renders without crashing', () => {
    const { container } = render(<Awen />)
    expect(container).toBeTruthy()
  })
})
