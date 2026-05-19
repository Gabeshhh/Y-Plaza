import { Link } from 'react-router-dom'

const TYPE_LABELS = {
  APPARTEMENT: 'Appartement', MAISON: 'Maison', VILLA: 'Villa',
  STUDIO: 'Studio', BUREAU: 'Bureau', LOCAL_COMMERCIAL: 'Local commercial',
  TERRAIN: 'Terrain', ENTREPOT: 'Entrepôt',
}

const TYPE_ICONS = {
  APPARTEMENT: '🏢', MAISON: '🏠', VILLA: '🏡', STUDIO: '🛋️',
  BUREAU: '💼', LOCAL_COMMERCIAL: '🏪', TERRAIN: '🌿', ENTREPOT: '🏭',
}

export default function PropertyCard({ property }) {
  const {
    id, title, type, price, surface, rooms, city, zipCode,
    sold, views, agencyName, bedrooms,
  } = property

  const formattedPrice = new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  }).format(price)

  return (
    <article style={styles.card} className="card" aria-label={`Bien immobilier : ${title}`}>
      {/* Image placeholder avec dégradé selon type */}
      <div style={{ ...styles.imgPlaceholder, ...getTypeGradient(type) }}>
        <span style={styles.typeIcon} aria-hidden="true">{TYPE_ICONS[type] || '🏠'}</span>
        {sold && (
          <span style={styles.soldBadge} role="status" aria-label="Bien vendu">
            Vendu
          </span>
        )}
        {!sold && (
          <span style={styles.typeBadge} aria-label={`Type : ${TYPE_LABELS[type]}`}>
            {TYPE_LABELS[type] || type}
          </span>
        )}
      </div>

      {/* Content */}
      <div style={styles.content}>
        <p style={styles.agency}>{agencyName || 'Y-Plaza'}</p>
        <h3 style={styles.title}>{title}</h3>

        <p style={styles.location}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {city}{zipCode ? ` (${zipCode})` : ''}
        </p>

        {/* Stats */}
        <div style={styles.stats} role="list" aria-label="Caractéristiques du bien">
          {surface && (
            <div style={styles.stat} role="listitem">
              <span style={styles.statValue}>{surface} m²</span>
            </div>
          )}
          {rooms && (
            <div style={styles.stat} role="listitem">
              <span style={styles.statValue}>{rooms} pièce{rooms > 1 ? 's' : ''}</span>
            </div>
          )}
          {bedrooms && (
            <div style={styles.stat} role="listitem">
              <span style={styles.statValue}>{bedrooms} ch.</span>
            </div>
          )}
          {views != null && (
            <div style={styles.stat} role="listitem">
              <span style={styles.statValue}>{views} vues</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.price} aria-label={`Prix : ${formattedPrice}`}>{formattedPrice}</p>
          <Link
            to={`/properties/${id}`}
            className="btn btn-primary"
            style={styles.cta}
            aria-label={`Voir le détail de ${title}`}
          >
            Voir le bien
          </Link>
        </div>
      </div>
    </article>
  )
}

function getTypeGradient(type) {
  const gradients = {
    APPARTEMENT: { background: 'linear-gradient(135deg, #C4BAA8 0%, #8B7355 100%)' },
    MAISON: { background: 'linear-gradient(135deg, #A8C4B8 0%, #5B8C7A 100%)' },
    VILLA: { background: 'linear-gradient(135deg, #C4A8B8 0%, #8C5B78 100%)' },
    STUDIO: { background: 'linear-gradient(135deg, #B8C4A8 0%, #7A8C5B 100%)' },
    BUREAU: { background: 'linear-gradient(135deg, #A8B8C4 0%, #5B788C 100%)' },
    LOCAL_COMMERCIAL: { background: 'linear-gradient(135deg, #C4C0A8 0%, #8C865B 100%)' },
    TERRAIN: { background: 'linear-gradient(135deg, #B8C4A0 0%, #6B8C4A 100%)' },
    ENTREPOT: { background: 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)' },
  }
  return gradients[type] || gradients.APPARTEMENT
}

const styles = {
  card: { display: 'flex', flexDirection: 'column' },
  imgPlaceholder: {
    height: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  typeIcon: { fontSize: 48, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' },
  soldBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    background: '#991b1b',
    color: '#fff',
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    background: 'rgba(255,255,255,0.9)',
    color: 'var(--color-charcoal)',
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
  content: { padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 },
  agency: { fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-accent)', margin: 0 },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 18,
    fontWeight: 600,
    color: 'var(--color-dark)',
    lineHeight: 1.3,
    margin: 0,
  },
  location: {
    display: 'flex', alignItems: 'center', gap: 4,
    fontSize: 13, color: 'var(--color-stone)', margin: 0,
  },
  stats: {
    display: 'flex', gap: 8, flexWrap: 'wrap', margin: '4px 0',
  },
  stat: {
    background: 'var(--color-cream)',
    borderRadius: 6,
    padding: '4px 10px',
  },
  statValue: { fontSize: 12, fontWeight: 500, color: 'var(--color-charcoal)' },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 12,
    borderTop: '1px solid var(--color-sand)',
  },
  price: {
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    fontWeight: 600,
    color: 'var(--color-charcoal)',
    margin: 0,
  },
  cta: { fontSize: 13, padding: '8px 16px' },
}
