import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'
import Feedback from '../../src/pages/Feedback'

// Mock Awen component
vi.mock('../../src/components/Awen', () => ({
  default: () => <span data-testid="awen">Awen</span>
}))

// Mock fetch
global.fetch = vi.fn()

const mockCompletedReservation = {
  id: 'res-a3d9e4f5-0b8c-9a7d-3f1e-2b4a9c8d0f5a',
  status: 'completed',
  firstName: 'Robert',
  lastName: 'Williams',
  checkIn: '2026-01-10',
  checkOut: '2026-01-13'
}

const mockFutureReservation = {
  id: 'res-b4e9f5a6-1c9d-0a8e-4f2e-3b5a0c9d1f6b',
  status: 'approved',
  firstName: 'Future',
  lastName: 'Guest',
  checkIn: '2026-03-01',
  checkOut: '2026-03-05'
}

describe('Feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderWithRouter = (initialRoute = '/feedback/res-a3d9e4f5-0b8c-9a7d-3f1e-2b4a9c8d0f5a') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/feedback/:reservationId" element={<Feedback />} />
        </Routes>
      </MemoryRouter>
    )
  }

  it('shows loading state initially', () => {
    fetch.mockImplementation(() => new Promise(() => {}))
    renderWithRouter()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows error for invalid UUID format', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/feedback/invalid-id']}>
        <Routes>
          <Route path="/feedback/:reservationId" element={<Feedback />} />
        </Routes>
      </MemoryRouter>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Unable to Load Feedback Form')).toBeInTheDocument()
    })
    expect(screen.getByText(/Invalid feedback link/)).toBeInTheDocument()
  })

  it('loads completed reservation successfully', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ reservations: [mockCompletedReservation] })
    })

    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByText(/How Was Your Stay, Robert\?/)).toBeInTheDocument()
    })
  })

  it('shows error for future checkout date', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ reservations: [mockFutureReservation] })
    })

    render(
      <MemoryRouter initialEntries={['/feedback/res-b4e9f5a6-1c9d-0a8e-4f2e-3b5a0c9d1f6b']}>
        <Routes>
          <Route path="/feedback/:reservationId" element={<Feedback />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/hasn't been completed yet/)).toBeInTheDocument()
    })
  })

  it('shows error for non-existent reservation', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ reservations: [] })
    })

    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByText(/Reservation not found/)).toBeInTheDocument()
    })
  })

  it('renders feedback form with all fields', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ reservations: [mockCompletedReservation] })
    })

    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByText(/Overall Rating/)).toBeInTheDocument()
    })

    expect(screen.getByText(/Tell us about your stay/)).toBeInTheDocument()
    expect(screen.getByText(/Would you recommend/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Submit Feedback/ })).toBeInTheDocument()
  })

  it('renders 5 star buttons', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ reservations: [mockCompletedReservation] })
    })

    renderWithRouter()

    await waitFor(() => {
      const stars = screen.getAllByLabelText(/star/)
      expect(stars).toHaveLength(5)
    })
  })

  it('allows star rating selection', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ reservations: [mockCompletedReservation] })
    })

    renderWithRouter()

    await waitFor(() => {
      const fiveStarButton = screen.getByLabelText('5 stars')
      fireEvent.click(fiveStarButton)
      expect(fiveStarButton).toHaveClass('filled')
    })
  })

  it('shows error when submitting without rating', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ reservations: [mockCompletedReservation] })
    })

    renderWithRouter()

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Submit Feedback/ })
      fireEvent.click(submitButton)
    })

    expect(screen.getByText(/Please select a rating/)).toBeInTheDocument()
  })

  it('shows error when submitting without recommendation', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ reservations: [mockCompletedReservation] })
    })

    renderWithRouter()

    await waitFor(() => {
      const fiveStarButton = screen.getByLabelText('5 stars')
      fireEvent.click(fiveStarButton)
    })

    const submitButton = screen.getByRole('button', { name: /Submit Feedback/ })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Please let us know if you would recommend us/)).toBeInTheDocument()
    })
  })

  it('allows text review input', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ reservations: [mockCompletedReservation] })
    })

    renderWithRouter()

    await waitFor(() => {
      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: 'Great stay!' } })
      expect(textarea.value).toBe('Great stay!')
    })
  })

  it('shows character count', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ reservations: [mockCompletedReservation] })
    })

    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByText('0/1000')).toBeInTheDocument()
    })
  })

  it('shows success message after submission', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ reservations: [mockCompletedReservation] })
    })

    renderWithRouter()

    await waitFor(() => {
      const fiveStarButton = screen.getByLabelText('5 stars')
      fireEvent.click(fiveStarButton)
    })

    const yesButton = screen.getByText(/👍 Yes/)
    fireEvent.click(yesButton)

    const submitButton = screen.getByRole('button', { name: /Submit Feedback/ })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Thank You!')).toBeInTheDocument()
    }, { timeout: 2000 }) // Increase timeout to account for setTimeout in component
  })

  it('displays reservation dates in form', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ reservations: [mockCompletedReservation] })
    })

    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByText(/Stay:/)).toBeInTheDocument()
    })
  })

  it('marks review field as optional', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ reservations: [mockCompletedReservation] })
    })

    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByText(/Optional/)).toBeInTheDocument()
    })
  })

  it('marks rating and recommendation as required', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ reservations: [mockCompletedReservation] })
    })

    renderWithRouter()

    await waitFor(() => {
      const requiredIndicators = screen.getAllByText('*')
      expect(requiredIndicators.length).toBeGreaterThanOrEqual(2)
    })
  })
})
