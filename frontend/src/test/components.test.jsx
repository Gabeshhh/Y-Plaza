import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PropertyCard from '../components/property/PropertyCard'
import SearchBar from '../components/property/SearchBar'
import { usePropertyFilters } from '../hooks'
import { renderHook, act } from '@testing-library/react'

// Mock property fixture
const mockProperty = {
  id: 1,
  title: 'Appartement T3 Paris',
  type: 'APPARTEMENT',
  price: 450000,
  surface: 75,
  rooms: 3,
  bedrooms: 2,
  city: 'Paris',
  zipCode: '75001',
  sold: false,
  active: true,
  views: 120,
  agencyName: 'Y-Plaza Paris',
}

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

// ===== PropertyCard tests =====
describe('PropertyCard', () => {
  it('affiche le titre du bien', () => {
    wrap(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('Appartement T3 Paris')).toBeInTheDocument()
  })

  it('affiche le prix formaté en euros', () => {
    wrap(<PropertyCard property={mockProperty} />)
    expect(screen.getByText(/450\s*000/)).toBeInTheDocument()
  })

  it('affiche la ville', () => {
    wrap(<PropertyCard property={mockProperty} />)
    // La ville apparaît dans le paragraphe de localisation (aria-label spécifique)
    expect(screen.getByText(/Paris \(75001\)/)).toBeInTheDocument()
  })

  it('affiche le badge Vendu quand sold=true', () => {
    wrap(<PropertyCard property={{ ...mockProperty, sold: true }} />)
    expect(screen.getByText('Vendu')).toBeInTheDocument()
  })

  it('affiche le type de bien', () => {
    wrap(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('Appartement')).toBeInTheDocument()
  })

  it('affiche le nombre de vues', () => {
    wrap(<PropertyCard property={mockProperty} />)
    expect(screen.getByText(/120 vues/)).toBeInTheDocument()
  })

  it('contient un lien vers le détail', () => {
    wrap(<PropertyCard property={mockProperty} />)
    const link = screen.getByRole('link', { name: /Voir le détail/i })
    expect(link).toHaveAttribute('href', '/properties/1')
  })

  it('est accessible avec aria-label', () => {
    wrap(<PropertyCard property={mockProperty} />)
    expect(screen.getByRole('article', { name: /Appartement T3 Paris/ })).toBeInTheDocument()
  })
})

// ===== SearchBar tests =====
describe('SearchBar', () => {
  const mockFilters = {
    city: '', type: '', minPrice: '', maxPrice: '',
    minSurface: '', sortBy: 'createdAt', direction: 'desc',
  }
  const mockOnChange = vi.fn()
  const mockOnSearch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le champ ville', () => {
    render(<SearchBar filters={mockFilters} onFilterChange={mockOnChange} onSearch={mockOnSearch} loading={false} />)
    expect(screen.getByLabelText(/Rechercher par ville/i)).toBeInTheDocument()
  })

  it('appelle onFilterChange lors de la saisie', () => {
    render(<SearchBar filters={mockFilters} onFilterChange={mockOnChange} onSearch={mockOnSearch} loading={false} />)
    const input = screen.getByLabelText(/Rechercher par ville/i)
    fireEvent.change(input, { target: { value: 'Lyon' } })
    expect(mockOnChange).toHaveBeenCalledWith('city', 'Lyon')
  })

  it('appelle onSearch lors de la soumission', () => {
    render(<SearchBar filters={mockFilters} onFilterChange={mockOnChange} onSearch={mockOnSearch} loading={false} />)
    const form = screen.getByRole('search')
    fireEvent.submit(form)
    expect(mockOnSearch).toHaveBeenCalled()
  })

  it('désactive le bouton pendant le chargement', () => {
    render(<SearchBar filters={mockFilters} onFilterChange={mockOnChange} onSearch={mockOnSearch} loading={true} />)
    expect(screen.getByRole('button', { name: /Lancer la recherche/i })).toBeDisabled()
  })

  it('affiche les filtres avancés au clic', () => {
    render(<SearchBar filters={mockFilters} onFilterChange={mockOnChange} onSearch={mockOnSearch} loading={false} />)
    const toggle = screen.getByRole('button', { name: /Filtres/i })
    fireEvent.click(toggle)
    expect(screen.getByLabelText(/Prix minimum/i)).toBeInTheDocument()
  })
})

// ===== Hook usePropertyFilters tests =====
describe('usePropertyFilters', () => {
  it('initialise avec des valeurs vides', () => {
    const { result } = renderHook(() => usePropertyFilters())
    expect(result.current.filters.city).toBe('')
    expect(result.current.filters.type).toBe('')
  })

  it('met à jour un filtre', () => {
    const { result } = renderHook(() => usePropertyFilters())
    act(() => { result.current.updateFilter('city', 'Paris') })
    expect(result.current.filters.city).toBe('Paris')
  })

  it('remet à zéro les filtres', () => {
    const { result } = renderHook(() => usePropertyFilters())
    act(() => { result.current.updateFilter('city', 'Lyon') })
    act(() => { result.current.resetFilters() })
    expect(result.current.filters.city).toBe('')
  })

  it('exclut les valeurs vides dans toQueryParams', () => {
    const { result } = renderHook(() => usePropertyFilters())
    act(() => { result.current.updateFilter('city', 'Nice') })
    const params = result.current.toQueryParams()
    expect(params.city).toBe('Nice')
    expect(params.type).toBeUndefined()
  })
})
