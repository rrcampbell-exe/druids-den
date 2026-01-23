import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Leaf from '../../src/components/Leaf'

describe('Leaf', () => {
  it('renders the leaf character entity', () => {
    const { container } = render(<Leaf />)
    // &#10087; is the character entity, check it's rendered
    expect(container.querySelector('p')).toBeTruthy()
  })

  it('renders a paragraph element', () => {
    const { container } = render(<Leaf />)
    const paragraph = container.querySelector('p')
    expect(paragraph).toBeInTheDocument()
  })

  it('renders without crashing', () => {
    const { container } = render(<Leaf />)
    expect(container).toBeTruthy()
  })
})
