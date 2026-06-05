import api from './api'

export async function submitOnboarding(payload: any) {
  // Debug: log the full URL and payload so devs can inspect Network requests
  try {
    // @ts-ignore
    const base = api.defaults?.baseURL || ''
    console.log('Onboarding: POST', `${base}/api/v1/onboarding`, payload)
  } catch (e) { /* ignore */ }
  const res = await api.post('/api/v1/onboarding', payload)
  return res.data
}
