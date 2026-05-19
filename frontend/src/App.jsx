import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/common/ProtectedRoute'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PropertiesPage from './pages/PropertiesPage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import AgenciesPage from './pages/AgenciesPage'
import DashboardPage from './pages/DashboardPage'
import AnalyticsPage from './pages/AnalyticsPage'

import './styles/globals.css'

export default function App() {
  return (
    <BrowserRouter>
      <a href="#main-content" style={skipLinkStyle} className="sr-only">
        Aller au contenu principal
      </a>
      <Navbar />
      <div id="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/agencies" element={<AgenciesPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute requireRole={['DIRECTION', 'COMMERCIAL', 'IT_SUPPORT']}>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute requireRole={['DIRECTION', 'IT_SUPPORT']}>
              <AnalyticsPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  )
}

function NotFound() {
  return (
    <main style={{ textAlign: 'center', padding: '100px 24px' }} role="main">
      <p style={{ fontSize: 72, margin: 0 }} aria-hidden="true">404</p>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 16 }}>Page introuvable</h1>
      <a href="/" className="btn btn-accent" style={{ display: 'inline-flex' }}>Retour à l'accueil</a>
    </main>
  )
}

const skipLinkStyle = {
  position: 'absolute', top: -40, left: 8, zIndex: 9999,
  background: 'var(--color-accent)', color: '#fff',
  padding: '8px 16px', borderRadius: '0 0 8px 8px',
  transition: 'top 200ms',
}
