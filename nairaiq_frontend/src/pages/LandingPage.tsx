import React from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/shared/Logo'

export default function LandingPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--navy)' }}>
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4"><Logo /> <div className="font-bold text-lg">NairaIQ</div></div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/login')} className="text-white/80">Log in</button>
          <button onClick={() => navigate('/register')} className="px-3 py-2 bg-[var(--teal)] text-black rounded">Get started</button>
        </div>
      </header>

      <main className="flex-1 container mx-auto flex flex-col items-start justify-center py-16">
        <h1 className="text-5xl font-extrabold leading-tight mb-4">₦100k salary. Rent. Dependants. <span className="text-[var(--teal)]">What actually makes sense?</span></h1>
        <p className="text-[var(--gray)] text-lg mb-6">Answer 8 questions in under 60 seconds.</p>
        <div className="flex gap-4 mb-8">
          <button onClick={() => navigate('/register')} className="px-5 py-3 bg-[var(--teal)] text-black rounded font-semibold">Get started</button>
        </div>

        <section className="w-full grid grid-cols-3 gap-4">
          {['Income Level','Financial Pressure','Saving Capacity','Investment Readiness','Priority','Monthly Surplus'].map((t,i) => (
            <div key={t} className="p-4 bg-[var(--navyM)] rounded slide-up" style={{ animationDelay: `${i*60}ms` }}>
              <div className="text-sm text-[var(--gray)]">{t}</div>
              <div className="text-xl font-bold mt-2">—</div>
            </div>
          ))}
        </section>

        <section className="mt-12 w-full bg-[var(--navyM)] p-6 rounded">
          <h3 className="font-bold mb-4">How it works</h3>
          <div className="grid grid-cols-3 gap-4 text-sm text-[var(--gray)]">
            <div>01 Answer 8 questions</div>
            <div>02 Get your profile</div>
            <div>03 View your dashboard</div>
          </div>
        </section>

        <div className="mt-6 text-[var(--gray)]">🔐 No BVN · 🏦 No bank access · ⚡ 60-second profile · 🇳🇬 Built for Nigeria</div>
      </main>
    </div>
  )
}
