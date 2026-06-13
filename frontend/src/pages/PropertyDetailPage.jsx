import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { propertiesAPI, transactionsAPI } from '../services/api'
import { useAuthStore } from '../context/authStore'

const TYPE_LABELS = {
  APPARTEMENT: 'Appartement', MAISON: 'Maison', VILLA: 'Villa',
  STUDIO: 'Studio', BUREAU: 'Bureau', LOCAL_COMMERCIAL: 'Local commercial',
  TERRAIN: 'Terrain', ENTREPOT: 'Entrepôt',
}

export default function PropertyDetailPage() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [txLoading, setTxLoading] = useState(false)
  const [txMessage, setTxMessage] = useState(null)

  useEffect(() => {
    propertiesAPI.getById(id)
      .then(r => setProperty(r.data.data))
      .catch(() => setError('Bien introuvable.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleContactRequest = async () => {
    if (!user) { navigate('/login', { state: { from: { pathname: `/properties/${id}` } } }); return }
    setTxLoading(true)
    setTxMessage(null)
    try {
      await transactionsAPI.create(id)
      setTxMessage({ type: 'success', text: 'Votre demande a été envoyée ! Un commercial vous contactera bientôt.' })
    } catch (err) {
      setTxMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la demande.' })
    } finally {
      setTxLoading(false)
    }
  }

  const fmt = (price) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price)

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }} role="status" aria-label="Chargement">
      <div className="spinner" />
    </div>
  )

  if (error || !property) return (
    <main className="page" role="main">
      <div className="container" style={{ textAlign: 'center', paddingTop: 80 }}>
        <p style={{ fontSize: 56, marginBottom: 16 }} aria-hidden="true">🏚</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>{error || 'Bien introuvable'}</h1>
        <Link to="/properties" className="btn btn-accent" style={{ marginTop: 24, display: 'inline-flex' }}>
          Retour aux biens
        </Link>
      </div>
    </main>
  )

  const p = property

  return (
    <main className="page" role="main">
      <div className="container">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" style={styles.breadcrumb}>
          <Link to="/" style={styles.bcLink}>Accueil</Link>
          <span aria-hidden="true"> / </span>
          <Link to="/properties" style={styles.bcLink}>Biens</Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page" style={styles.bcCurrent}>{p.title}</span>
        </nav>

        <div style={styles.layout}>
          {/* Left — details */}
          <article style={styles.main} aria-label="Détail du bien">
            {/* Image */}
            <div style={styles.imgBlock}>
              <span style={styles.bigIcon} aria-hidden="true">
                {p.type === 'APPARTEMENT' ? '🏢' : p.type === 'MAISON' ? '🏠' : p.type === 'VILLA' ? '🏡' : '🏠'}
              </span>
              {p.sold && <div style={styles.soldOverlay} role="status"><span>Vendu</span></div>}
            </div>

            {/* Info */}
            <div style={styles.info}>
              <div style={styles.topRow}>
                <span style={styles.typePill}>{TYPE_LABELS[p.type] || p.type}</span>
                <span style={styles.views} aria-label={`${p.views} consultations`}>{p.views} vues</span>
              </div>

              <h1 style={styles.title}>{p.title}</h1>

              <p style={styles.location} aria-label={`Localisation : ${p.address}, ${p.city}`}>
                📍 {p.address}, {p.city}{p.zipCode ? ` (${p.zipCode})` : ''}
              </p>

              {/* Caractéristiques */}
              <section aria-label="Caractéristiques">
                <h2 style={styles.sectionTitle}>Caractéristiques</h2>
                <dl style={styles.features}>
                  {[
                    ['Surface', p.surface ? `${p.surface} m²` : null],
                    ['Pièces', p.rooms],
                    ['Chambres', p.bedrooms],
                    ['Salles de bain', p.bathrooms],
                    ['Étage', p.floor != null ? (p.floor === 0 ? 'RDC' : `${p.floor}e`) : null],
                    ['Parking', p.hasParking ? '✓' : null],
                    ['Jardin', p.hasGarden ? '✓' : null],
                    ['Balcon', p.hasBalcony ? '✓' : null],
                    ['Ascenseur', p.hasElevator ? '✓' : null],
                  ].filter(([, v]) => v != null).map(([label, value]) => (
                    <div key={label} style={styles.feat}>
                      <dt style={styles.featLabel}>{label}</dt>
                      <dd style={styles.featVal}>{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              {/* Description */}
              {p.description && (
                <section aria-label="Description">
                  <h2 style={styles.sectionTitle}>Description</h2>
                  <p style={styles.desc}>{p.description}</p>
                </section>
              )}

              {/* Agence */}
              <section style={styles.agencyInfo} aria-label="Agence responsable">
                <p style={styles.agencyLabel}>Proposé par</p>
                <p style={styles.agencyName}>{p.agencyName || 'Y-Plaza'}</p>
                {p.commercialName && (
                  <p style={styles.commercialName}>Contact : {p.commercialName}</p>
                )}
              </section>
            </div>
          </article>

          {/* Right — sticky sidebar */}
          <aside style={styles.sidebar} aria-label="Prix et contact">
            <div style={styles.priceCard}>
              <p style={styles.priceLabel}>Prix de vente</p>
              <p style={styles.price}>{fmt(p.price)}</p>
              {p.surface && (
                <p style={styles.priceM2}>{fmt(p.price / p.surface)} / m²</p>
              )}

              <div style={styles.divider} />

              {txMessage && (
                <div className={`alert alert-${txMessage.type}`} role="alert" aria-live="polite">
                  {txMessage.text}
                </div>
              )}

              {p.sold ? (
                <div className="alert alert-error">Ce bien a été vendu.</div>
              ) : (
                <button
                  className="btn btn-accent"
                  style={styles.ctaBtn}
                  onClick={handleContactRequest}
                  disabled={txLoading || !!txMessage}
                  aria-busy={txLoading}
                >
                  {txLoading ? 'Envoi...' : '📩 Faire une demande'}
                </button>
              )}

              {!user && !p.sold && (
                <p style={styles.loginHint}>
                  <Link to="/login" style={{ color: 'var(--color-accent)' }}>Connectez-vous</Link> pour faire une demande
                </p>
              )}

              <div style={styles.divider} />

              <Link to="/properties" style={styles.backLink}>← Retour aux annonces</Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

const styles = {
  breadcrumb: { fontSize: 13, color: 'var(--color-stone)', marginBottom: 32, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
  bcLink: { color: 'var(--color-accent)' },
  bcCurrent: { color: 'var(--color-charcoal)', fontWeight: 500 },
  layout: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 40, alignItems: 'start' },
  main: {},
  imgBlock: {
    height: 360, background: 'linear-gradient(135deg, #C4BAA8, #8B7355)',
    borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', position: 'relative', overflow: 'hidden', marginBottom: 32,
  },
  bigIcon: { fontSize: 96, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' },
  soldOverlay: {
    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '0.1em',
  },
  info: { display: 'flex', flexDirection: 'column', gap: 24 },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  typePill: { background: 'var(--color-accent-light)', color: 'var(--color-accent-dark)', padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 },
  views: { fontSize: 12, color: 'var(--color-stone)' },
  title: { fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 600, color: 'var(--color-dark)', lineHeight: 1.2, margin: 0 },
  location: { fontSize: 15, color: 'var(--color-stone)', margin: 0 },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--color-dark)', marginBottom: 16 },
  features: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 },
  feat: { background: 'var(--color-cream)', borderRadius: 'var(--radius-md)', padding: '12px 16px' },
  featLabel: { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-stone)', marginBottom: 4 },
  featVal: { fontSize: 16, fontWeight: 600, color: 'var(--color-charcoal)' },
  desc: { fontSize: 15, color: 'var(--color-charcoal)', lineHeight: 1.75 },
  agencyInfo: { background: 'var(--color-cream)', borderRadius: 'var(--radius-lg)', padding: '20px' },
  agencyLabel: { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-stone)', marginBottom: 4 },
  agencyName: { fontWeight: 600, fontSize: 16, color: 'var(--color-dark)' },
  commercialName: { fontSize: 13, color: 'var(--color-stone)', marginTop: 4 },
  sidebar: { position: 'sticky', top: 88 },
  priceCard: {
    background: 'var(--color-white)', borderRadius: 'var(--radius-xl)',
    padding: '28px', boxShadow: 'var(--shadow-elevated)',
    display: 'flex', flexDirection: 'column', gap: 16,
  },
  priceLabel: { fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-stone)', margin: 0 },
  price: { fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 600, color: 'var(--color-charcoal)', margin: 0, lineHeight: 1 },
  priceM2: { fontSize: 13, color: 'var(--color-stone)', margin: 0 },
  divider: { height: 1, background: 'var(--color-sand)' },
  ctaBtn: { width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 },
  loginHint: { fontSize: 13, color: 'var(--color-stone)', textAlign: 'center', margin: 0 },
  backLink: { fontSize: 14, color: 'var(--color-accent)', display: 'block', textAlign: 'center' },
}
