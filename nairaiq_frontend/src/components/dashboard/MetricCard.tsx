import React from 'react'
import NairaValue from '../shared/NairaValue'
import StatusPill from '../shared/StatusPill'

export default function MetricCard({ title, value, subtitle, delay = 0 }: { title: string; value: number | string; subtitle?: string; delay?: number }) {
  return (
    <div className="card p-4 rounded-md shadow-sm slide-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-[var(--gray)]">{title}</div>
          <div className="text-2xl font-bold mt-1">
            {typeof value === 'number' ? <NairaValue value={value as number} /> : value}
          </div>
          {subtitle && <div className="text-xs text-[var(--gray)] mt-1">{subtitle}</div>}
        </div>
        <div>
          <StatusPill value={typeof subtitle === 'string' ? subtitle : ''} />
        </div>
      </div>
    </div>
  )
}
