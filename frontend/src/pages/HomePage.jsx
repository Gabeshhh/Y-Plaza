import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { propertiesAPI, agenciesAPI } from '../services/api'
import PropertyCard from '../components/property/PropertyCard'

export default function HomePage() {
  const [topProperties, setTopProperties] = useState([])
  const [agencies, setAgencies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchCity, setSearchCity] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      propertiesAPI.getTop(6),
      agenciesAPI.getAll(),
    ]).then(([propRes, agencyRes]) => {
      setTopProperties(propRes.data.data || [])
      setAgencies(agencyRes.data.data || [])
    }).finally(() => setLoading(false))
  }, [])

  const handleHeroSearch = (e) => {
    e.preventDefault()
    navigate(`/properties${searchCity ? `?city=${encodeURIComponent(searchCity)}` : ''}`)
  }

  return (
    <main role="main">
      {/* === HERO === */}
      <section style={styles.hero} aria-label="Bannière principale">
        <div style={styles.heroOverlay} aria-hidden="true" />
        <div className="container" style={styles.heroContent}>
          <p style={styles.heroPre}>Le réseau immobilier de confiance</p>
          <h1 style={styles.heroTitle}>
            Trouvez le bien<br />
            <em>qui vous ressemble</em>
          </h1>
          <p style={styles.heroSub}>
            13 agences en France, des centaines de biens résidentiels et professionnels.
          </p>

          {/* Search hero */}
          <form onSubmit={handleHeroSearch} style={styles.heroSearch} role="search" aria-label="Recherche rapide">
            <label htmlFor="hero-city" className="sr-only">Ville</label>
            <input
              id="hero-city"
              type="text"
              style={styles.heroInput}
              placeholder="Paris, Lyon, Marseille..."
              value={searchCity}
              onChange={e => setSearchCity(e.target.value)}
              aria-label="Rechercher par ville"
            />
            <button type="submit" className="btn btn-accent" style={styles.heroBtn}>
              Rechercher
            </button>
          </form>

          <div style={styles.heroStats} aria-label="Statistiques Y-Plaza">
            {[
              ['13', 'Agences en France'],
              ['500+', 'Biens disponibles'],
              ['10 000+', 'Clients satisfaits'],
            ].map(([n, l]) => (
              <div key={l} style={styles.heroStat}>
                <span style={styles.heroStatNum}>{n}</span>
                <span style={styles.heroStatLabel}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === BIENS POPULAIRES === */}
      <section style={styles.section} aria-label="Biens populaires">
        <div className="container">
          <div style={styles.sectionHeader}>
            <div>
              <p style={styles.sectionPre}>Sélection</p>
              <h2 style={styles.sectionTitle}>Biens en vedette</h2>
            </div>
            <Link to="/properties" className="btn btn-outline" aria-label="Voir tous les biens">
              Voir tout →
            </Link>
          </div>

          {loading ? (
            <div style={styles.loadingRow} role="status" aria-label="Chargement">
              {[...Array(3)].map((_, i) => (
                <div key={i} style={styles.skeleton} aria-hidden="true" />
              ))}
            </div>
          ) : topProperties.length > 0 ? (
            <div className="property-grid">
              {topProperties.map(p => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          ) : (
            <p style={styles.empty}>Aucun bien disponible pour le moment.</p>
          )}
        </div>
      </section>

      {/* === TYPES DE BIENS === */}
      <section style={styles.sectionAlt} aria-label="Types de biens">
        <div className="container">
          <p style={styles.sectionPre}>Catalogue</p>
          <h2 style={styles.sectionTitle}>Par type de bien</h2>
          <div style={styles.typesGrid} role="list">
            {[
              { type: 'APPARTEMENT', icon: '🏢', label: 'Appartements' },
              { type: 'MAISON', icon: '🏠', label: 'Maisons' },
              { type: 'VILLA', icon: '🏡', label: 'Villas' },
              { type: 'BUREAU', icon: '💼', label: 'Bureaux' },
              { type: 'LOCAL_COMMERCIAL', icon: '🏪', label: 'Locaux commerciaux' },
              { type: 'TERRAIN', icon: '🌿', label: 'Terrains' },
            ].map(({ type, icon, label }) => (
              <Link
                key={type}
                to={`/properties?type=${type}`}
                style={styles.typeCard}
                role="listitem"
                aria-label={`Voir les ${label}`}
              >
                <span style={styles.typeIcon} aria-hidden="true">{icon}</span>
                <span style={styles.typeLabel}>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* === AGENCES === */}
      <section style={styles.section} aria-label="Nos agences">
        <div className="container">
          <div style={styles.sectionHeader}>
            <div>
              <p style={styles.sectionPre}>Réseau</p>
              <h2 style={styles.sectionTitle}>Nos agences</h2>
            </div>
            <Link to="/agencies" className="btn btn-outline">Toutes les agences →</Link>
          </div>

          <div style={styles.agenciesGrid} role="list">
            {agencies.slice(0, 6).map(agency => (
              <div key={agency.id} style={styles.agencyCard} role="listitem">
                {agency.headquarters && (
                  <span style={styles.hqBadge} aria-label="Siège social">Siège</span>
                )}
                <p style={styles.agencyName}>{agency.name}</p>
                <p style={styles.agencyCity}>{agency.city}</p>
                {agency.phone && (
                  <a href={`tel:${agency.phone}`} style={styles.agencyPhone}>{agency.phone}</a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === CTA === */}
      <section style={styles.cta} aria-label="Appel à l'action">
        <div className="container" style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>Prêt à trouver votre bien idéal ?</h2>
          <p style={styles.ctaSub}>Rejoignez Y-Plaza et accédez à des centaines d'offres exclusives.</p>
          <div style={styles.ctaBtns}>
            <Link to="/register" className="btn btn-accent" style={{ fontSize: 16, padding: '14px 32px' }}>
              Créer un compte gratuit
            </Link>
            <Link to="/properties" className="btn btn-outline" style={{ fontSize: 16, padding: '14px 32px', borderColor: 'white', color: 'white' }}>
              Parcourir les biens
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

const styles = {
  hero: {
    position: 'relative',
    background: 'var(--color-dark)',
    minHeight: '90vh',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse at 70% 50%, rgba(194,113,74,0.15) 0%, transparent 60%)',
  },
  heroContent: { position: 'relative', zIndex: 1, paddingTop: 80, paddingBottom: 80 },
  heroPre: { fontSize: 12, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 16 },
  heroTitle: {
    fontFamily: 'var(--font-display)', fontSize: 72, fontWeight: 300,
    color: 'var(--color-cream)', lineHeight: 1.1, marginBottom: 20,
  },
  heroSub: { fontSize: 18, color: 'var(--color-stone)', lineHeight: 1.7, maxWidth: 500, marginBottom: 40 },
  heroSearch: {
    display: 'flex', gap: 0, maxWidth: 520,
    background: 'var(--color-white)', borderRadius: 'var(--radius-lg)',
    overflow: 'hidden', marginBottom: 56,
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
  heroInput: {
    flex: 1, padding: '16px 20px', fontSize: 16, border: 'none', outline: 'none',
    fontFamily: 'var(--font-body)', background: 'transparent', color: 'var(--color-charcoal)',
  },
  heroBtn: { borderRadius: 0, padding: '16px 28px', fontSize: 15 },
  heroStats: { display: 'flex', gap: 48 },
  heroStat: { display: 'flex', flexDirection: 'column', gap: 4 },
  heroStatNum: { fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, color: 'var(--color-accent)', lineHeight: 1 },
  heroStatLabel: { fontSize: 13, color: 'var(--color-stone)' },
  section: { padding: '80px 0' },
  sectionAlt: { padding: '80px 0', background: 'var(--color-sand)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 },
  sectionPre: { fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 8 },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 600, color: 'var(--color-dark)', margin: 0 },
  loadingRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 },
  skeleton: { height: 360, background: 'var(--color-sand)', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s ease infinite alternate' },
  empty: { color: 'var(--color-stone)', textAlign: 'center', padding: '48px 0' },
  typesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginTop: 32 },
  typeCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    padding: '32px 16px', background: 'var(--color-white)', borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-card)', transition: 'all 200ms ease', cursor: 'pointer',
  },
  typeIcon: { fontSize: 36 },
  typeLabel: { fontSize: 14, fontWeight: 500, color: 'var(--color-charcoal)', textAlign: 'center' },
  agenciesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginTop: 32 },
  agencyCard: {
    background: 'var(--color-white)', borderRadius: 'var(--radius-lg)',
    padding: '20px', boxShadow: 'var(--shadow-card)', position: 'relative',
  },
  hqBadge: {
    position: 'absolute', top: 12, right: 12,
    background: 'var(--color-accent-light)', color: 'var(--color-accent-dark)',
    padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
  },
  agencyName: { fontWeight: 600, fontSize: 14, color: 'var(--color-dark)', marginBottom: 4 },
  agencyCity: { fontSize: 13, color: 'var(--color-stone)', marginBottom: 8 },
  agencyPhone: { fontSize: 12, color: 'var(--color-accent)', display: 'block' },
  cta: { background: 'var(--color-charcoal)', padding: '80px 0' },
  ctaContent: { textAlign: 'center' },
  ctaTitle: { fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 600, color: 'var(--color-cream)', marginBottom: 16 },
  ctaSub: { fontSize: 16, color: 'var(--color-stone)', marginBottom: 40 },
  ctaBtns: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' },
}
