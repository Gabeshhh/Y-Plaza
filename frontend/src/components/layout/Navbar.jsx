import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../context/authStore'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout, canManageProperties, canAccessAnalytics } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav style={styles.nav} role="navigation" aria-label="Navigation principale">
      <div className="container" style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo} aria-label="Y-Plaza, retour à l'accueil">
          <span style={styles.logoY}>Y</span>
          <span style={styles.logoPlaza}>Plaza</span>
        </Link>

        {/* Nav links — desktop */}
        <div style={styles.links} role="menubar">
          <Link to="/properties" style={{
            ...styles.link,
            ...(isActive('/properties') ? styles.linkActive : {})
          }} role="menuitem">
            Biens
          </Link>
          <Link to="/agencies" style={{
            ...styles.link,
            ...(isActive('/agencies') ? styles.linkActive : {})
          }} role="menuitem">
            Agences
          </Link>
          {user && canManageProperties() && (
            <Link to="/dashboard" style={{
              ...styles.link,
              ...(isActive('/dashboard') ? styles.linkActive : {})
            }} role="menuitem">
              Dashboard
            </Link>
          )}
          {user && canAccessAnalytics() && (
            <Link to="/analytics" style={{
              ...styles.link,
              ...(isActive('/analytics') ? styles.linkActive : {})
            }} role="menuitem">
              Analytiques
            </Link>
          )}
        </div>

        {/* Auth actions */}
        <div style={styles.actions}>
          {user ? (
            <>
              <span style={styles.userName} aria-label={`Connecté en tant que ${user.fullName}`}>
                {user.fullName}
                <span style={styles.roleBadge}>{formatRole(user.role)}</span>
              </span>
              <button onClick={handleLogout} className="btn btn-outline" style={styles.logoutBtn}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Connexion</Link>
              <Link to="/register" className="btn btn-accent">Inscription</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          style={styles.burger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label="Menu mobile"
          className="btn btn-ghost"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={styles.mobileMenu} role="menu" aria-label="Menu mobile">
          <Link to="/properties" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Biens</Link>
          <Link to="/agencies" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Agences</Link>
          {user && canManageProperties() && (
            <Link to="/dashboard" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Dashboard</Link>
          )}
          {user && canAccessAnalytics() && (
            <Link to="/analytics" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Analytiques</Link>
          )}
          <div style={styles.mobileDivider} />
          {user ? (
            <button onClick={handleLogout} style={styles.mobileLink}>Déconnexion</button>
          ) : (
            <>
              <Link to="/login" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Connexion</Link>
              <Link to="/register" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Inscription</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

function formatRole(role) {
  const map = {
    DIRECTION: 'Direction',
    COMMERCIAL: 'Commercial',
    CLIENT: 'Client',
    IT_SUPPORT: 'IT',
    COMMUNICATION_MARKETING: 'Marketing',
    ADMINISTRATIF_RH_JURIDIQUE: 'Admin',
  }
  return map[role] || role
}

const styles = {
  nav: {
    background: 'var(--color-white)',
    borderBottom: '1px solid var(--color-sand)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 8px rgba(44,40,37,0.06)',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    height: 72,
  },
  logo: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 2,
    marginRight: 16,
  },
  logoY: {
    fontFamily: 'var(--font-display)',
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--color-accent)',
    lineHeight: 1,
  },
  logoPlaza: {
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    fontWeight: 300,
    color: 'var(--color-charcoal)',
    lineHeight: 1,
    fontStyle: 'italic',
  },
  links: {
    display: 'flex',
    gap: 4,
    flex: 1,
    '@media (max-width: 768px)': { display: 'none' },
  },
  link: {
    padding: '6px 14px',
    borderRadius: 'var(--radius-md)',
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--color-charcoal)',
    transition: 'all 150ms ease',
    opacity: 0.7,
  },
  linkActive: {
    opacity: 1,
    background: 'var(--color-sand)',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginLeft: 'auto',
  },
  userName: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-charcoal)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    padding: '2px 8px',
    background: 'var(--color-accent-light)',
    color: 'var(--color-accent-dark)',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
  },
  logoutBtn: {
    fontSize: 13,
    padding: '8px 16px',
  },
  burger: {
    display: 'none',
    fontSize: 20,
    padding: '8px',
    '@media (max-width: 768px)': { display: 'flex' },
  },
  mobileMenu: {
    display: 'flex',
    flexDirection: 'column',
    padding: '8px 16px 16px',
    borderTop: '1px solid var(--color-sand)',
    background: 'var(--color-white)',
  },
  mobileLink: {
    padding: '12px 8px',
    fontSize: 15,
    fontWeight: 500,
    color: 'var(--color-charcoal)',
    borderBottom: '1px solid var(--color-sand)',
    background: 'none',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'block',
  },
  mobileDivider: {
    height: 8,
  },
}
