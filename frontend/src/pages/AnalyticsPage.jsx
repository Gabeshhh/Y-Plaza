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
  const [revenueByAgency, setRevenueByAgency] = useState([])
  const [predictions, setPredictions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!user || !canAccessAnalytics()) { navigate('/'); return }
    Promise.all([
      analyticsAPI.getDashboard(),
      analyticsAPI.getPriceByCity(),
      analyticsAPI.getPriceByType(),
      analyticsAPI.getTopProperties(),
      analyticsAPI.getRevenueByAgency(),
      analyticsAPI.getPredictions(),
    ]).then(([db, city, type, top, agency, pred]) => {
      setDashboard(db.data.data)
      setPriceByCity(city.data.data || [])
      setPriceByType(type.data.data || [])
      setTopProperties(top.data.data || [])
      setRevenueByAgency(agency.data.data || [])
      setPredictions(pred.data.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [user])

  const fmt = (n) => n != null
    ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
    : '—'
  const fmtN = (n) => new Intl.NumberFormat('fr-FR').format(n ?? 0)

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }} role="status" aria-label="Chargement">
      <div className="spinner" />
    </div>
  )

  const maxCityPrice = Math.max(...priceByCity.map(c => c.averagePrice || 0), 1)
  const maxTypePrice = Math.max(...priceByType.map(t => t.averagePrice || 0), 1)
  const maxAgencyRevenue = Math.max(...revenueByAgency.map(a => Number(a.totalRevenue) || 0), 1)

  const tabs = [
    { id: 'overview', label: 'Vue générale' },
    { id: 'market', label: 'Marché' },
    { id: 'predictions', label: '🔮 Prédictions' },
    { id: 'agencies', label: 'Agences' },
  ]

  return (
    <main className="page" role="main">
      <div className="container">
        <header style={styles.header}>
          <h1 style={styles.title}>Analytiques</h1>
          <p style={styles.sub}>Tendances du marché immobilier Y-Plaza · Données en temps réel</p>
        </header>

        {/* KPIs globaux */}
        {dashboard && (
          <section aria-label="Indicateurs généraux" style={{ marginBottom: 32 }}>
            <div style={styles.kpiGrid} role="list">
              {[
                { label: 'Biens actifs', value: fmtN(dashboard.totalProperties), icon: '🏠', color: '#8B7355' },
                { label: 'Biens vendus', value: fmtN(dashboard.soldProperties), icon: '✅', color: '#10b981' },
                { label: 'CA total', value: fmt(dashboard.totalRevenue), icon: '💰', color: '#f59e0b' },
                { label: 'Utilisateurs', value: fmtN(dashboard.totalUsers), icon: '👤', color: '#3b82f6' },
              ].map(({ label, value, icon, color }) => (
                <div key={label} style={styles.kpi} role="listitem">
                  <span style={{ ...styles.kpiIcon, color }} aria-hidden="true">{icon}</span>
                  <p style={{ ...styles.kpiValue, color }}>{value}</p>
                  <p style={styles.kpiLabel}>{label}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tabs */}
        <div style={styles.tabs} role="tablist" aria-label="Sections analytiques">
          {tabs.map(tab => (
            <button key={tab.id} role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ ...styles.tab, ...(activeTab === tab.id ? styles.tabActive : {}) }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* === VUE GÉNÉRALE === */}
        {activeTab === 'overview' && (
          <div role="tabpanel">
            <div style={styles.charts}>
              <section style={styles.chart} aria-label="Prix moyen par ville">
                <h2 style={styles.chartTitle}>Prix moyen par ville</h2>
                <p style={styles.chartSub}>Zones les plus actives du marché</p>
                <div style={styles.bars} role="list">
                  {priceByCity.slice(0, 8).map((item) => (
                    <div key={item.city} style={styles.barRow} role="listitem">
                      <span style={styles.barLabel}>{item.city}</span>
                      <div style={styles.barTrack} role="meter"
                        aria-label={`${item.city} : ${fmt(item.averagePrice)}`}
                        aria-valuenow={item.averagePrice} aria-valuemin={0} aria-valuemax={maxCityPrice}>
                        <div style={{ ...styles.bar, width: `${(item.averagePrice / maxCityPrice) * 100}%` }} />
                      </div>
                      <span style={styles.barVal}>{fmt(item.averagePrice)}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section style={styles.chart} aria-label="Prix moyen par type de bien">
                <h2 style={styles.chartTitle}>Prix moyen par type</h2>
                <p style={styles.chartSub}>Segmentation du marché</p>
                <div style={styles.typeCards} role="list">
                  {priceByType.map((item) => (
                    <div key={item.type} style={styles.typeCard} role="listitem">
                      <p style={styles.typeName}>{item.type}</p>
                      <p style={styles.typePrice}>{fmt(item.averagePrice)}</p>
                      <p style={styles.typeCount}>{item.count} bien{item.count > 1 ? 's' : ''}</p>
                      <div style={styles.typeBar}>
                        <div style={{ ...styles.typeBarFill, width: `${(item.averagePrice / maxTypePrice) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section style={styles.card} aria-label="Biens les plus consultés">
              <h2 style={styles.chartTitle}>Biens les plus consultés</h2>
              <div style={{ overflowX: 'auto', marginTop: 16 }}>
                <table style={styles.table} aria-label="Top 10 biens par vues">
                  <thead>
                    <tr>
                      {['#', 'Titre', 'Ville', 'Prix', 'Vues'].map(h => (
                        <th key={h} style={styles.th} scope="col">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topProperties.map((p, i) => (
                      <tr key={p.id} style={styles.tr}>
                        <td style={styles.td}>
                          <span style={{ ...styles.rank, ...(i < 3 ? styles.rankTop : {}) }}>{i + 1}</span>
                        </td>
                        <td style={{ ...styles.td, fontWeight: 500 }}>{p.title}</td>
                        <td style={styles.td}>{p.city}</td>
                        <td style={styles.td}>{fmt(p.price)}</td>
                        <td style={styles.td}><span style={styles.viewsBadge}>{fmtN(p.views)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* === MARCHÉ === */}
        {activeTab === 'market' && (
          <div role="tabpanel">
            {dashboard?.transactionsByStatus && (
              <section style={styles.card} aria-label="Transactions par statut">
                <h2 style={styles.chartTitle}>Transactions par statut</h2>
                <p style={styles.chartSub}>Répartition du pipeline de vente</p>
                <div style={styles.txGrid} role="list">
                  {[
                    { key: 'EN_ATTENTE', label: 'En attente', color: '#f59e0b' },
                    { key: 'EN_COURS', label: 'En cours', color: '#3b82f6' },
                    { key: 'COMPROMIS_SIGNE', label: 'Compromis signé', color: '#8b5cf6' },
                    { key: 'ACTE_DEFINITIF', label: 'Acte définitif', color: '#10b981' },
                    { key: 'ANNULEE', label: 'Annulées', color: '#ef4444' },
                  ].map(({ key, label, color }) => (
                    <div key={key} style={{ ...styles.txCard, borderTop: `3px solid ${color}` }} role="listitem">
                      <p style={{ ...styles.txCount, color }}>{fmtN(dashboard.transactionsByStatus[key] || 0)}</p>
                      <p style={styles.txLabel}>{label}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
            <div style={styles.charts}>
              <section style={styles.chart} aria-label="Taux de vente par ville">
                <h2 style={styles.chartTitle}>Activité par ville</h2>
                <p style={styles.chartSub}>Nombre de biens disponibles</p>
                <div style={styles.bars} role="list">
                  {priceByCity.slice(0, 8).map((item) => {
                    const maxCount = Math.max(...priceByCity.map(c => c.count || 0), 1)
                    return (
                      <div key={item.city} style={styles.barRow} role="listitem">
                        <span style={styles.barLabel}>{item.city}</span>
                        <div style={styles.barTrack}>
                          <div style={{ ...styles.bar, width: `${(item.count / maxCount) * 100}%`, background: '#3b82f6' }} />
                        </div>
                        <span style={styles.barVal}>{item.count} bien{item.count > 1 ? 's' : ''}</span>
                      </div>
                    )
                  })}
                </div>
              </section>
              <section style={styles.chart} aria-label="Part de marché par type">
                <h2 style={styles.chartTitle}>Part de marché par type</h2>
                <p style={styles.chartSub}>Distribution du catalogue</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {priceByType.map((item) => {
                    const total = priceByType.reduce((s, t) => s + (t.count || 0), 0)
                    const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
                    return (
                      <div key={item.type}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{item.type}</span>
                          <span style={{ fontSize: 13, color: 'var(--color-stone)' }}>{pct}% ({item.count})</span>
                        </div>
                        <div style={styles.barTrack}>
                          <div style={{ ...styles.bar, width: `${pct}%`, background: '#8b5cf6' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* === PRÉDICTIONS === */}
        {activeTab === 'predictions' && predictions && (
          <div role="tabpanel">
            {/* Aperçu du marché */}
            {predictions.marketOverview && (
              <section style={{ ...styles.card, marginBottom: 24 }} aria-label="Aperçu du marché">
                <h2 style={styles.chartTitle}>Aperçu du marché</h2>
                <p style={styles.chartSub}>Indicateurs clés basés sur l'activité en cours</p>
                <div style={styles.marketGrid}>
                  <div style={{ ...styles.marketCard, borderLeft: `4px solid ${predictions.marketOverview.trendColor}` }}>
                    <p style={{ fontSize: 32, margin: 0 }}>{predictions.marketOverview.trendIcon}</p>
                    <p style={{ ...styles.marketVal, color: predictions.marketOverview.trendColor }}>
                      {predictions.marketOverview.marketTrend}
                    </p>
                    <p style={styles.marketLabel}>Tendance actuelle</p>
                  </div>
                  <div style={styles.marketCard}>
                    <p style={styles.marketBig}>{predictions.marketOverview.saleRate}%</p>
                    <p style={styles.marketVal}>Taux de vente</p>
                    <p style={styles.marketLabel}>Biens vendus / actifs</p>
                  </div>
                  <div style={styles.marketCard}>
                    <p style={styles.marketBig}>{predictions.marketOverview.estimatedMonthsToSell}</p>
                    <p style={styles.marketVal}>mois estimés</p>
                    <p style={styles.marketLabel}>Durée moyenne de vente</p>
                  </div>
                  <div style={styles.marketCard}>
                    <p style={styles.marketBig}>{predictions.marketOverview.marketHealth}</p>
                    <p style={styles.marketVal}>Santé du marché</p>
                    <p style={styles.marketLabel}>{predictions.marketOverview.totalActive} biens actifs</p>
                  </div>
                </div>
              </section>
            )}

            {/* Insights transactions */}
            {predictions.transactionInsights && (
              <section style={{ ...styles.card, marginBottom: 24 }} aria-label="Performance des transactions">
                <h2 style={styles.chartTitle}>Performance des transactions</h2>
                <p style={styles.chartSub}>Taux de conversion du pipeline de vente</p>
                <div style={styles.insightGrid}>
                  <div style={styles.insightCard}>
                    <p style={styles.insightNum}>{fmtN(predictions.transactionInsights.total)}</p>
                    <p style={styles.insightLabel}>Transactions totales</p>
                  </div>
                  <div style={styles.insightCard}>
                    <p style={{ ...styles.insightNum, color: '#10b981' }}>{fmtN(predictions.transactionInsights.completed)}</p>
                    <p style={styles.insightLabel}>Actes définitifs</p>
                  </div>
                  <div style={{ ...styles.insightCard, gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <p style={styles.insightLabel}>Taux de conversion</p>
                      <span style={{ fontWeight: 600, color: '#8B7355' }}>{predictions.transactionInsights.conversionLabel}</span>
                    </div>
                    <div style={{ ...styles.barTrack, height: 12 }}>
                      <div style={{ ...styles.bar, width: `${predictions.transactionInsights.conversionRate}%`, background: '#10b981' }} />
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--color-stone)', marginTop: 6 }}>
                      {predictions.transactionInsights.conversionRate}% des demandes aboutissent à une vente
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Zones d'investissement recommandées */}
            {predictions.topInvestmentZones?.length > 0 && (
              <section style={{ ...styles.card, marginBottom: 24 }} aria-label="Zones d'investissement recommandées">
                <h2 style={styles.chartTitle}>Zones d'investissement recommandées</h2>
                <p style={styles.chartSub}>Score calculé selon l'activité du marché et le niveau de prix</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                  {predictions.topInvestmentZones.map((zone, i) => (
                    <div key={zone.city} style={styles.zoneRow}>
                      <div style={{ ...styles.zoneRank, background: i === 0 ? '#8B7355' : i === 1 ? '#A0A0A0' : '#CD7F32' }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontWeight: 600, fontSize: 15 }}>{zone.city}</span>
                          <span style={{
                            padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                            background: zone.potentialScore >= 70 ? '#d1fae5' : zone.potentialScore >= 50 ? '#fef3c7' : '#f3f4f6',
                            color: zone.potentialScore >= 70 ? '#065f46' : zone.potentialScore >= 50 ? '#92400e' : '#374151',
                          }}>
                            {zone.potentialLabel}
                          </span>
                        </div>
                        <div style={styles.barTrack}>
                          <div style={{ ...styles.bar, width: `${zone.potentialScore}%`, background: zone.potentialScore >= 70 ? '#10b981' : zone.potentialScore >= 50 ? '#f59e0b' : '#8B7355' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                          <span style={{ fontSize: 12, color: 'var(--color-stone)' }}>{zone.recommendation}</span>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>Score {zone.potentialScore}/100</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: 120 }}>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>{fmt(zone.averagePrice)}</p>
                        <p style={{ fontSize: 11, color: 'var(--color-stone)' }}>{zone.count} biens</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Demande par type */}
            {predictions.demandByType?.length > 0 && (
              <section style={styles.card} aria-label="Analyse de la demande par type">
                <h2 style={styles.chartTitle}>Analyse de la demande par type</h2>
                <p style={styles.chartSub}>Prévision de la demande basée sur l'activité actuelle</p>
                <div style={styles.demandGrid}>
                  {predictions.demandByType.map((item) => (
                    <div key={item.type} style={styles.demandCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <p style={styles.demandType}>{item.type}</p>
                        <span style={{ fontSize: 18 }}>{item.trend}</span>
                      </div>
                      <p style={styles.demandPrice}>{fmt(item.averagePrice)}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                          background: item.demandLabel === 'Forte demande' ? '#d1fae5' : item.demandLabel === 'Demande modérée' ? '#fef3c7' : '#f3f4f6',
                          color: item.demandLabel === 'Forte demande' ? '#065f46' : item.demandLabel === 'Demande modérée' ? '#92400e' : '#6b7280',
                        }}>
                          {item.demandLabel}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--color-stone)' }}>{item.marketShare}% du marché</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* === AGENCES === */}
        {activeTab === 'agencies' && (
          <div role="tabpanel">
            <section style={styles.card} aria-label="Chiffre d'affaires par agence">
              <h2 style={styles.chartTitle}>Chiffre d'affaires par agence</h2>
              <p style={styles.chartSub}>Transactions finalisées (Acte définitif)</p>
              {revenueByAgency.length === 0 ? (
                <p style={{ color: 'var(--color-stone)', textAlign: 'center', padding: '32px 0' }}>
                  Aucune vente finalisée pour le moment
                </p>
              ) : (
                <div style={{ ...styles.bars, marginTop: 20 }} role="list">
                  {revenueByAgency.map((agency, i) => (
                    <div key={agency.agencyId || i} style={styles.barRow} role="listitem">
                      <span style={styles.barLabel}>Agence {agency.agencyId}</span>
                      <div style={styles.barTrack} role="meter"
                        aria-label={`Agence ${agency.agencyId} : ${fmt(agency.totalRevenue)}`}>
                        <div style={{ ...styles.bar, width: `${(Number(agency.totalRevenue) / maxAgencyRevenue) * 100}%`, background: '#8b5cf6' }} />
                      </div>
                      <span style={styles.barVal}>{fmt(agency.totalRevenue)} ({agency.count} vente{agency.count > 1 ? 's' : ''})</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  )
}

const styles = {
  header: { textAlign: 'center', marginBottom: 32 },
  title: { fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 600, color: 'var(--color-dark)', margin: '0 0 8px' },
  sub: { fontSize: 15, color: 'var(--color-stone)' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 },
  kpi: { background: 'var(--color-white)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: 4 },
  kpiIcon: { fontSize: 28 },
  kpiValue: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, margin: 0 },
  kpiLabel: { fontSize: 13, color: 'var(--color-stone)', margin: 0 },
  tabs: { display: 'flex', gap: 4, marginBottom: 24, borderBottom: '2px solid var(--color-sand)', paddingBottom: 0, overflowX: 'auto' },
  tab: { padding: '10px 20px', fontSize: 14, fontWeight: 500, background: 'none', border: 'none', color: 'var(--color-stone)', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -2, whiteSpace: 'nowrap' },
  tabActive: { color: 'var(--color-charcoal)', borderBottomColor: 'var(--color-charcoal)' },
  charts: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 24, marginBottom: 24 },
  chart: { background: 'var(--color-white)', borderRadius: 'var(--radius-xl)', padding: '28px', boxShadow: 'var(--shadow-card)' },
  card: { background: 'var(--color-white)', borderRadius: 'var(--radius-xl)', padding: '28px', boxShadow: 'var(--shadow-card)', marginBottom: 24 },
  chartTitle: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--color-dark)', margin: '0 0 4px' },
  chartSub: { fontSize: 13, color: 'var(--color-stone)', marginBottom: 20 },
  bars: { display: 'flex', flexDirection: 'column', gap: 12 },
  barRow: { display: 'grid', gridTemplateColumns: '110px 1fr 140px', alignItems: 'center', gap: 12 },
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
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '10px 16px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-stone)', textAlign: 'left', borderBottom: '1px solid var(--color-sand)' },
  tr: { borderBottom: '1px solid var(--color-sand)' },
  td: { padding: '12px 16px', fontSize: 14, color: 'var(--color-charcoal)' },
  rank: { display: 'inline-flex', width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--color-sand)', fontSize: 12, fontWeight: 600 },
  rankTop: { background: 'var(--color-accent)', color: '#fff' },
  viewsBadge: { fontWeight: 600, color: 'var(--color-accent)' },
  txGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginTop: 16 },
  txCard: { background: 'var(--color-cream)', borderRadius: 'var(--radius-md)', padding: '16px', textAlign: 'center' },
  txCount: { fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, margin: '0 0 4px' },
  txLabel: { fontSize: 11, fontWeight: 600, color: 'var(--color-stone)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 },
  marketGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginTop: 16 },
  marketCard: { background: 'var(--color-cream)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: 4 },
  marketBig: { fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, color: 'var(--color-dark)', margin: 0 },
  marketVal: { fontSize: 15, fontWeight: 600, color: 'var(--color-charcoal)', margin: 0 },
  marketLabel: { fontSize: 12, color: 'var(--color-stone)', margin: 0 },
  insightGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 },
  insightCard: { background: 'var(--color-cream)', borderRadius: 'var(--radius-lg)', padding: '20px' },
  insightNum: { fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 600, color: 'var(--color-dark)', margin: '0 0 4px' },
  insightLabel: { fontSize: 13, color: 'var(--color-stone)', margin: 0 },
  zoneRow: { display: 'flex', alignItems: 'center', gap: 16, padding: '16px', background: 'var(--color-cream)', borderRadius: 'var(--radius-lg)' },
  zoneRank: { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 },
  demandGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginTop: 16 },
  demandCard: { background: 'var(--color-cream)', borderRadius: 'var(--radius-lg)', padding: '16px' },
  demandType: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-stone)', margin: '0 0 4px' },
  demandPrice: { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--color-dark)', margin: 0 },
  empty: { color: 'var(--color-stone)', textAlign: 'center', padding: '24px 0', fontSize: 14 },
}
