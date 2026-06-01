import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/shared/Logo'
import HeroChart from '../components/shared/HeroChart'
import { useAuthStore } from '../store/auth.store'
import { getPublicDashboard } from '../services/landing.service'
import { getDashboard } from '../services/dashboard.service'

export default function LandingPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [apiData, setApiData] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        let d = null
        if (user?.id) {
          d = await getDashboard(user.id)
        } else {
          d = await getPublicDashboard()
        }
        if (!mounted) return
        if (d) setApiData(d)
      } catch (e) {
        // ignore and keep static values
        console.warn('Landing: failed to load API demo data', e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [user?.id])
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
          {([
            { title: 'Income Level', key: 'income' },
            { title: 'Financial Pressure', key: 'pressure' },
            { title: 'Saving Capacity', key: 'saving' },
            { title: 'Investment Readiness', key: 'investment' },
            { title: 'Priority', key: 'priority' },
            { title: 'Monthly Surplus', key: 'surplus' }
          ] as any[]).map((t,i) => {
            // derive values from apiData when available
            const raw = apiData ?? null
            let value: any = '—'
            if (raw) {
              const metrics = raw.metrics ?? raw.summary?.high_level ?? {}
              const scores = raw.scores ?? {}
              const summary = raw.summary ?? {}
              switch (t.key) {
                case 'income':
                  value = raw.income ?? metrics.monthly_income ?? metrics.disposable_income ?? null
                  break
                case 'pressure':
                  value = scores.pressure_score ?? metrics.pressure_score ?? scores.overall_health ?? null
                  break
                case 'saving':
                  value = metrics.savings_rate ?? (raw.surplus ?? null) ?? null
                  break
                case 'investment':
                  value = raw.profile?.investment_readiness ?? metrics.investment_readiness ?? null
                  break
                case 'priority':
                  value = summary.priority_action ?? raw.strategic_priority ?? (raw.summary?.headline ?? null)
                  break
                case 'surplus':
                  if (metrics.disposable_income != null && metrics.estimated_monthly_expenses != null) {
                    value = metrics.disposable_income - metrics.estimated_monthly_expenses
                  } else {
                    value = raw.surplus ?? null
                  }
                  break
                default:
                  value = '—'
              }
            } else {
              // default demo values
              const demo = { income: 150000, pressure: 4, saving: 30000, investment: 'developing', priority: 'Build an emergency fund', surplus: 30000 }
              value = demo[t.key]
            }
            const display = typeof value === 'number' ? `₦${value.toLocaleString()}` : value ?? '—'
            return (
              <div key={t.title} className="p-4 bg-[var(--navyM)] rounded slide-up" style={{ animationDelay: `${i*60}ms` }}>
                <div className="text-sm text-[var(--gray)]">{t.title}</div>
                <div className="text-xl font-bold mt-2 naira">{display}</div>
              </div>
            )
          })}
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
