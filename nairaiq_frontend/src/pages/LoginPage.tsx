import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import { getGoogleAuthLink } from '../services/auth.service'
import { useLocation } from 'react-router-dom'
import { me } from '../services/auth.service'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { register, handleSubmit, formState } = useForm<FormValues>({ resolver: zodResolver(schema) })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token') || params.get('access_token')
    if (token) {
      ;(async () => {
        try {
          useAuthStore.getState().setToken(token)
          const profile = await me()
          try { useAuthStore.getState().setUser(profile?.user ?? profile ?? null) } catch (e) {}
        } catch (e) { /* ignore */ }
        navigate('/onboarding')
      })()
    }
  }, [location.search, navigate])

  async function onSubmit(data: FormValues) {
    try {
      setLoading(true)
      await login(data.email, data.password)
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      alert('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex w-1/2 items-center justify-center" style={{ backgroundColor: 'var(--navy)' }}>
        <div className="text-center text-white p-8">
          <h2 className="text-3xl font-bold mb-2">NairaIQ</h2>
          <p className="text-[var(--gray)]">Deterministic financial profiles for Nigeria</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-[var(--offW)] text-[var(--dark)]">
        <div className="w-full max-w-md bg-white p-8 rounded">
          <h1 className="text-2xl font-bold mb-6">Sign in</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm">Email</label>
              <input className="w-full mt-1 p-2 rounded border" {...register('email')} />
              {formState.errors.email && <div className="text-red-400 text-sm mt-1">{String(formState.errors.email.message)}</div>}
            </div>
            <div>
              <label className="block text-sm">Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} className="w-full mt-1 p-2 rounded border" {...register('password')} />
                <button type="button" onClick={() => setShow(s => !s)} className="absolute right-2 top-2 text-sm">{show ? 'Hide' : 'Show'}</button>
              </div>
              {formState.errors.password && <div className="text-red-400 text-sm mt-1">{String(formState.errors.password.message)}</div>}
            </div>
            <div>
              <button type="submit" disabled={loading} className="w-full py-2 bg-[var(--teal)] text-black rounded font-semibold">{loading ? 'Signing in...' : 'Continue'}</button>
            </div>
          </form>
          <div className="my-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-[var(--grayXL)]"></div>
            <div className="text-sm text-[var(--gray)]">or</div>
            <div className="flex-1 h-px bg-[var(--grayXL)]"></div>
          </div>

          <div className="flex flex-col gap-3">
            <button type="button" className="google-btn w-full" onClick={() => { window.location.href = getGoogleAuthLink() }}>
              <span className="google-icon" aria-hidden>
                <svg viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg"><path fill="#4285F4" d="M533.5 278.4c0-18.6-1.5-37-4.4-54.6H272v103.3h147.1c-6.4 34.8-25.7 64.3-55 84v69.8h88.9c52-48 81.5-118.6 81.5-202.5z"/><path fill="#34A853" d="M272 544.3c74 0 136.1-24.6 181.6-66.9l-88.9-69.8c-24.8 16.6-56.5 26.5-92.6 26.5-71 0-131.2-47.9-152.6-112.3H29.1v70.6C74.9 487.6 167.6 544.3 272 544.3z"/><path fill="#FBBC05" d="M119.4 322.8c-11.1-33.5-11.1-69.6 0-103.1V149.1H29.1c-39.8 77.3-39.8 168.8 0 246.1l90.3-72.4z"/><path fill="#EA4335" d="M272 107.7c39.9 0 75.9 13.7 104.2 40.6l78.1-78.1C408.1 24.6 346 0 272 0 167.6 0 74.9 56.7 29.1 149.1l90.3 70.6C140.8 155.6 201 107.7 272 107.7z"/></svg>
              </span>
              Continue with Google
            </button>

            <div className="mt-2 text-sm">
              <a href="/register" className="text-[var(--navyL)]">Create an account</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
