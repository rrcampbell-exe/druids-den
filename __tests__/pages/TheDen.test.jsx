import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { TheDen } from '../../src/pages/PublicPages'

const renderWithRouter = (component) => render(<BrowserRouter>{component}</BrowserRouter>)

describe('The Den', () => {
  it('uses the interior collection to tell the story of the cabin', () => {
    renderWithRouter(<TheDen />)

    expect(screen.getByAltText('The open-plan main room with its living room, kitchen, and loft')).toHaveAttribute('src', '/assets/images/druids_den_main_room_from_living_area.jpeg')
    expect(screen.getByAltText('The dining table, kitchen, and loft in the open-plan main room')).toBeInTheDocument()
    expect(screen.getByAltText('The living area viewed from the hallway')).toBeInTheDocument()
    expect(screen.getByAltText('The living room beneath the vaulted wood ceiling and bookshelf')).toBeInTheDocument()
    expect(screen.getByAltText('The loft bedroom viewed from the stairway')).toBeInTheDocument()
    expect(screen.getByAltText('The loft bedroom with a patterned quilt and forest-facing window')).toBeInTheDocument()
    expect(screen.getByAltText('A fawn figurine resting beside a pinecone')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Warmth and gathering space.' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'The loft, above it all.' })).toBeInTheDocument()
  })
})