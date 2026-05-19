import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../context/authStore'

/**
 * Composant de protection de route.
 * Redirige vers /login si non authentifié, avec mémorisation de l'URL d'origine.
 */
export default function ProtectedRoute({ children, requireRole }) {
  const { user } = useAuthStore()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireRole && !requireRole.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}
