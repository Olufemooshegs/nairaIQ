import create from 'zustand'
import { loginRequest } from '../services/auth.service'

type User = { id?: string; email?: string }

interface AuthState {
  token?: string | null
  user?: User | null
  isAuthenticated: boolean
  setToken: (token?: string | null) => void
  setUser: (user?: User | null) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('nairaiq_token') : null,
  user: null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('nairaiq_token') : false,
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('nairaiq_token', token)
      else localStorage.removeItem('nairaiq_token')
    }
    set({ token, isAuthenticated: !!token })
  },
  setUser: (user) => set({ user }),
  login: async (email, password) => {
    const data = await loginRequest(email, password)
    // expected data: { access_token: string, user: { ... } }
    const token = data.access_token ?? data.token ?? null
    const user = data.user ?? null
    if (token) {
      if (typeof window !== 'undefined') localStorage.setItem('nairaiq_token', token)
    }
    set({ token, user, isAuthenticated: !!token })
  },
  logout: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('nairaiq_token')
    set({ token: null, user: null, isAuthenticated: false })
  }
}))
