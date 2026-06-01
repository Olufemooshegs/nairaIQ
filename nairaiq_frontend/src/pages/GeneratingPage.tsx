import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const steps = [
  'Analysing income level...',
  'Calculating financial pressure...',
  'Estimating likely expenses...',
  'Measuring saving capacity...',
  'Checking investment readiness...',
  'Computing profile vector...',
  'Generating your profile...'
]

export default function GeneratingPage() {
  const [i, setI] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (i < steps.length) {
      const t = setTimeout(() => setI(i+1), 380)
      return () => clearTimeout(t)
    }
    const finish = setTimeout(() => navigate('/dashboard'), 600)
    return () => clearTimeout(finish)
  }, [i, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-[var(--navyM)] p-8 rounded text-center">
        <div className="mb-6"><div className="w-20 h-20 rounded-full bg-[var(--teal)] inline-block pulse-ring"></div></div>
        <h2 className="text-xl font-bold mb-4">Building your profile</h2>
        <ul className="text-left space-y-2">
          {steps.map((s, idx) => (
            <li key={s} className={`flex items-center gap-2 ${idx < i ? 'opacity-80':'opacity-50'}`}>
              <span className={`inline-block w-5 h-5 rounded-full ${idx < i ? 'bg-[var(--teal)]':'bg-[var(--gray)]'}`}>{idx < i ? '✓':''}</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
