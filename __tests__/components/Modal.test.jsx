import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Modal from '../../src/components/Modal'

describe('Modal', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
  })

  afterEach(() => {
    // Restore body overflow
    document.body.style.overflow = 'unset'
  })

  describe('Rendering', () => {
    it('renders nothing when closed', () => {
      const { container } = render(
        <Modal isOpen={false} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      )
      
      expect(container.firstChild).toBeNull()
    })

    it('renders when open', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      )
      
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('renders children content', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Test message</p>
          <span>Additional info</span>
        </Modal>
      )
      
      expect(screen.getByText('Test message')).toBeInTheDocument()
      expect(screen.getByText('Additional info')).toBeInTheDocument()
    })

    it('renders title when provided', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Success">
          <p>Content</p>
        </Modal>
      )
      
      expect(screen.getByText('Success')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Success' })).toBeInTheDocument()
    })

    it('does not render title element when not provided', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      )
      
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })

    it('renders close button', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      )
      
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('calls onClose when close button clicked', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      )
      
      const closeButton = screen.getByRole('button', { name: 'Close' })
      fireEvent.click(closeButton)
      
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when overlay clicked', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      )
      
      const overlay = screen.getByText('Content').closest('.modal-overlay')
      fireEvent.click(overlay)
      
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('does not close when modal content clicked', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      )
      
      const content = screen.getByText('Content')
      fireEvent.click(content)
      
      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('calls onClose when Escape key pressed', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      )
      
      fireEvent.keyDown(document, { key: 'Escape' })
      
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onClose when other keys pressed', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      )
      
      fireEvent.keyDown(document, { key: 'Enter' })
      fireEvent.keyDown(document, { key: 'Space' })
      fireEvent.keyDown(document, { key: 'a' })
      
      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('does not respond to Escape when closed', () => {
      const { rerender } = render(
        <Modal isOpen={false} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      )
      
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(mockOnClose).not.toHaveBeenCalled()
      
      // Open modal
      rerender(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      )
      
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Body Scroll Prevention', () => {
    it('prevents body scroll when open', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      )
      
      expect(document.body.style.overflow).toBe('hidden')
    })

    it('restores body scroll when closed', () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      )
      
      expect(document.body.style.overflow).toBe('hidden')
      
      rerender(
        <Modal isOpen={false} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      )
      
      expect(document.body.style.overflow).toBe('unset')
    })

    it('restores body scroll on unmount', () => {
      const { unmount } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      )
      
      expect(document.body.style.overflow).toBe('hidden')
      
      unmount()
      
      expect(document.body.style.overflow).toBe('unset')
    })
  })

  describe('Accessibility', () => {
    it('has proper modal structure', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <p>Content</p>
        </Modal>
      )
      
      expect(screen.getByRole('heading')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('modal content stops click propagation', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      )
      
      const modalContent = container.querySelector('.modal-content')
      fireEvent.click(modalContent)
      
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  describe('Multiple Modals', () => {
    it('only responds to Escape for open modal', () => {
      const onClose1 = vi.fn()
      const onClose2 = vi.fn()
      
      const { rerender } = render(
        <>
          <Modal isOpen={false} onClose={onClose1}>
            <p>Modal 1</p>
          </Modal>
          <Modal isOpen={true} onClose={onClose2}>
            <p>Modal 2</p>
          </Modal>
        </>
      )
      
      fireEvent.keyDown(document, { key: 'Escape' })
      
      expect(onClose1).not.toHaveBeenCalled()
      expect(onClose2).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edge Cases', () => {
    it('handles rapid open/close toggling', () => {
      const { rerender } = render(
        <Modal isOpen={false} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      )
      
      rerender(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      )
      
      rerender(
        <Modal isOpen={false} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      )
      
      rerender(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      )
      
      expect(document.body.style.overflow).toBe('hidden')
    })

    it('handles complex children content', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Complex Modal">
          <div>
            <h3>Subsection</h3>
            <p>Paragraph 1</p>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
            <button>Action</button>
          </div>
        </Modal>
      )
      
      expect(screen.getByText('Subsection')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
    })
  })
})
