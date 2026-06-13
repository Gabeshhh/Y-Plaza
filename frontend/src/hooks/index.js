export { useAuthStore } from '../context/authStore'

import { useState } from 'react'

export function usePropertyFilters() {
  const [filters, setFilters] = useState({
    city: '',
    type: '',
    minPrice: '',
    maxPrice: '',
    minSurface: '',
  })

  const updateFilter = (key, value) =>
    setFilters(prev => ({ ...prev, [key]: value }))

  const resetFilters = () =>
    setFilters({ city: '', type: '', minPrice: '', maxPrice: '', minSurface: '' })

  const toQueryParams = () => {
    const params = {}
    if (filters.city)       params.city       = filters.city
    if (filters.type)       params.type       = filters.type
    if (filters.minPrice)   params.minPrice   = filters.minPrice
    if (filters.maxPrice)   params.maxPrice   = filters.maxPrice
    if (filters.minSurface) params.minSurface = filters.minSurface
    return params
  }

  return { filters, updateFilter, resetFilters, toQueryParams }
}

export function usePagination(initialPage = 0, initialSize = 12) {
  const [page, setPage] = useState(initialPage)
  const size = initialSize

  const goToPage = (newPage) => setPage(newPage)
  const reset = () => setPage(0)

  return { page, size, goToPage, reset }
}
