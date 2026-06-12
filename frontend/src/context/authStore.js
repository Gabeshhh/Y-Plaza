import { create } from 'zustand'

const TOKEN_KEY = 'yplaza-token'
const USER_KEY = 'yplaza-user'

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuthStore = create((set, get) => ({
  user: getStoredUser(),
  token: localStorage.getItem(TOKEN_KEY),

  login: (user, token) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    set({ user, token })
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    set({ user: null, token: null })
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
