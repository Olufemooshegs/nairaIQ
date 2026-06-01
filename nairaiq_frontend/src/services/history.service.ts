import api from './api'

export async function getHistory(userId?: string) {
  const path = userId ? `/api/v1/history/analytics/${userId}` : '/api/v1/history/analytics/me'
  const res = await api.get(path)
  return res.data
}
