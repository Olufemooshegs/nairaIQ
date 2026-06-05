import React from 'react'
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import { formatNaira } from '../../utils/formatters'

export default function TrendChart({ data = [], label = '' }: { data?: any[]; label?: string }) {
  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={'var(--grid)'} />
          <XAxis dataKey="month" stroke={'var(--muted-stroke)'} />
          <YAxis stroke={'var(--muted-stroke)'} />
          <Tooltip formatter={(val:any) => formatNaira(val)} />
          <Line type="monotone" dataKey="value" stroke={'var(--teal)'} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
