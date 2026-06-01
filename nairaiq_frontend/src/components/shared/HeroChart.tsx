import React, { useMemo } from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const sampleData = [
  { name: 'Oct', income: 75, expenses: 48, savings: 27 },
  { name: 'Nov', income: 90, expenses: 52, savings: 38 },
  { name: 'Dec', income: 82, expenses: 50, savings: 32 },
  { name: 'Jan', income: 98, expenses: 57, savings: 41 },
  { name: 'Feb', income: 110, expenses: 44, savings: 66 },
  { name: 'Mar', income: 130, expenses: 50, savings: 80 },
  { name: 'Apr', income: 120, expenses: 48, savings: 72 }
]

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null
  const income = payload.find((p: any) => p.dataKey === 'income')
  const expenses = payload.find((p: any) => p.dataKey === 'expenses')
  return (
    <div className="chart-tooltip">
      <div className="ct-month">{label}</div>
      <div className="ct-row"><span className="ct-dot ct-dot-income" /> Income <strong>₦{income?.value ?? '-'}k</strong></div>
      <div className="ct-row"><span className="ct-dot ct-dot-expense" /> Expenses <strong>₦{expenses?.value ?? '-'}k</strong></div>
    </div>
  )
}

export default function HeroChart() {
  const data = useMemo(() => sampleData, [])

  return (
    <div className="hero-chart" aria-hidden>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00A878" stopOpacity="0.42" />
              <stop offset="60%" stopColor="#00A878" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#00A878" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="expGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5A623" stopOpacity="0.18" />
              <stop offset="60%" stopColor="#F5A623" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#F5A623" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" />
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: 'auto' }} />
          <Area type="monotone" dataKey="expenses" name="Expenses" stroke="rgba(242,101,34,0.9)" strokeWidth={1.4} fill="url(#expGradient)" className="hero-area hero-line-secondary" dot={false} isAnimationActive={false} />
          <Area type="monotone" dataKey="income" name="Income" stroke="#00A878" strokeWidth={2} fill="url(#incomeGradient)" className="hero-area hero-line-main" dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
