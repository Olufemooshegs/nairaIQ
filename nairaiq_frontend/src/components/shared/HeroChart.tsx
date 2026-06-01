import React, { useMemo } from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts'

const sampleData = [
  { name: 'Oct', value: 35 },
  { name: 'Nov', value: 48 },
  { name: 'Dec', value: 42 },
  { name: 'Jan', value: 58 },
  { name: 'Feb', value: 66 },
  { name: 'Mar', value: 80 },
  { name: 'Apr', value: 72 }
]

export default function HeroChart() {
  const data = useMemo(() => sampleData, [])

  return (
    <div className="hero-chart" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="nairaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00A878" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#00A878" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#00A878" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Area type="monotone" dataKey="value" stroke="#00A878" strokeWidth={2} fill="url(#nairaGradient)" className="hero-line" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
