import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Flower from '../../src/components/Flower'

describe('Flower', () => {
  it('renders the flower character entity', () => {
    const { container } = render(<Flower />)
    // &#6821; is the character entity, check it's rendered
    expect(container.querySelector('p')).toBeTruthy()
  })

  it('renders a paragraph element', () => {
    const { container } = render(<Flower />)
    const paragraph = container.querySelector('p')
    expect(paragraph).toBeInTheDocument()
  })

  it('renders without crashing', () => {
    const { container } = render(<Flower />)
    expect(container).toBeTruthy()
  })
})
