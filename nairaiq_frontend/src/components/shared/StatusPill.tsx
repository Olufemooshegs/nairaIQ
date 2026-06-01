import React from 'react'

const colorMap: Record<string, string> = {
  low: 'bg-[var(--teal)] text-black',
  medium: 'bg-[var(--yellow)] text-black',
  high: 'bg-[var(--orange)] text-black',
  critical: 'bg-[var(--red)] text-white'
}

export default function StatusPill({ value = '' }: { value?: string }) {
  const cls = colorMap[value] ?? 'bg-[var(--gray)] text-white'
  return <span className={`px-2 py-1 rounded-full text-xs ${cls}`}>{value || '—'}</span>
}
