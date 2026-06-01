import React from 'react'

export default function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card p-4 rounded-md">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 mb-3 rounded skeleton" style={{ animationDelay: `${i * 80}ms` }} />
      ))}
    </div>
  )
}
