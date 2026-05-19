import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../context/authStore'
import { agenciesAPI } from '../../services/api'

const ROLES = [
  { value: 'CLIENT', label: 'Client' },
  { value: 'COMMERCIAL', label: 'Commercial (agence)' },
  { value: 'COMMUNICATION_MARKETING', label: 'Communication & Marketing' },
  { value: 'ADMINISTRATIF_RH_JURIDIQUE', label: 'Administratif / RH / Juridique' },
]

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    password: '', phone: '', role: 'CLIENT', agencyId: '',
  })
  const [agencies, setAgencies] = useState([])
  const { register, loading, error } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    agenciesAPI.getAll().then(r => setAgencies(r.data.data || [])).catch(() => {})
  }, [])

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...form }
    if (!payload.agencyId) delete payload.agencyId
    const result = await register(payload)
    if (result.success) navigate('/')
  }

  const needsAgency = ['COMMERCIAL', 'COMMUNICATION_MARKETING', 'ADMINISTRATIF_RH_JURIDIQUE'].includes(form.role)

  return (
    <main style={styles.page} role="main">
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <Link to="/" style={styles.logoLink} aria-label="Retour à l'accueil">
              <span style={styles.logoY}>Y</span>
              <span style={styles.logoPlaza}>Plaza</span>
            </Link>
            <h1 style={styles.title}>Créer un compte</h1>
            <p style={styles.sub}>
              Déjà inscrit ?{' '}
              <Link to="/login" style={styles.link}>Se connecter</Link>
            </p>
          </div>

          {error && (
            <div className="alert alert-error" role="alert" aria-live="polite">{error}</div>
          )}

          <form onSubmit={handleSubmit} noValidate style={styles.form}>
            <div style={styles.row}>
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">Prénom</label>
                <input id="firstName" type="text" className="form-input"
                  value={form.firstName} onChange={set('firstName')} required
                  aria-required="true" autoComplete="given-name" />
              </div>
              <div className="form-group">
                <label htmlFor="lastName" className="form-label">Nom</label>
                <input id="lastName" type="text" className="form-input"
                  value={form.lastName} onChange={set('lastName')} required
                  aria-required="true" autoComplete="family-name" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-email" className="form-label">Email</label>
              <input id="reg-email" type="email" className="form-input"
                value={form.email} onChange={set('email')} required
                aria-required="true" autoComplete="email" />
            </div>

            <div className="form-group">
              <label htmlFor="reg-password" className="form-label">
                Mot de passe <span style={{ color: 'var(--color-stone)', fontWeight: 400 }}>(min. 6 caractères)</span>
              </label>
              <input id="reg-password" type="password" className="form-input"
                value={form.password} onChange={set('password')} required minLength={6}
                aria-required="true" autoComplete="new-password" />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">Téléphone <span style={{ color: 'var(--color-stone)', fontWeight: 400 }}>(optionnel)</span></label>
              <input id="phone" type="tel" className="form-input"
                value={form.phone} onChange={set('phone')} autoComplete="tel" />
            </div>

            <div className="form-group">
              <label htmlFor="role" className="form-label">Rôle</label>
              <select id="role" className="form-select" value={form.role} onChange={set('role')} aria-required="true">
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            {needsAgency && (
              <div className="form-group">
                <label htmlFor="agency" className="form-label">Agence</label>
                <select id="agency" className="form-select" value={form.agencyId} onChange={set('agencyId')}>
                  <option value="">Sélectionner une agence</option>
                  {agencies.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} — {a.city}{a.headquarters ? ' (Siège)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-accent"
              style={styles.submitBtn}
              disabled={loading || !form.firstName || !form.lastName || !form.email || form.password.length < 6}
              aria-busy={loading}
            >
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' },
  container: { width: '100%', maxWidth: 520 },
  card: {
    background: 'var(--color-white)',
    borderRadius: 'var(--radius-xl)',
    padding: '40px',
    boxShadow: 'var(--shadow-elevated)',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  header: { display: 'flex', flexDirection: 'column', gap: 8 },
  logoLink: { display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 8 },
  logoY: { fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--color-accent)' },
  logoPlaza: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 300, color: 'var(--color-charcoal)', fontStyle: 'italic' },
  title: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--color-dark)', margin: 0 },
  sub: { fontSize: 14, color: 'var(--color-stone)', margin: 0 },
  link: { color: 'var(--color-accent)', fontWeight: 500 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  submitBtn: { width: '100%', justifyContent: 'center', padding: 14, fontSize: 15, marginTop: 8 },
}
