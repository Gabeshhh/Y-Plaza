import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('yplaza-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('yplaza-token')
      localStorage.removeItem('yplaza-user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
}

export const propertiesAPI = {
  getAll: (params) => api.get('/properties', { params }),
  search: (params) => api.get('/properties', { params }),
  getById: (id) => api.get(`/properties/${id}`),
  getTop: (limit = 6) => api.get('/properties/top', { params: { limit } }),
  create: (data) => api.post('/properties', data),
  update: (id, data) => api.put(`/properties/${id}`, data),
  delete: (id) => api.delete(`/properties/${id}`),
}

export const agenciesAPI = {
  getAll: () => api.get('/agencies'),
  getById: (id) => api.get(`/agencies/${id}`),
}

export const transactionsAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  create: (data) => api.post('/transactions', data),
  updateStatus: (id, status) => api.put(`/transactions/${id}/status`, { status }),
}

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getPriceByCity: () => api.get('/analytics/price-by-city'),
  getPriceByType: () => api.get('/analytics/price-by-type'),
  getTopProperties: () => api.get('/analytics/top-properties'),
  getRevenueByAgency: () => api.get('/analytics/revenue-by-agency'),
}

export default api
