import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyticsAPI } from '../services/api'
import { useAuthStore } from '../context/authStore'

export default function AnalyticsPage() {
  const { user, canAccessAnalytics } = useAuthStore()
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [priceByCity, setPriceByCity] = useState([])
  const [priceByType, setPriceByType] = useState([])
  const [topProperties, setTopProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !canAccessAnalytics()) { navigate('/'); return }
    Promise.all([
      analyticsAPI.getDashboard(),
      analyticsAPI.getPriceByCity(),
      analyticsAPI.getPriceByType(),
      analyticsAPI.getTopProperties(),
    ]).then(([db, city, type, top]) => {
      setDashboard(db.data.data)
      setPriceByCity(city.data.data || [])
      setPriceByType(type.data.data || [])
      setTopProperties(top.data.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [user])

  const fmt = (n) => n != null
    ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
    : '—'

  const fmtN = (n) => new Intl.NumberFormat('fr-FR').format(n)

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }} role="status">
      <div className="spinner" />
    </div>
  )

  const maxCityPrice = Math.max(...priceByCity.map(c => c.averagePrice || 0), 1)
  const maxTypePrice = Math.max(...priceByType.map(t => t.averagePrice || 0), 1)

  return (
    <main className="page" role="main">
      <div className="container">
        <header style={styles.header}>
          <h1 style={styles.title}>Analytiques</h1>
          <p style={styles.sub}>Tendances du marché immobilier Y-Plaza</p>
        </header>

        {/* KPIs */}
        {dashboard && (
          <section aria-label="Indicateurs généraux" style={{ marginBottom: 48 }}>
            <div style={styles.kpiGrid} role="list">
              {[
                { label: 'Biens actifs', value: fmtN(dashboard.totalProperties), icon: '🏠' },
                { label: 'Biens vendus', value: fmtN(dashboard.soldProperties), icon: '✅' },
                { label: 'CA total', value: fmt(dashboard.totalRevenue), icon: '💰' },
                { label: 'Utilisateurs', value: fmtN(dashboard.totalUsers), icon: '👤' },
              ].map(({ label, value, icon }) => (
                <div key={label} style={styles.kpi} role="listitem">
                  <span style={styles.kpiIcon} aria-hidden="true">{icon}</span>
                  <p style={styles.kpiValue}>{value}</p>
                  <p style={styles.kpiLabel}>{label}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div style={styles.charts}>
          {/* Prix par ville */}
          <section style={styles.chart} aria-label="Prix moyen par ville">
            <h2 style={styles.chartTitle}>Prix moyen par ville</h2>
            <p style={styles.chartSub}>Zones les plus intéressantes</p>
            {priceByCity.length === 0 ? (
              <p style={styles.empty}>Données insuffisantes</p>
            ) : (
              <div style={styles.bars} role="list">
                {priceByCity.slice(0, 8).map((item) => (
                  <div key={item.city} style={styles.barRow} role="listitem">
                    <span style={styles.barLabel}>{item.city}</span>
                    <div style={styles.barTrack} role="meter"
                      aria-label={`${item.city} : ${fmt(item.averagePrice)}`}
                      aria-valuenow={item.averagePrice}
                      aria-valuemin={0}
                      aria-valuemax={maxCityPrice}>
                      <div style={{ ...styles.bar, width: `${(item.averagePrice / maxCityPrice) * 100}%` }} />
                    </div>
                    <span style={styles.barVal}>{fmt(item.averagePrice)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Prix par type */}
          <section style={styles.chart} aria-label="Prix moyen par type de bien">
            <h2 style={styles.chartTitle}>Prix moyen par type</h2>
            <p style={styles.chartSub}>Segmentation du marché</p>
            {priceByType.length === 0 ? (
              <p style={styles.empty}>Données insuffisantes</p>
            ) : (
              <div style={styles.typeCards} role="list">
                {priceByType.map((item) => (
                  <div key={item.type} style={styles.typeCard} role="listitem"
                    aria-label={`${item.type} : ${fmt(item.averagePrice)} en moyenne`}>
                    <p style={styles.typeName}>{item.type}</p>
                    <p style={styles.typePrice}>{fmt(item.averagePrice)}</p>
                    <p style={styles.typeCount}>{item.count} bien{item.count > 1 ? 's' : ''}</p>
                    <div style={styles.typeBar}>
                      <div style={{ ...styles.typeBarFill, width: `${(item.averagePrice / maxTypePrice) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Top propriétés */}
        <section style={styles.topSection} aria-label="Biens les plus populaires">
          <h2 style={styles.chartTitle}>Biens les plus consultés</h2>
          {topProperties.length === 0 ? (
            <p style={styles.empty}>Aucune donnée disponible</p>
          ) : (
            <div style={styles.topTable} role="region" aria-label="Classement des biens">
              <table style={styles.table} aria-label="Top 10 biens par vues">
                <thead>
                  <tr>
                    <th style={styles.th} scope="col">#</th>
                    <th style={styles.th} scope="col">Titre</th>
                    <th style={styles.th} scope="col">Ville</th>
                    <th style={styles.th} scope="col">Prix</th>
                    <th style={styles.th} scope="col">Vues</th>
                  </tr>
                </thead>
                <tbody>
                  {topProperties.map((p, i) => (
                    <tr key={p.id} style={styles.tr}>
                      <td style={styles.td}>
                        <span style={{ ...styles.rank, ...(i < 3 ? styles.rankTop : {}) }}>
                          {i + 1}
                        </span>
                      </td>
                      <td style={{ ...styles.td, fontWeight: 500 }}>{p.title}</td>
                      <td style={styles.td}>{p.city}</td>
                      <td style={styles.td}>{fmt(p.price)}</td>
                      <td style={styles.td}>
                        <span style={styles.views}>{fmtN(p.views)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Note transactions */}
        {dashboard?.transactionsByStatus && (
          <section style={styles.txSection} aria-label="Répartition des transactions">
            <h2 style={styles.chartTitle}>Transactions par statut</h2>
            <div style={styles.txGrid} role="list">
              {Object.entries(dashboard.transactionsByStatus).map(([status, count]) => (
                <div key={status} style={styles.txCard} role="listitem">
                  <p style={styles.txCount}>{fmtN(count)}</p>
                  <p style={styles.txLabel}>{status.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

const styles = {
  header: { textAlign: 'center', marginBottom: 48 },
  title: { fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 600, color: 'var(--color-dark)', margin: '0 0 8px' },
  sub: { fontSize: 16, color: 'var(--color-stone)' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 },
  kpi: { background: 'var(--color-white)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: 4 },
  kpiIcon: { fontSize: 28 },
  kpiValue: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--color-dark)', margin: 0 },
  kpiLabel: { fontSize: 13, color: 'var(--color-stone)', margin: 0 },
  charts: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 24, marginBottom: 32 },
  chart: { background: 'var(--color-white)', borderRadius: 'var(--radius-xl)', padding: '28px', boxShadow: 'var(--shadow-card)' },
  chartTitle: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--color-dark)', margin: '0 0 4px' },
  chartSub: { fontSize: 13, color: 'var(--color-stone)', marginBottom: 20 },
  bars: { display: 'flex', flexDirection: 'column', gap: 12 },
  barRow: { display: 'grid', gridTemplateColumns: '100px 1fr 120px', alignItems: 'center', gap: 12 },
  barLabel: { fontSize: 13, fontWeight: 500, color: 'var(--color-charcoal)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  barTrack: { height: 8, background: 'var(--color-sand)', borderRadius: 4, overflow: 'hidden' },
  bar: { height: '100%', background: 'var(--color-accent)', borderRadius: 4, transition: 'width 600ms ease' },
  barVal: { fontSize: 12, fontWeight: 600, color: 'var(--color-charcoal)', textAlign: 'right' },
  typeCards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 },
  typeCard: { background: 'var(--color-cream)', borderRadius: 'var(--radius-md)', padding: '14px', display: 'flex', flexDirection: 'column', gap: 4 },
  typeName: { fontSize: 11, fontWeight: 600, color: 'var(--color-stone)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 },
  typePrice: { fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--color-dark)', margin: 0 },
  typeCount: { fontSize: 11, color: 'var(--color-stone)', margin: 0 },
  typeBar: { height: 4, background: 'var(--color-sand)', borderRadius: 2, overflow: 'hidden', marginTop: 4 },
  typeBarFill: { height: '100%', background: 'var(--color-accent)', borderRadius: 2 },
  topSection: { background: 'var(--color-white)', borderRadius: 'var(--radius-xl)', padding: '28px', boxShadow: 'var(--shadow-card)', marginBottom: 32 },
  topTable: { overflowX: 'auto', marginTop: 16 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '10px 16px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-stone)', textAlign: 'left', borderBottom: '1px solid var(--color-sand)' },
  tr: { borderBottom: '1px solid var(--color-sand)' },
  td: { padding: '12px 16px', fontSize: 14, color: 'var(--color-charcoal)' },
  rank: { display: 'inline-flex', width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--color-sand)', fontSize: 12, fontWeight: 600 },
  rankTop: { background: 'var(--color-accent)', color: '#fff' },
  views: { fontWeight: 600, color: 'var(--color-accent)' },
  txSection: { background: 'var(--color-white)', borderRadius: 'var(--radius-xl)', padding: '28px', boxShadow: 'var(--shadow-card)' },
  txGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginTop: 16 },
  txCard: { background: 'var(--color-cream)', borderRadius: 'var(--radius-md)', padding: '16px', textAlign: 'center' },
  txCount: { fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, color: 'var(--color-charcoal)', margin: '0 0 4px' },
  txLabel: { fontSize: 11, fontWeight: 600, color: 'var(--color-stone)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 },
  empty: { color: 'var(--color-stone)', textAlign: 'center', padding: '24px 0', fontSize: 14 },
}
