import api from './api'

export async function loginRequest(email: string, password: string) {
  const res = await api.post('/api/v1/auth/login', { username: email, password })
  return res.data
}

export async function registerRequest(payload: { email: string; password: string; full_name?: string }) {
  const res = await api.post('/api/v1/auth/register', payload)
  return res.data
}

export async function me() {
  const res = await api.get('/api/v1/auth/me')
  return res.data
}

export function getGoogleAuthLink() {
  const base = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000'
  return `${base}/api/v1/auth/google`
}
