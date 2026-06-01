import api from './api'

export async function getTrends(userId?: string) {
  const path = userId ? `/api/v1/trends/${userId}` : '/api/v1/trends/me'
  const res = await api.get(path)
  return res.data
}
