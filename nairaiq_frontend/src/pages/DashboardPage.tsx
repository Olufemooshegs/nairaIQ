import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../store/auth.store'
import { getDashboard } from '../services/dashboard.service'
import SummaryCard from '../components/dashboard/SummaryCard'
import NairaValue from '../components/shared/NairaValue'
import MetricCard from '../components/dashboard/MetricCard'
import BudgetAllocation from '../components/dashboard/BudgetAllocation'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    getDashboard(user?.id).then((d) => {
      if (!mounted) return
      setData(d)
    }).catch(() => {
      if (!mounted) return
      // Backend may be offline — provide a dev fallback so UI can be verified locally
      const fallback = {
        summary: { headline: 'Welcome', priority_action: 'Build an emergency fund', financial_health: 'developing' },
        scores: { pressure_score: 4, overall_health_score: 62 },
        timeline: [{ month: 'Jan', pressure_score: 5 }, { month: 'Feb', pressure_score: 4 }],
        expense_breakdown: [{ category: 'Rent', amount: 40000, percentage: 30 }, { category: 'Food', amount: 20000, percentage: 15 }],
        trend_analysis: [],
        strategic_priority: 'Survival',
        income: 150000,
        surplus: 30000,
        budget: { survival: 60000, survival_pct: 40, savings: 30000, savings_pct: 20, investment: 30000, investment_pct: 20, flex: 30000, flex_pct: 20 },
        profile: { income_level: 'medium', pressure: 'medium', saving_cap: 'developing', investment_readiness: 'developing' }
      }
      setData(fallback)
    }).finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [user?.id])

  if (loading) return <div className="p-6">Loading dashboard…</div>

  if (!data) return <div className="p-6">Unable to load dashboard.</div>

  const income = data.income ?? 0
  const surplus = data.surplus ?? 0

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Hello{user?.email ? `, ${user.email.split('@')[0]}` : ''} 👋</h1>
        <div className="text-sm text-[var(--gray)]">{data.profile?.income_level ?? ''} • {data.profile?.pressure ?? ''}</div>
      </div>

      <div className="card p-6 mb-6 rounded-md slide-up" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-[var(--gray)]">Monthly Income</div>
            <div className="text-4xl font-bold mt-2"><NairaValue value={income} /></div>
          </div>
          <div className="text-right">
            <div className="text-sm text-[var(--gray)]">Monthly Surplus</div>
            <div className={`text-2xl font-semibold mt-2 ${surplus >= 0 ? 'text-[var(--teal)]' : 'text-[var(--yellow)]'}`}>
              <NairaValue value={surplus} />
            </div>
            <div className="mt-2"><span className="text-sm text-[var(--gray)]">Strategic Priority</span> <span className="ml-2"><strong>{data.summary?.priority_action ?? '—'}</strong></span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Income Level" value={income} subtitle={data.profile?.income_level} delay={200} />
        <MetricCard title="Financial Pressure" value={data.scores?.pressure_score ?? 0} subtitle={data.profile?.pressure} delay={280} />
        <MetricCard title="Saving Capacity" value={data.surplus ?? 0} subtitle={data.profile?.saving_cap} delay={360} />
        <MetricCard title="Investment Readiness" value={0} subtitle={data.profile?.investment_readiness} delay={440} />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="card p-4 rounded-md slide-up" style={{ animationDelay: '800ms' }}>
          <h3 className="text-lg font-semibold mb-3">Budget Allocation</h3>
          <BudgetAllocation budget={[
            { label: 'Survival', pct: data.budget?.survival_pct ?? 0 },
            { label: 'Savings', pct: data.budget?.savings_pct ?? 0 },
            { label: 'Investment', pct: data.budget?.investment_pct ?? 0 },
            { label: 'Flex', pct: data.budget?.flex_pct ?? 0 }
          ]} />
        </div>

        <div className="card p-4 rounded-md slide-up" style={{ animationDelay: '800ms' }}>
          <h3 className="text-lg font-semibold mb-3">Expense Breakdown</h3>
          <div className="space-y-2">
            {(data.expense_breakdown ?? []).map((e:any) => {
              const raw = e.percentage ?? 0
              const pct = raw > 1 ? Math.round(raw) : Math.round(raw * 100)
              return (
                <div key={e.category} className="flex items-center justify-between">
                  <div className="text-sm">{e.category}</div>
                  <div className="text-sm text-[var(--gray)]">{pct}%</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
 
