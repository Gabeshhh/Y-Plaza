import { useState, useEffect } from 'react'
import { agenciesAPI } from '../../services/api'

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    agenciesAPI.getAll()
      .then(r => setAgencies(r.data.data || []))
      .finally(() => setLoading(false))
  }, [])

  const headquarters = agencies.find(a => a.headquarters)
  const branches = agencies.filter(a => !a.headquarters)

  return (
    <main className="page" role="main">
      <div className="container">
        <header style={styles.header}>
          <h1 style={styles.title}>Nos agences</h1>
          <p style={styles.sub}>1 siège social à Aix-en-Provence et 12 agences en France</p>
        </header>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }} role="status" aria-label="Chargement">
            <div className="spinner" />
          </div>
        ) : (
          <>
            {/* Siège */}
            {headquarters && (
              <section style={styles.section} aria-label="Siège social">
                <h2 style={styles.sectionTitle}>Siège social</h2>
                <div style={styles.hqCard}>
                  <div style={styles.hqBadge}>Siège social</div>
                  <h3 style={styles.hqName}>{headquarters.name}</h3>
                  <p style={styles.hqCity}>{headquarters.city}</p>
                  {headquarters.address && (
                    <address style={styles.address}>
                      {headquarters.address}{headquarters.zipCode ? `, ${headquarters.zipCode}` : ''}
                    </address>
                  )}
                  <div style={styles.hqContacts}>
                    {headquarters.phone && (
                      <a href={`tel:${headquarters.phone}`} style={styles.contact}>
                        📞 {headquarters.phone}
                      </a>
                    )}
                    {headquarters.email && (
                      <a href={`mailto:${headquarters.email}`} style={styles.contact}>
                        ✉️ {headquarters.email}
                      </a>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Agences */}
            <section aria-label="Nos agences régionales">
              <h2 style={styles.sectionTitle}>Agences régionales</h2>
              <div style={styles.grid} role="list">
                {branches.map(agency => (
                  <article key={agency.id} style={styles.card} role="listitem" aria-label={`Agence ${agency.name}`}>
                    <div style={styles.cardIcon} aria-hidden="true">🏢</div>
                    <h3 style={styles.cardName}>{agency.name}</h3>
                    <p style={styles.cardCity}>{agency.city}{agency.zipCode ? ` (${agency.zipCode})` : ''}</p>
                    {agency.phone && (
                      <a href={`tel:${agency.phone}`} style={styles.cardPhone} aria-label={`Téléphone : ${agency.phone}`}>
                        {agency.phone}
                      </a>
                    )}
                    {agency.email && (
                      <a href={`mailto:${agency.email}`} style={styles.cardEmail} aria-label={`Email : ${agency.email}`}>
                        {agency.email}
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  )
}

const styles = {
  header: { textAlign: 'center', marginBottom: 56 },
  title: { fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 600, color: 'var(--color-dark)', margin: '0 0 8px' },
  sub: { fontSize: 16, color: 'var(--color-stone)' },
  section: { marginBottom: 56 },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--color-dark)', marginBottom: 24 },
  hqCard: {
    background: 'var(--color-dark)', color: 'var(--color-cream)',
    borderRadius: 'var(--radius-xl)', padding: '40px 48px',
    display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 600,
  },
  hqBadge: { fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent)' },
  hqName: { fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, color: 'var(--color-cream)', margin: 0 },
  hqCity: { fontSize: 18, color: 'var(--color-stone)', margin: 0 },
  address: { fontSize: 14, color: 'var(--color-stone)', fontStyle: 'normal' },
  hqContacts: { display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 8 },
  contact: { fontSize: 14, color: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', gap: 6 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 },
  card: {
    background: 'var(--color-white)', borderRadius: 'var(--radius-lg)',
    padding: '24px', boxShadow: 'var(--shadow-card)',
    display: 'flex', flexDirection: 'column', gap: 8,
    transition: 'transform 200ms ease, box-shadow 200ms ease',
  },
  cardIcon: { fontSize: 28, marginBottom: 4 },
  cardName: { fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--color-dark)', margin: 0 },
  cardCity: { fontSize: 14, color: 'var(--color-stone)', margin: 0 },
  cardPhone: { fontSize: 13, color: 'var(--color-charcoal)', display: 'block' },
  cardEmail: { fontSize: 12, color: 'var(--color-accent)', display: 'block', wordBreak: 'break-all' },
}
