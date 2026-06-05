import React, { useMemo } from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const sampleData = [
  { name: 'Oct', income: 75000, expenses: 48000, savings: 27000 },
  { name: 'Nov', income: 90000, expenses: 52000, savings: 38000 },
  { name: 'Dec', income: 82000, expenses: 50000, savings: 32000 },
  { name: 'Jan', income: 98000, expenses: 57000, savings: 41000 },
  { name: 'Feb', income: 110000, expenses: 44000, savings: 66000 },
  { name: 'Mar', income: 130000, expenses: 50000, savings: 80000 },
  { name: 'Apr', income: 120000, expenses: 48000, savings: 72000 }
]

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="chart-tooltip">
      <div className="ct-month">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="ct-row"><span className={`ct-dot ct-dot-${p.dataKey}`} /> {p.dataKey} <strong>₦{Number(p.value || 0).toLocaleString()}</strong></div>
      ))}
    </div>
  )
}

function buildChartFromTimeline(timeline: any) {
  // timeline may be an object mapping metric->series (period,value)
  // or a list of DashboardTimelineEntry objects.
  if (!timeline) return sampleData

  if (Array.isArray(timeline) && timeline.length && timeline[0].payload) {
    // list of timeline entries with payloads
    return timeline.map((e: any, idx: number) => {
      const name = e.created_at ? e.created_at : `t${idx}`
      const m = e.payload?.metrics ?? {}
      return { name, income: m.disposable_income ?? m.monthly_income ?? 0, expenses: m.estimated_monthly_expenses ?? m.monthly_expenses ?? 0, savings: m.savings_balance ?? 0 }
    })
  }

  if (typeof timeline === 'object' && !Array.isArray(timeline)) {
    const keys = Object.keys(timeline)
    const periods = new Set<string>()
    keys.forEach((k) => {
      (timeline[k] || []).forEach((p: any) => periods.add(p.period || p.created_at || String(p[0] || '')))
    })
    const sorted = Array.from(periods).sort()
    return sorted.map((period) => {
      const row: any = { name: period }
      keys.forEach((k) => {
        const entry = (timeline[k] || []).find((p: any) => (p.period || p.created_at) === period)
        row[k] = entry?.value ?? null
      })
      return row
    })
  }

  // fallback
  return sampleData
}

export default function HeroChart({ demoData }: { demoData?: any }) {
  const data = useMemo(() => buildChartFromTimeline(demoData), [demoData])
  const keys = data && data.length ? Object.keys(data[0]).filter((k) => k !== 'name') : ['income', 'expenses']
  const palette = ['var(--teal)', 'var(--chart-yellow)', 'var(--chart-blue)', 'var(--chart-purple)']

  return (
    <div className="hero-chart" aria-hidden>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--teal)" stopOpacity="0.42" />
              <stop offset="60%" stopColor="var(--teal)" stopOpacity="0.10" />
              <stop offset="100%" stopColor="var(--teal)" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="expGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-yellow)" stopOpacity="0.18" />
              <stop offset="60%" stopColor="var(--chart-yellow)" stopOpacity="0.06" />
              <stop offset="100%" stopColor="var(--chart-yellow)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" />
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: 'auto' }} />
          {keys.map((k, i) => (
            <Area key={k} type="monotone" dataKey={k} name={k} stroke={palette[i % palette.length]} strokeWidth={i === 0 ? 2 : 1.4} fill={palette[i % palette.length]} fillOpacity={0.14} className={`hero-area hero-line-${i}`} dot={false} isAnimationActive={true} animationDuration={900} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
