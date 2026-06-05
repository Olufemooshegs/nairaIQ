import React, { useEffect, useState, startTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/shared/Logo'
import HeroChart from '../components/shared/HeroChart'
import { useAuthStore } from '../store/auth.store'
import { getPublicDashboard } from '../services/landing.service'
import { getDashboard } from '../services/dashboard.service'
import useCyclingStats from '../hooks/useCyclingStats'

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
  const { values, getPressureState, demoScenario, trends } = useCyclingStats(apiData, !user)

  const metrics = apiData?.metrics ?? apiData?.summary?.high_level ?? {}
  const scores = apiData?.scores ?? {}
  const summary = apiData?.summary ?? {}
  const rawPressure = demoScenario?.pressure ?? scores?.pressure_score ?? metrics?.pressure_score ?? scores?.overall_health ?? null
  const pressureState = getPressureState(rawPressure)
  function formatK(n?: number | null) {
    if (n == null || Number.isNaN(Number(n))) return '—'
    const v = Math.round(Number(n))
    const abs = Math.abs(v)
    if (abs >= 1000) {
      return `₦${Math.round(v / 1000).toLocaleString()}k`
    }
    return `₦${v.toLocaleString()}`
  }
  return (
    <div className="min-h-screen flex flex-col relative">
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4"><Logo /> <div className="font-bold text-lg">NairaIQ</div></div>
        <div className="flex gap-3">
          <button onClick={() => startTransition(() => navigate('/login'))} className="btn-login">Log in</button>
          <button onClick={() => startTransition(() => navigate('/register'))} className="btn-cta">Get started</button>
        </div>
      </header>

      <main className="flex-1 container mx-auto flex flex-col items-start justify-center py-16 relative z-10">
        <HeroChart demoData={apiData?.timeline ?? apiData?.timeline_entries ?? apiData} />
        <h1 className="text-5xl font-extrabold leading-tight mb-4">
          <span className="flow-wrap"><span className="flow flow-delay-0 countup">{formatK(values.income)} salary.</span></span>{' '}
          <span className="flow-wrap"><span className="flow flow-delay-1">Rent.</span></span>{' '}
          <span className="flow-wrap"><span className="flow flow-delay-2">Dependants.</span></span>{' '}
          <span className="flow-wrap"><span className="flow flow-delay-3 text-[var(--teal)]">What actually makes sense?</span></span>
        </h1>
        <p className="text-[var(--gray)] text-lg mb-6">Answer 8 questions in under 60 seconds.</p>
        <div className="flex gap-4 mb-8">
          <div className="p-6 rounded-lg bg-white/5 border border-white/5">
            <div className="text-lg font-semibold">Get started</div>
            <div className="text-[var(--gray)] text-sm">Create your profile in under 60 seconds.</div>
            <div className="mt-4">
              <button onClick={() => startTransition(() => navigate('/register'))} className="btn-cta">Get started</button>
            </div>
          </div>
        </div>

        <section className="w-full grid grid-cols-3 gap-4">
          {([
            { title: 'Income', key: 'income' },
            { title: 'Financial Pressure', key: 'pressure' },
            { title: 'Saving Capacity', key: 'saving' },
            { title: 'Investment Readiness', key: 'investment' },
            { title: 'Priority', key: 'priority' },
            { title: 'Monthly Surplus', key: 'surplus' }
          ] as any[]).map((t,i) => {
            let content: any = '—'
            let colorStyle: any = { color: 'var(--white)' }

            if (t.key === 'income') {
              const v = values.income
              const display = formatK(v)
              if (v >= 100000) colorStyle.color = 'var(--success)'
              else if (v >= 50000) colorStyle.color = 'var(--warning)'
              else colorStyle.color = 'var(--danger)'
              content = <>{display}</>
            }

            if (t.key === 'pressure') {
              const display = pressureState.label
              const bgMap: any = { green: 'rgba(34,197,94,0.12)', amber: 'rgba(245,158,11,0.12)', red: 'rgba(239,68,68,0.12)' }
              const txtMap: any = { green: 'var(--success)', amber: 'var(--warning)', red: 'var(--danger)' }
              colorStyle = { background: bgMap[pressureState.color] || 'transparent', color: txtMap[pressureState.color] || 'var(--muted)', padding: '6px 10px', borderRadius: 999 }
              content = <span>{display}</span>
            }

            if (t.key === 'saving') {
              const v = values.saving
              const display = formatK(v)
              const tVal = trends?.saving ?? 0
              const arrow = tVal > 0 ? '▲' : tVal < 0 ? '▼' : '—'
              const trendClass = tVal > 0 ? 'trend-up trend-anim' : tVal < 0 ? 'trend-down trend-anim' : 'trend-flat'
              if (v >= 20000) colorStyle.color = 'var(--success)'
              else if (v >= 5000) colorStyle.color = 'var(--warning)'
              else colorStyle.color = 'var(--danger)'
              content = (<><span>{display}</span> <span className={`trend-arrow ${trendClass}`} aria-hidden>{arrow}</span></>)
            }

            if (t.key === 'investment') {
              const raw = demoScenario?.investment ?? apiData?.profile?.investment_readiness ?? metrics?.investment_readiness ?? 'Developing'
              const badgeClass = String(raw).toLowerCase().includes('ready') ? 'badge-ready' : String(raw).toLowerCase().includes('develop') ? 'badge-developing' : 'badge-unknown'
              content = <span className={badgeClass}>{raw}</span>
            }

            if (t.key === 'priority') {
              const raw = demoScenario?.priority ?? summary?.priority_action ?? apiData?.strategic_priority ?? summary?.headline ?? 'Build an emergency fund'
              let pColor = 'var(--warning)'
              const s = String(raw).toLowerCase()
              if (s.includes('invest')) pColor = 'var(--success)'
              else if (s.includes('reduce') || s.includes('cut')) pColor = 'var(--danger)'
              content = <span style={{ color: pColor }}>{raw}</span>
            }

            if (t.key === 'surplus') {
              const v = values.surplus
              const display = formatK(v)
              const tVal = trends?.surplus ?? 0
              const arrow = tVal > 0 ? '▲' : tVal < 0 ? '▼' : '—'
              const trendClass = tVal > 0 ? 'trend-up trend-anim' : tVal < 0 ? 'trend-down trend-anim' : 'trend-flat'
              colorStyle.color = v > 0 ? 'var(--success)' : 'var(--danger)'
              content = (<><span>{display}</span> <span className={`trend-arrow ${trendClass}`} aria-hidden>{arrow}</span></>)
            }

            return (
              <div key={t.title} className="p-4 bg-[var(--navyM)] rounded slide-up" style={{ animationDelay: `${i*140}ms` }}>
                <div className="text-sm text-[var(--gray)]">{t.title}</div>
                <div className="text-xl font-bold mt-2 naira countup" style={colorStyle}>{content}</div>
              </div>
            )
          })}
        </section>

        <section className="mt-12 w-full">
          <h3 className="font-bold mb-6">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[var(--navyM)] rounded-lg slide-up">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(90deg, var(--teal), var(--teal-2))', color: 'var(--dark)', fontWeight: 700 }}>01</div>
                <div>
                  <div className="font-semibold">Answer 8 quick questions</div>
                  <div className="text-sm text-[var(--gray)]">Tell us about your income, expenses and goals — takes under a minute.</div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[var(--navyM)] rounded-lg slide-up">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(90deg, var(--teal), var(--teal-2))', color: 'var(--dark)', fontWeight: 700 }}>02</div>
                <div>
                  <div className="font-semibold">Get a deterministic profile</div>
                  <div className="text-sm text-[var(--gray)]">We compute a clear financial snapshot and priority actions just for you.</div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[var(--navyM)] rounded-lg slide-up">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(90deg, var(--teal), var(--teal-2))', color: 'var(--dark)', fontWeight: 700 }}>03</div>
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
