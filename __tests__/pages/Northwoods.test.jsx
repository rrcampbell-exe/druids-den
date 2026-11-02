import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { Northwoods } from '../../src/pages/PublicPages'

describe('Northwoods guide', () => {
  it('links guests to specific regional resources with accurate labels', () => {
    render(<BrowserRouter><Northwoods /></BrowserRouter>)

    expect(screen.getByText(/Sucker Springs Mountain Bike Trail and the Conover-Phelps Trail/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Eagle River Chain of Lakes' })).toHaveAttribute('href', 'https://northwoodswisconsin.com/northern-wisconsin-recreation/eagle-river-chain-of-lakes/')
    expect(screen.getByRole('link', { name: 'Wisconsin boating information' })).toHaveAttribute('href', 'https://dnr.wisconsin.gov/topic/Boat')
    expect(screen.getByRole('link', { name: 'Vilas County hiking trails' })).toHaveAttribute('href', 'https://www.vilascountywi.gov/departments/services/parks_and_recreation/trails___recreational_opportunities/hunter_hiking_trails.php')
    expect(screen.getByRole('link', { name: 'Vilas County bike trails' })).toHaveAttribute('href', 'https://www.vilascountywi.gov/departments/services/parks_and_recreation/trails___recreational_opportunities/bike_trails.php')
    expect(screen.getByRole('link', { name: 'Wisconsin 511 road conditions' })).toHaveAttribute('href', 'https://511wi.gov/')
    expect(screen.getByRole('link', { name: 'Vilas County snowmobile trails' })).toBeInTheDocument()
    const atvSection = screen.getByRole('heading', { name: 'ATV & UTV trails' }).closest('article')
    expect(atvSection).toHaveTextContent(/including Conover/)
    expect(within(atvSection).getByRole('link', { name: 'Vilas County ATV and UTV trails' })).toHaveAttribute('href', 'https://www.vilascountywi.gov/departments/services/parks_and_recreation/trails___recreational_opportunities/atv_trails.php')
    const winterSection = screen.getByRole('heading', { name: 'Winter recreation' }).closest('article')
    expect(within(winterSection).queryByRole('link', { name: 'Vilas County ATV and UTV trails' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Pioneer Creek ski trails' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Honey Bear Inn in Eagle River' })).toHaveAttribute('href', 'https://share.google/6bzLDlQTHICa1SUmb')
    expect(screen.getByRole('link', { name: "Brew's Pub in Land O' Lakes" })).toHaveAttribute('href', 'https://share.google/K9P3V8jEzpzWnVDOi')
    expect(screen.getByRole('link', { name: 'Twilight Supper Club' })).toHaveAttribute('href', 'https://twilightsupperclub.com/')
    expect(screen.getByText(/Local recommendations include Honey Bear Inn/)).toBeInTheDocument()
    expect(screen.queryByText(/Dan's local suggestions/i)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: "Trig's of Eagle River" })).toHaveAttribute('href', 'https://share.google/fPbC19bTIA7E3PwqG')
    expect(screen.getByRole('link', { name: 'The Craftsman American Tavern' })).toHaveAttribute('href', 'https://www.thecraftsmanamericantavern.com/')
    expect(screen.getByRole('link', { name: 'World Championship Derby Complex' })).toHaveAttribute('href', 'https://derbycomplex.com/')
    expect(screen.queryByRole('link', { name: 'Wisconsin DNR outdoor recreation guidance' })).not.toBeInTheDocument()
    expect(screen.queryByText(/No direct .* access from the cabin is confirmed/i)).not.toBeInTheDocument()
  })
})
