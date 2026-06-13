import { create } from 'zustand'
import { authAPI } from '../services/api'

const TOKEN_KEY = 'yplaza-token'
const USER_KEY = 'yplaza-user'

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

export const useAuthStore = create((set, get) => ({
  user: getStoredUser(),
  token: localStorage.getItem(TOKEN_KEY),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const res = await authAPI.login({ email, password })
      const data = res.data.data
      const { token, ...user } = data
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      set({ user, token, loading: false })
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || 'Email ou mot de passe incorrect'
      set({ loading: false, error: message })
      return { success: false }
    }
  },

  register: async (payload) => {
    set({ loading: true, error: null })
    try {
      const res = await authAPI.register(payload)
      const data = res.data.data
      const { token, ...user } = data
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      set({ user, token, loading: false })
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de l\'inscription'
      set({ loading: false, error: message })
      return { success: false }
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    set({ user: null, token: null, error: null })
  },

  canManageProperties: () => {
    const { user } = get()
    return !!user && ['DIRECTION', 'COMMERCIAL', 'IT_SUPPORT'].includes(user.role)
  },

  canAccessAnalytics: () => {
    const { user } = get()
    return !!user && ['DIRECTION', 'IT_SUPPORT'].includes(user.role)
  },

  isAuthenticated: () => !!get().token,
}))
