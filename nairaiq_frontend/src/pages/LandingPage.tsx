import React from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/shared/Logo'
import HeroChart from '../components/shared/HeroChart'

export default function LandingPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col relative">
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4"><Logo /> <div className="font-bold text-lg">NairaIQ</div></div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/login')} className="btn-login">Log in</button>
          <button onClick={() => navigate('/register')} className="btn-cta">Get started</button>
        </div>
      </header>

      <main className="flex-1 container mx-auto flex flex-col items-start justify-center py-16 relative z-10">
        <HeroChart />
        <h1 className="text-5xl font-extrabold leading-tight mb-4">
          <span className="flow-wrap"><span className="flow flow-delay-0">₦100k salary.</span></span>{' '}
          <span className="flow-wrap"><span className="flow flow-delay-1">Rent.</span></span>{' '}
          <span className="flow-wrap"><span className="flow flow-delay-2">Dependants.</span></span>{' '}
          <span className="flow-wrap"><span className="flow flow-delay-3 text-[var(--teal)]">What actually makes sense?</span></span>
        </h1>
        <p className="text-[var(--gray)] text-lg mb-6">Answer 8 questions in under 60 seconds.</p>
        <div className="flex gap-4 mb-8">
          <button onClick={() => navigate('/register')} className="btn-cta">Get started</button>
        </div>

        <section className="w-full grid grid-cols-3 gap-4">
          {[
            { title: 'Income Level', value: 150000 },
            { title: 'Financial Pressure', value: 4 },
            { title: 'Saving Capacity', value: 30000 },
            { title: 'Investment Readiness', value: 0 },
            { title: 'Priority', value: 'Build an emergency fund' },
            { title: 'Monthly Surplus', value: 30000 }
          ].map((t,i) => (
            <div key={t.title} className="p-4 bg-[var(--navyM)] rounded slide-up" style={{ animationDelay: `${i*60}ms` }}>
              <div className="text-sm text-[var(--gray)]">{t.title}</div>
              <div className="text-xl font-bold mt-2 naira">{typeof t.value === 'number' ? `₦${t.value.toLocaleString()}` : t.value}</div>
            </div>
          ))}
        </section>

        <section className="mt-12 w-full">
          <h3 className="font-bold mb-6">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[var(--navyM)] rounded-lg slide-up">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(90deg, var(--teal), var(--teal-2))', color: '#02161a', fontWeight: 700 }}>01</div>
                <div>
                  <div className="font-semibold">Answer 8 quick questions</div>
                  <div className="text-sm text-[var(--gray)]">Tell us about your income, expenses and goals — takes under a minute.</div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[var(--navyM)] rounded-lg slide-up">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(90deg, var(--teal), var(--teal-2))', color: '#02161a', fontWeight: 700 }}>02</div>
                <div>
                  <div className="font-semibold">Get a deterministic profile</div>
                  <div className="text-sm text-[var(--gray)]">We compute a clear financial snapshot and priority actions just for you.</div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[var(--navyM)] rounded-lg slide-up">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(90deg, var(--teal), var(--teal-2))', color: '#02161a', fontWeight: 700 }}>03</div>
                <div>
                  <div className="font-semibold">Actionable dashboard</div>
                  <div className="text-sm text-[var(--gray)]">Track your budget, savings and goals with clear next steps and visuals.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 text-[var(--muted)] text-center w-full">🇳🇬 Built for Naija</div>
      </main>
    </div>
  )
}
