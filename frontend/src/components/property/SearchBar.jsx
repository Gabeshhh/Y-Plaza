import { useState } from 'react'

const PROPERTY_TYPES = [
  { value: '', label: 'Tous les types' },
  { value: 'APPARTEMENT', label: 'Appartement' },
  { value: 'MAISON', label: 'Maison' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'BUREAU', label: 'Bureau' },
  { value: 'LOCAL_COMMERCIAL', label: 'Local commercial' },
  { value: 'TERRAIN', label: 'Terrain' },
]

export default function SearchBar({ filters, onFilterChange, onSearch, loading }) {
  const [expanded, setExpanded] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch()
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form} role="search" aria-label="Rechercher des biens immobiliers">
      {/* Barre principale */}
      <div style={styles.mainRow}>
        <div style={styles.inputGroup}>
          <label htmlFor="search-city" className="sr-only">Ville</label>
          <svg style={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <input
            id="search-city"
            type="text"
            className="form-input"
            style={styles.cityInput}
            placeholder="Ville, département..."
            value={filters.city}
            onChange={e => onFilterChange('city', e.target.value)}
            aria-label="Rechercher par ville"
          />
        </div>

        <div>
          <label htmlFor="search-type" className="sr-only">Type de bien</label>
          <select
            id="search-type"
            className="form-select"
            style={styles.typeSelect}
            value={filters.type}
            onChange={e => onFilterChange('type', e.target.value)}
            aria-label="Filtrer par type de bien"
          >
            {PROPERTY_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="btn btn-ghost"
          style={styles.filterToggle}
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-controls="advanced-filters"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          Filtres
          {expanded ? ' ▲' : ' ▼'}
        </button>

        <button
          type="submit"
          className="btn btn-accent"
          style={styles.searchBtn}
          disabled={loading}
          aria-label="Lancer la recherche"
        >
          {loading ? (
            <span style={styles.spinner} aria-hidden="true" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          )}
          Rechercher
        </button>
      </div>

      {/* Filtres avancés */}
      {expanded && (
        <div id="advanced-filters" style={styles.advancedRow} role="group" aria-label="Filtres avancés">
          <div className="form-group" style={styles.filterGroup}>
            <label htmlFor="min-price" className="form-label">Prix minimum (€)</label>
            <input
              id="min-price"
              type="number"
              className="form-input"
              placeholder="100 000"
              value={filters.minPrice}
              onChange={e => onFilterChange('minPrice', e.target.value)}
              min="0"
            />
          </div>

          <div className="form-group" style={styles.filterGroup}>
            <label htmlFor="max-price" className="form-label">Prix maximum (€)</label>
            <input
              id="max-price"
              type="number"
              className="form-input"
              placeholder="1 000 000"
              value={filters.maxPrice}
              onChange={e => onFilterChange('maxPrice', e.target.value)}
              min="0"
            />
          </div>

          <div className="form-group" style={styles.filterGroup}>
            <label htmlFor="min-surface" className="form-label">Surface min (m²)</label>
            <input
              id="min-surface"
              type="number"
              className="form-input"
              placeholder="20"
              value={filters.minSurface}
              onChange={e => onFilterChange('minSurface', e.target.value)}
              min="0"
            />
          </div>

          <div className="form-group" style={styles.filterGroup}>
            <label htmlFor="sort-by" className="form-label">Trier par</label>
            <select
              id="sort-by"
              className="form-select"
              value={filters.sortBy}
              onChange={e => onFilterChange('sortBy', e.target.value)}
            >
              <option value="createdAt">Date d'ajout</option>
              <option value="price">Prix</option>
              <option value="surface">Surface</option>
              <option value="views">Popularité</option>
            </select>
          </div>

          <div className="form-group" style={styles.filterGroup}>
            <label htmlFor="sort-dir" className="form-label">Ordre</label>
            <select
              id="sort-dir"
              className="form-select"
              value={filters.direction}
              onChange={e => onFilterChange('direction', e.target.value)}
            >
              <option value="desc">Décroissant</option>
              <option value="asc">Croissant</option>
            </select>
          </div>
        </div>
      )}
    </form>
  )
}

const styles = {
  form: {
    background: 'var(--color-white)',
    borderRadius: 'var(--radius-xl)',
    padding: '20px 24px',
    boxShadow: 'var(--shadow-elevated)',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  mainRow: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    alignItems: 'stretch',
  },
  inputGroup: {
    position: 'relative',
    flex: 2,
    minWidth: 200,
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    color: 'var(--color-stone)',
    pointerEvents: 'none',
  },
  cityInput: { paddingLeft: 36 },
  typeSelect: { minWidth: 180 },
  filterToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 14,
    whiteSpace: 'nowrap',
  },
  searchBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 140,
    justifyContent: 'center',
  },
  spinner: {
    width: 14,
    height: 14,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.8s linear infinite',
  },
  advancedRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 16,
    paddingTop: 16,
    borderTop: '1px solid var(--color-sand)',
  },
  filterGroup: { gap: 4 },
}
