import React, { useEffect } from 'react'
import { getHistory } from '../services/history.service'
import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function HistoryPage() {
  const [data, setData] = useState<any[]>([])
  useEffect(() => {
    getHistory().then(r => setData(r.records ?? []))
  }, [])

  return (
    <div className="container py-8">
      <div className="bg-[var(--navyM)] p-6 rounded">
        <h2 className="text-xl font-bold mb-4">History</h2>
        {data.length === 0 ? <div className="text-[var(--gray)]">No history yet</div> : (
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={data}>
                <XAxis dataKey="computed_at" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Line dataKey="pressure_score" stroke="#ffb703" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
 