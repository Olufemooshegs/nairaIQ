import React from 'react'
import NairaValue from '../shared/NairaValue'

export default function SummaryCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="card p-4 rounded-md shadow-sm">
      <div className="text-sm text-[var(--gray)]">{title}</div>
      <div className="text-3xl font-bold mt-2">
        {typeof value === 'number' ? <NairaValue value={value} /> : value}
      </div>
    </div>
  )
}
