import api from './api'

export async function submitOnboarding(payload: any) {
  const res = await api.post('/api/v1/onboarding/submit', payload)
  return res.data
}
