import React, { useEffect, useState } from 'react'
import { getTrends } from '../services/trends.service'
import TrendChart from '../components/charts/TrendChart'

export default function TrendsPage() {
  const [data, setData] = useState<any[]>([])
  useEffect(() => {
    getTrends().then(r => setData(r.trends ?? []))
  }, [])

  return (
    <div className="container py-8">
      <h2 className="text-xl font-bold mb-4">Trends</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.map((t:any) => (
          <div key={t.metric} className="bg-[var(--navyM)] p-4 rounded">
            <h3 className="mb-2">{t.metric}</h3>
            <TrendChart data={t.timeline} label={t.metric} />
          </div>
        ))}
      </div>
    </div>
  )
}
