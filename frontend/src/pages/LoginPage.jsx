import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../context/authStore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading, error } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(email, password)
    if (result.success) {
      navigate(from, { replace: true })
    }
  }

  const fillDemo = (role) => {
    const accounts = {
      admin: { email: 'admin@yplaza.fr', password: 'Admin123!' },
      commercial: { email: 'commercial@yplaza.fr', password: 'Admin123!' },
      client: { email: 'client@yplaza.fr', password: 'Admin123!' },
      it: { email: 'it@yplaza.fr', password: 'Admin123!' },
    }
    setEmail(accounts[role].email)
    setPassword(accounts[role].password)
  }

  return (
    <main style={styles.page} role="main">
      <div style={styles.container}>
        {/* Left — branding */}
        <div style={styles.left} aria-hidden="true">
          <div style={styles.leftContent}>
            <div style={styles.logoLarge}>
              <span style={styles.logoY}>Y</span>
              <span style={styles.logoPlaza}>Plaza</span>
            </div>
            <h1 style={styles.headline}>
              L'immobilier,<br />
              <em>autrement.</em>
            </h1>
            <p style={styles.subHeadline}>
              Achetez, vendez et gérez vos biens<br />
              avec le réseau Y-Plaza.
            </p>
            <div style={styles.stats}>
              {[['13', 'Agences'], ['500+', 'Biens'], ['10K+', 'Clients']].map(([n, l]) => (
                <div key={l} style={styles.stat}>
                  <span style={styles.statNum}>{n}</span>
                  <span style={styles.statLabel}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div style={styles.right}>
          <div style={styles.formWrapper}>
            <h2 style={styles.formTitle}>Connexion</h2>
            <p style={styles.formSub}>
              Pas encore de compte ?{' '}
              <Link to="/register" style={styles.link}>S'inscrire</Link>
            </p>

            {error && (
              <div className="alert alert-error" role="alert" aria-live="polite">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate style={styles.form}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="vous@exemple.fr"
                  required
                  autoComplete="email"
                  aria-required="true"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Mot de passe</label>
                <div style={styles.passwordWrapper}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    aria-required="true"
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    style={styles.eyeBtn}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-accent"
                style={styles.submitBtn}
                disabled={loading || !email || !password}
                aria-busy={loading}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            {/* Comptes démo */}
            <div style={styles.demoSection} role="region" aria-label="Comptes de démonstration">
              <p style={styles.demoTitle}>Comptes de démo :</p>
              <div style={styles.demoGrid}>
                {[
                  { role: 'admin', label: 'Direction', color: '#C24A4A' },
                  { role: 'commercial', label: 'Commercial', color: '#4A8C5C' },
                  { role: 'client', label: 'Client', color: '#4A6CB0' },
                  { role: 'it', label: 'IT', color: '#8B4E32' },
                ].map(({ role, label, color }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => fillDemo(role)}
                    style={{ ...styles.demoBtn, borderColor: color, color }}
                    aria-label={`Remplir avec le compte ${label}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

const styles = {
  page: { minHeight: '100vh', display: 'flex' },
  container: { display: 'flex', width: '100%' },
  left: {
    flex: 1,
    background: 'var(--color-dark)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    minHeight: '100vh',
  },
  leftContent: { maxWidth: 400 },
  logoLarge: { display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 40 },
  logoY: { fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700, color: 'var(--color-accent)' },
  logoPlaza: { fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 300, color: 'var(--color-cream)', fontStyle: 'italic' },
  headline: { fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 300, color: 'var(--color-cream)', lineHeight: 1.15, marginBottom: 16 },
  subHeadline: { fontSize: 16, color: 'var(--color-stone)', lineHeight: 1.7, marginBottom: 48 },
  stats: { display: 'flex', gap: 32 },
  stat: { display: 'flex', flexDirection: 'column', gap: 2 },
  statNum: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--color-accent)' },
  statLabel: { fontSize: 13, color: 'var(--color-stone)' },
  right: {
    width: '45%',
    minWidth: 380,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 40px',
    background: 'var(--color-cream)',
  },
  formWrapper: { width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 20 },
  formTitle: { fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, color: 'var(--color-dark)', margin: 0 },
  formSub: { fontSize: 14, color: 'var(--color-stone)', margin: 0 },
  link: { color: 'var(--color-accent)', fontWeight: 500 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  passwordWrapper: { position: 'relative' },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4,
  },
  submitBtn: { width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, marginTop: 4 },
  demoSection: { borderTop: '1px solid var(--color-sand)', paddingTop: 16 },
  demoTitle: { fontSize: 12, fontWeight: 600, color: 'var(--color-stone)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 },
  demoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  demoBtn: {
    padding: '8px 12px', fontSize: 13, fontWeight: 500,
    background: 'transparent', border: '1px solid', borderRadius: 'var(--radius-md)',
    cursor: 'pointer', transition: 'opacity 150ms ease',
  },
}
