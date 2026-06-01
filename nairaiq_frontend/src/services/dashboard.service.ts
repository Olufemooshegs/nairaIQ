import api from './api'

export async function getDashboard(userId?: string) {
  const path = userId ? `/api/v1/dashboard/${userId}` : '/api/v1/dashboard/me/latest'
  const res = await api.get(path)
  return res.data
}
