import React, { useEffect, useState, startTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { registerRequest } from '../services/auth.service'
import { getGoogleAuthLink, sendOtp, verifyOtp } from '../services/auth.service'
import { useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import { me } from '../services/auth.service'

const schema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    confirm_password: z.string().min(6),
    full_name: z.string().min(2),
  })
  .refine((data) => data.password === data.confirm_password, { message: "Passwords don't match", path: ['confirm_password'] })

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState, watch } = useForm({ resolver: zodResolver(schema), mode: 'onChange' })
  const [loading, setLoading] = useState(false)
  const [otpStep, setOtpStep] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [devCode, setDevCode] = useState<string | null>(null)
  const [emailForOtp, setEmailForOtp] = useState<string | null>(null)
  const [nameForOtp, setNameForOtp] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const location = useLocation()
  const auth = useAuthStore()
  const pwd = watch('password')
  const cpwd = watch('confirm_password')
  const passwordsMismatch = !!cpwd && pwd !== cpwd

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token') || params.get('access_token')
    if (token) {
      try { auth.setToken(token) } catch (e) {}
      ;(async () => {
        try { const profile = await me(); auth.setUser(profile?.user ?? profile ?? null) } catch (e) { /* ignore */ }
        startTransition(() => navigate('/onboarding'))
      })()
    }
  }, [location.search, navigate, auth])

  async function onSubmit(data: any) {
    try {
      setLoading(true)
      setError(null)
      const payload = { email: data.email, password: data.password, full_name: data.full_name }
      await registerRequest(payload)
      setEmailForOtp(data.email)
      setNameForOtp(data.full_name)
      const resp = await sendOtp(data.email)
      setOtpStep(true)
      if (resp?.code) setDevCode(String(resp.code))
    } catch (err: any) {
      console.error('Registration error', err)
      let msg = 'Registration failed'
      if (err?.response?.data) {
        const d = err.response.data
        msg = d?.detail ?? d?.message ?? JSON.stringify(d)
      } else if (err?.message) {
        msg = err.message
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify() {
    if (!emailForOtp) return alert('Missing email')
    try {
      setLoading(true)
      const res = await verifyOtp(emailForOtp, otpCode)
      const token = res?.access_token ?? res?.token ?? null
      if (token) {
        auth.setToken(token)
        // set a provisional user with full name so onboarding can prefill immediately
        if (nameForOtp) auth.setUser({ full_name: nameForOtp, fullName: nameForOtp, email: emailForOtp } as any)
        try { const profile = await me(); auth.setUser(profile?.user ?? profile ?? null) } catch (e) { /* ignore */ }
      }
      startTransition(() => navigate('/onboarding'))
    } catch (e: any) {
      console.error('Verification error', e)
      let msg = 'Verification failed'
      if (e?.response?.data) msg = e.response.data?.detail ?? e.response.data?.message ?? JSON.stringify(e.response.data)
      else if (e?.message) msg = e.message
      setError(msg)
      return
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
          <div className="hidden md:flex w-1/2 items-center justify-center bg-gradient-to-br from-indigo-900 via-sky-800 to-teal-600 text-white">
        <div className="text-center p-10">
          <h2 className="text-4xl font-extrabold mb-2">NairaIQ</h2>
          <p className="text-[var(--offW)]">Create your profile in under 60 seconds</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-[var(--offW)] text-[var(--dark)]">
        <div className="w-full max-w-md bg-[var(--navyM)] p-10 rounded-2xl shadow-2xl border-2 border-[var(--navyL)] transform transition duration-300 hover:scale-105">
          <h1 className="text-2xl font-bold mb-6 text-[var(--white)]">Create account</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--gray)]">Full name</label>
              <input className="w-full mt-1 p-2 rounded bg-[var(--navyL)] text-[var(--white)] placeholder:text-[var(--grayL)] border-none" {...register('full_name')} />
              {formState.errors.full_name && <div className="text-red-400 text-sm mt-1">{String(formState.errors.full_name.message)}</div>}
            </div>
            <div>
              <label className="block text-sm text-[var(--gray)]">Email</label>
              <input className="w-full mt-1 p-2 rounded bg-[var(--navyL)] text-[var(--white)] placeholder:text-[var(--grayL)] border-none" {...register('email')} />
              {formState.errors.email && <div className="text-red-400 text-sm mt-1">{String(formState.errors.email.message)}</div>}
            </div>
            <div>
              <label className="block text-sm">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} className="w-full mt-1 p-2 rounded bg-[var(--navyL)] text-[var(--white)] placeholder:text-[var(--grayL)] pr-10 border-none" {...register('password')} />
                <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(s => !s)} className="absolute right-2 top-2 text-sm text-[var(--navyL)]">
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.58 10.58a3 3 0 104.83 4.83"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c1.183 0 2.325.176 3.365.5"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7C20.268 16.057 16.477 19 12 19S3.732 16.057 2.458 12z"></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm">Confirm password</label>
              <div className="relative">
                <input type={showConfirmPassword ? 'text' : 'password'} className="w-full mt-1 p-2 rounded bg-[var(--navyL)] text-[var(--white)] placeholder:text-[var(--grayL)] pr-10 border-none" {...register('confirm_password')} />
                <button type="button" aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'} onClick={() => setShowConfirmPassword(s => !s)} className="absolute right-2 top-2 text-sm text-[var(--navyL)]">
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.58 10.58a3 3 0 104.83 4.83"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c1.183 0 2.325.176 3.365.5"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7C20.268 16.057 16.477 19 12 19S3.732 16.057 2.458 12z"></path>
                    </svg>
                  )}
                </button>
              </div>
              {formState.errors.confirm_password && <div className="text-red-400 text-sm mt-1">{String(formState.errors.confirm_password.message)}</div>}
              {passwordsMismatch && <div className="text-red-400 text-sm mt-1">Passwords do not match</div>}
            </div>
            <div>
              <button type="submit" disabled={loading || otpStep || passwordsMismatch} className="w-full py-2 bg-gradient-to-r from-teal-400 to-teal-600 text-black rounded font-semibold">Get started</button>
            </div>
          </form>

          {error && <div className="mt-3 text-sm text-red-500">{error}</div>}

          {otpStep && (
            <div className="mt-4 p-4 border rounded bg-[var(--offW)]">
              <div className="text-sm mb-2">We sent a verification code to <strong>{emailForOtp}</strong>. Enter it below to finish registration.</div>
              <input value={otpCode} onChange={(e) => setOtpCode(e.target.value)} className="w-full mt-1 p-2 rounded border" placeholder="Enter code" />
              {devCode && <div className="text-xs text-[var(--gray)] mt-2">Dev code: {devCode}</div>}
              <div className="mt-3">
                <button onClick={() => handleVerify()} disabled={loading} className="w-full py-2 bg-[var(--teal)] text-black rounded font-semibold">Verify & Continue</button>
              </div>
            </div>
          )}
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
              <a href="/login" className="text-[var(--navyL)]">Already have an account? Log in</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
