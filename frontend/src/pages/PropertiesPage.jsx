import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { propertiesAPI } from '../../services/api'
import PropertyCard from '../property/PropertyCard'
import SearchBar from '../property/SearchBar'
import { usePropertyFilters, usePagination } from '../../hooks'

export default function PropertiesPage() {
  const [searchParams] = useSearchParams()
  const [properties, setProperties] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { filters, updateFilter, resetFilters, toQueryParams } = usePropertyFilters()
  const { page, size, goToPage, reset } = usePagination(0, 12)

  // Init depuis URL params
  useEffect(() => {
    const city = searchParams.get('city')
    const type = searchParams.get('type')
    if (city) updateFilter('city', city)
    if (type) updateFilter('type', type)
  }, [])

  const fetchProperties = async (currentPage = page) => {
    setLoading(true)
    setError(null)
    try {
      const params = { ...toQueryParams(), page: currentPage, size }
      const res = await propertiesAPI.search(params)
      const pageData = res.data.data
      setProperties(pageData.content || [])
      setTotalPages(pageData.totalPages || 0)
      setTotalElements(pageData.totalElements || 0)
    } catch {
      setError('Impossible de charger les biens. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProperties(0) }, [])

  const handleSearch = () => {
    reset()
    fetchProperties(0)
  }

  const handlePageChange = (newPage) => {
    goToPage(newPage)
    fetchProperties(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="page" role="main">
      <div className="container">
        {/* En-tête */}
        <div style={styles.header}>
          <h1 style={styles.title}>Nos biens immobiliers</h1>
          <p style={styles.sub}>Résidentiel &amp; professionnel — partout en France</p>
        </div>

        {/* Barre de recherche */}
        <div style={styles.searchWrapper}>
          <SearchBar
            filters={filters}
            onFilterChange={updateFilter}
            onSearch={handleSearch}
            loading={loading}
          />
        </div>

        {/* Résultats */}
        {error ? (
          <div className="alert alert-error" role="alert">{error}</div>
        ) : (
          <>
            <div style={styles.resultsBar}>
              {!loading && (
                <p style={styles.count} aria-live="polite" aria-atomic="true">
                  <strong>{totalElements}</strong> bien{totalElements !== 1 ? 's' : ''} trouvé{totalElements !== 1 ? 's' : ''}
                </p>
              )}
              <button onClick={resetFilters} className="btn btn-ghost" style={styles.resetBtn}
                aria-label="Réinitialiser les filtres">
                Réinitialiser
              </button>
            </div>

            {loading ? (
              <div style={styles.loadingGrid} role="status" aria-label="Chargement des biens">
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={styles.skeleton} aria-hidden="true" />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div style={styles.empty} role="status">
                <p style={styles.emptyIcon} aria-hidden="true">🔍</p>
                <p style={styles.emptyTitle}>Aucun bien trouvé</p>
                <p style={styles.emptySub}>Essayez de modifier vos critères de recherche.</p>
                <button onClick={() => { resetFilters(); handleSearch() }} className="btn btn-accent">
                  Voir tous les biens
                </button>
              </div>
            ) : (
              <div className="property-grid" role="list" aria-label="Liste des biens">
                {properties.map(p => (
                  <div key={p.id} role="listitem">
                    <PropertyCard property={p} />
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav style={styles.pagination} aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 0}
                  className="btn btn-outline"
                  aria-label="Page précédente"
                >
                  ← Précédent
                </button>

                <div style={styles.pageNums} role="list">
                  {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                    const pageNum = totalPages <= 7 ? i :
                      page < 4 ? i :
                      page > totalPages - 4 ? totalPages - 7 + i :
                      page - 3 + i
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className="btn"
                        style={{
                          ...styles.pageBtn,
                          ...(pageNum === page ? styles.pageBtnActive : {})
                        }}
                        aria-label={`Page ${pageNum + 1}`}
                        aria-current={pageNum === page ? 'page' : undefined}
                        role="listitem"
                      >
                        {pageNum + 1}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="btn btn-outline"
                  aria-label="Page suivante"
                >
                  Suivant →
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  )
}

const styles = {
  header: { textAlign: 'center', marginBottom: 40 },
  title: { fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 600, color: 'var(--color-dark)', margin: '0 0 8px' },
  sub: { fontSize: 16, color: 'var(--color-stone)', margin: 0 },
  searchWrapper: { marginBottom: 32 },
  resultsBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 8 },
  count: { fontSize: 14, color: 'var(--color-stone)' },
  resetBtn: { fontSize: 13 },
  loadingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 },
  skeleton: { height: 380, background: 'var(--color-sand)', borderRadius: 'var(--radius-lg)' },
  empty: { textAlign: 'center', padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  emptyIcon: { fontSize: 56, margin: 0 },
  emptyTitle: { fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, color: 'var(--color-dark)' },
  emptySub: { color: 'var(--color-stone)', marginBottom: 16 },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 48 },
  pageNums: { display: 'flex', gap: 4 },
  pageBtn: { width: 40, height: 40, padding: 0, justifyContent: 'center', fontSize: 14 },
  pageBtnActive: { background: 'var(--color-charcoal)', color: 'var(--color-cream)', borderColor: 'var(--color-charcoal)' },
}
