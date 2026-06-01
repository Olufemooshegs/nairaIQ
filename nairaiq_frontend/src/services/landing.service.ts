import api from './api'

const PUBLIC_PATHS = [
  '/api/v1/dashboard/public',
  '/api/v1/dashboard/sample',
  '/api/v1/dashboard/demo',
]

export async function getPublicDashboard() {
  for (const p of PUBLIC_PATHS) {
    try {
      const res = await api.get(p)
      if (res?.data) return res.data
    } catch (e) {
      // try next
    }
  }
  return null
}
