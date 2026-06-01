import React, { useEffect, useState } from 'react'

export default function BudgetAllocation({ budget }: { budget: { label: string; pct: number }[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 600); return () => clearTimeout(t) }, [])

  return (
    <div className="space-y-3">
      {budget.map((b) => (
        <div key={b.label}>
          <div className="flex justify-between text-sm text-[var(--gray)] mb-1">
            <div>{b.label}</div>
            <div>{b.pct}%</div>
          </div>
          <div className="w-full bg-[var(--grayL)] h-3 rounded overflow-hidden">
            <div className="h-3 rounded" style={{ width: mounted ? `${b.pct}%` : '0%', background: 'linear-gradient(90deg, var(--teal), var(--tealDk))', transition: 'width 800ms var(--easing)' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
