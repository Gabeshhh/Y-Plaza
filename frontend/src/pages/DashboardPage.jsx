import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { propertiesAPI, transactionsAPI } from '../services/api'
import { useAuthStore } from '../context/authStore'
import PropertyCard from '../components/property/PropertyCard'

export default function DashboardPage() {
  const { user, canManageProperties } = useAuthStore()
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [txStats, setTxStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('properties')
  const [createForm, setCreateForm] = useState(null)

  useEffect(() => {
    if (!user || !canManageProperties()) {
      navigate('/')
      return
    }
    Promise.all([
      propertiesAPI.search({ page: 0, size: 20 }),
      transactionsAPI.getStats(),
    ]).then(([propRes, txRes]) => {
      setProperties(propRes.data.data?.content || [])
      setTxStats(txRes.data.data)
    }).finally(() => setLoading(false))
  }, [user])

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce bien ?')) return
    await propertiesAPI.delete(id)
    setProperties(prev => prev.filter(p => p.id !== id))
  }

  const fmt = (n) => n != null
    ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
    : '—'

  const txByStatus = txStats?.byStatus || {}

  return (
    <main className="page" role="main">
      <div className="container">
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Dashboard</h1>
            <p style={styles.sub}>Bienvenue, <strong>{user?.fullName}</strong> — {user?.role}</p>
          </div>
          <Link to="/properties/new" className="btn btn-accent" aria-label="Ajouter un nouveau bien">
            + Nouveau bien
          </Link>
        </header>

        {/* KPI Cards */}
        <div style={styles.kpiGrid} role="list" aria-label="Indicateurs clés">
          {[
            { label: 'Biens actifs', value: properties.filter(p => p.active && !p.sold).length, icon: '🏠' },
            { label: 'Biens vendus', value: properties.filter(p => p.sold).length, icon: '✅' },
            { label: 'CA total', value: fmt(txStats?.totalRevenue), icon: '💰' },
            { label: 'Tx en attente', value: txByStatus['EN_ATTENTE'] || 0, icon: '⏳' },
          ].map(({ label, value, icon }) => (
            <div key={label} style={styles.kpi} role="listitem">
              <span style={styles.kpiIcon} aria-hidden="true">{icon}</span>
              <p style={styles.kpiValue} aria-label={`${label} : ${value}`}>{value}</p>
              <p style={styles.kpiLabel}>{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={styles.tabs} role="tablist" aria-label="Sections du dashboard">
          {[
            { id: 'properties', label: 'Mes biens' },
            { id: 'transactions', label: 'Transactions' },
          ].map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tab-panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ ...styles.tab, ...(activeTab === tab.id ? styles.tabActive : {}) }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab panel - Properties */}
        {activeTab === 'properties' && (
          <div id="tab-panel-properties" role="tabpanel" aria-label="Liste de mes biens">
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }} role="status">
                <div className="spinner" />
              </div>
            ) : properties.length === 0 ? (
              <div style={styles.empty}>
                <p>Aucun bien pour le moment.</p>
                <Link to="/properties/new" className="btn btn-accent" style={{ marginTop: 16 }}>
                  Créer votre premier bien
                </Link>
              </div>
            ) : (
              <div style={styles.tableWrapper} role="region" aria-label="Tableau des biens">
                <table style={styles.table} aria-label="Liste des biens immobiliers">
                  <thead>
                    <tr>
                      <th style={styles.th} scope="col">Bien</th>
                      <th style={styles.th} scope="col">Type</th>
                      <th style={styles.th} scope="col">Ville</th>
                      <th style={styles.th} scope="col">Prix</th>
                      <th style={styles.th} scope="col">Statut</th>
                      <th style={styles.th} scope="col">Vues</th>
                      <th style={styles.th} scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map(p => (
                      <tr key={p.id} style={styles.tr}>
                        <td style={styles.td}>
                          <Link to={`/properties/${p.id}`} style={styles.propLink}>{p.title}</Link>
                        </td>
                        <td style={styles.td}>{p.type}</td>
                        <td style={styles.td}>{p.city}</td>
                        <td style={styles.td}>{fmt(p.price)}</td>
                        <td style={styles.td}>
                          <span className={`badge ${p.sold ? 'badge-sold' : p.active ? 'badge-active' : 'badge-pending'}`}>
                            {p.sold ? 'Vendu' : p.active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td style={styles.td}>{p.views || 0}</td>
                        <td style={styles.td}>
                          <div style={styles.actions}>
                            <Link to={`/properties/${p.id}`} className="btn btn-ghost" style={styles.actionBtn}
                              aria-label={`Voir ${p.title}`}>
                              👁
                            </Link>
                            <button onClick={() => handleDelete(p.id)} className="btn btn-ghost"
                              style={{ ...styles.actionBtn, color: 'var(--color-error)' }}
                              aria-label={`Supprimer ${p.title}`}>
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab panel - Transactions */}
        {activeTab === 'transactions' && (
          <div id="tab-panel-transactions" role="tabpanel" aria-label="Statuts des transactions">
            <div style={styles.txGrid}>
              {[
                { key: 'EN_ATTENTE', label: 'En attente', color: '#f59e0b' },
                { key: 'EN_COURS', label: 'En cours', color: '#3b82f6' },
                { key: 'COMPROMIS_SIGNE', label: 'Compromis signé', color: '#8b5cf6' },
                { key: 'ACTE_DEFINITIF', label: 'Acte définitif', color: '#10b981' },
                { key: 'ANNULEE', label: 'Annulées', color: '#ef4444' },
              ].map(({ key, label, color }) => (
                <div key={key} style={styles.txCard} aria-label={`${label} : ${txByStatus[key] || 0}`}>
                  <p style={{ ...styles.txNum, color }}>{txByStatus[key] || 0}</p>
                  <p style={styles.txLabel}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 },
  title: { fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 600, color: 'var(--color-dark)', margin: '0 0 4px' },
  sub: { fontSize: 14, color: 'var(--color-stone)', margin: 0 },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 40 },
  kpi: { background: 'var(--color-white)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: 4 },
  kpiIcon: { fontSize: 28 },
  kpiValue: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--color-dark)', margin: 0 },
  kpiLabel: { fontSize: 13, color: 'var(--color-stone)', margin: 0 },
  tabs: { display: 'flex', gap: 4, marginBottom: 24, borderBottom: '2px solid var(--color-sand)', paddingBottom: 0 },
  tab: { padding: '10px 20px', fontSize: 14, fontWeight: 500, background: 'none', border: 'none', color: 'var(--color-stone)', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -2 },
  tabActive: { color: 'var(--color-charcoal)', borderBottomColor: 'var(--color-charcoal)' },
  tableWrapper: { overflowX: 'auto', background: 'var(--color-white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-stone)', textAlign: 'left', borderBottom: '1px solid var(--color-sand)' },
  tr: { borderBottom: '1px solid var(--color-sand)' },
  td: { padding: '14px 16px', fontSize: 14, color: 'var(--color-charcoal)', verticalAlign: 'middle' },
  propLink: { fontWeight: 500, color: 'var(--color-accent)' },
  actions: { display: 'flex', gap: 4 },
  actionBtn: { padding: '6px 8px', fontSize: 16 },
  empty: { textAlign: 'center', padding: '60px 0', color: 'var(--color-stone)' },
  txGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 },
  txCard: { background: 'var(--color-white)', borderRadius: 'var(--radius-lg)', padding: '24px 20px', boxShadow: 'var(--shadow-card)', textAlign: 'center' },
  txNum: { fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 600, margin: '0 0 4px' },
  txLabel: { fontSize: 13, color: 'var(--color-stone)', margin: 0 },
}
