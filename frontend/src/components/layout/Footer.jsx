import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={styles.footer} role="contentinfo">
      <div className="container">
        <div style={styles.grid}>
          <div style={styles.brand}>
            <div style={styles.logo}>
              <span style={styles.logoY}>Y</span>
              <span style={styles.logoPlaza}>Plaza</span>
            </div>
            <p style={styles.tagline}>
              La plateforme immobilière de référence.<br />
              Siège à Aix-en-Provence, 12 agences en France.
            </p>
          </div>

          <nav aria-label="Liens rapides">
            <p style={styles.colTitle}>Découvrir</p>
            <ul style={styles.list}>
              <li><Link to="/properties" style={styles.footerLink}>Tous les biens</Link></li>
              <li><Link to="/agencies" style={styles.footerLink}>Nos agences</Link></li>
              <li><Link to="/register" style={styles.footerLink}>Créer un compte</Link></li>
            </ul>
          </nav>

          <nav aria-label="Types de biens">
            <p style={styles.colTitle}>Types de biens</p>
            <ul style={styles.list}>
              <li><Link to="/properties?type=APPARTEMENT" style={styles.footerLink}>Appartements</Link></li>
              <li><Link to="/properties?type=MAISON" style={styles.footerLink}>Maisons</Link></li>
              <li><Link to="/properties?type=VILLA" style={styles.footerLink}>Villas</Link></li>
              <li><Link to="/properties?type=BUREAU" style={styles.footerLink}>Bureaux</Link></li>
            </ul>
          </nav>

          <div>
            <p style={styles.colTitle}>Contact siège</p>
            <address style={styles.address}>
              15 Cours Mirabeau<br />
              13100 Aix-en-Provence<br />
              <a href="tel:0442000000" style={styles.footerLink}>04 42 00 00 00</a><br />
              <a href="mailto:siege@yplaza.fr" style={styles.footerLink}>siege@yplaza.fr</a>
            </address>
          </div>
        </div>

        <div style={styles.bottom}>
          <p style={styles.copy}>© {new Date().getFullYear()} Y-Plaza — Projet Ynov B2 INFRA &amp; DEV</p>
          <p style={styles.copy}>Tous droits réservés</p>
        </div>
      </div>
    </footer>
  )
}

const styles = {
  footer: {
    background: 'var(--color-dark)',
    color: 'var(--color-sand)',
    paddingTop: 56,
    paddingBottom: 32,
    marginTop: 80,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 40,
    paddingBottom: 48,
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  brand: { maxWidth: 260 },
  logo: { display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 12 },
  logoY: {
    fontFamily: 'var(--font-display)',
    fontSize: 26,
    fontWeight: 700,
    color: 'var(--color-accent)',
    lineHeight: 1,
  },
  logoPlaza: {
    fontFamily: 'var(--font-display)',
    fontSize: 20,
    fontWeight: 300,
    color: 'var(--color-cream)',
    lineHeight: 1,
    fontStyle: 'italic',
  },
  tagline: {
    fontSize: 13,
    lineHeight: 1.7,
    color: 'var(--color-stone)',
  },
  colTitle: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--color-cream)',
    marginBottom: 14,
  },
  list: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 },
  footerLink: {
    fontSize: 14,
    color: 'var(--color-stone)',
    transition: 'color 150ms ease',
    display: 'block',
  },
  address: {
    fontSize: 13,
    fontStyle: 'normal',
    lineHeight: 1.9,
    color: 'var(--color-stone)',
  },
  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 24,
  },
  copy: { fontSize: 12, color: 'var(--color-stone)', opacity: 0.6 },
}
