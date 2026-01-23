import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Coelbren from '../../src/components/Coelbren'

describe('Coelbren', () => {
  it('renders coelbrenified text in a paragraph by default', () => {
    render(<Coelbren>hello</Coelbren>)
    const paragraph = screen.getByText(/./i).closest('p')
    expect(paragraph).toBeInTheDocument()
  })

  it('converts text to Unicode characters', () => {
    const { container } = render(<Coelbren>hello</Coelbren>)
    // Should contain the Unicode representation
    expect(container.textContent).toBe('\uE027\uE033\uE022\uE022\uE009')
  })

  it('renders as a custom tag when renderAs is provided', () => {
    render(<Coelbren renderAs="h1">hello</Coelbren>)
    const heading = screen.getByText(/./i).closest('h1')
    expect(heading).toBeInTheDocument()
  })

  it('renders as a div when specified', () => {
    render(<Coelbren renderAs="div">test</Coelbren>)
    const div = screen.getByText(/./i).closest('div')
    expect(div).toBeInTheDocument()
  })

  it('passes additional props to the rendered element', () => {
    render(<Coelbren className="custom-class" data-testid="coelbren">hello</Coelbren>)
    const element = screen.getByTestId('coelbren')
    expect(element).toHaveClass('custom-class')
  })

  it('handles empty strings', () => {
    const { container } = render(<Coelbren>{''}</Coelbren>)
    expect(container.textContent).toBe('')
  })

  it('preserves non-alphabetic characters', () => {
    const { container } = render(<Coelbren>hello world!</Coelbren>)
    expect(container.textContent).toContain(' ')
    expect(container.textContent).toContain('!')
  })
})
