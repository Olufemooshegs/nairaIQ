import axios from 'axios'
import { useAuthStore } from '../store/auth.store'

// In dev use a relative base so Vite's proxy (vite.config.ts) forwards `/api` to the backend
const envBase = (import.meta.env.VITE_API_URL as string) || ''
const baseURL = import.meta.env.DEV ? '' : (envBase || 'http://localhost:8000')

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config: any) => {
  try {
    const token = useAuthStore.getState().token
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`
  } catch (e) {}
  return config
})

api.interceptors.response.use((r: any) => r, (error: any) => {
  const status = error?.response?.status
  if (status === 401) {
    try { useAuthStore.getState().logout() } catch (e) {}
    if (typeof window !== 'undefined') window.location.href = '/login'
  }
  return Promise.reject(error)
})

export default api
