import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { registerRequest } from '../services/auth.service'

const schema = z.object({ email: z.string().email(), password: z.string().min(6), full_name: z.string().min(2) })

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, handleSubmit } = useForm({ resolver: zodResolver(schema) })

  async function onSubmit(data: any) {
    try {
      await registerRequest(data)
      navigate('/onboarding')
    } catch (err) {
      alert('Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex w-1/2 items-center justify-center" style={{ backgroundColor: 'var(--navy)' }}>
        <div className="text-center text-white p-8">
          <h2 className="text-3xl font-bold mb-2">NairaIQ</h2>
          <p className="text-[var(--gray)]">Create your profile in under 60 seconds</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-[var(--offW)] text-[var(--dark)]">
        <div className="w-full max-w-md bg-white p-8 rounded">
          <h1 className="text-2xl font-bold mb-6">Create account</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm">Full name</label>
              <input className="w-full mt-1 p-2 rounded border" {...register('full_name')} />
            </div>
            <div>
              <label className="block text-sm">Email</label>
              <input className="w-full mt-1 p-2 rounded border" {...register('email')} />
            </div>
            <div>
              <label className="block text-sm">Password</label>
              <input type="password" className="w-full mt-1 p-2 rounded border" {...register('password')} />
            </div>
            <div>
              <button type="submit" className="w-full py-2 bg-[var(--teal)] text-black rounded font-semibold">Get started</button>
            </div>
          </form>
          <div className="mt-4 text-sm">
            <a href="/login" className="text-[var(--navyL)]">Already have an account? Log in</a>
          </div>
        </div>
      </div>
    </div>
  )
}
