import { useEffect, useRef, useState } from 'react'

type AnimatedValues = {
  income: number
  saving: number
  surplus: number
}

type PressureState = { label: string; color: 'green' | 'amber' | 'red' | 'teal' }

function toNumber(v: any): number {
  if (v == null) return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function mapPressure(raw: any): PressureState {
  if (typeof raw === 'string') {
    const s = raw.toLowerCase()
    if (s.includes('develop')) return { label: 'Developing', color: 'amber' }
    if (s.includes('low') || s.includes('good')) return { label: 'Low', color: 'green' }
    if (s.includes('high')) return { label: 'High', color: 'red' }
    return { label: raw, color: 'amber' }
  }
  const v = Number(raw)
  if (Number.isNaN(v)) return { label: 'Unknown', color: 'amber' }
  if (v >= 7) return { label: 'High', color: 'red' }
  if (v >= 4) return { label: 'Moderate', color: 'amber' }
  return { label: 'Low', color: 'green' }
}

export default function useCyclingStats(apiData?: any, forceDemo = false) {
  const [values, setValues] = useState<AnimatedValues>({ income: 100000, saving: 30000, surplus: 30000 })
  const [demoScenario, setDemoScenario] = useState<any | null>(null)
  const [trends, setTrends] = useState<{ income: number; saving: number; surplus: number }>({ income: 0, saving: 0, surplus: 0 })
  const refs = useRef<AnimatedValues>({ income: 150000, saving: 30000, surplus: 30000 })
    const rafRef = useRef<number | null>(null)
    const intervalRef = useRef<any>(null)
    const scenIndex = useRef(0)

  // Scenarios cycle sequence: 100k -> 200k -> 50k -> 500k
  const scenarios = [
    { income: 100000, saving: 30000, surplus: 30000, pressure: 'Moderate', investment: 'Developing', priority: 'Build an emergency fund' },
    { income: 200000, saving: 10000, surplus: 5000, pressure: 'High', investment: 'Developing', priority: 'Build an emergency fund' },
    { income: 50000, saving: 2000, surplus: 0, pressure: 'High', investment: 'Developing', priority: 'Reduce recurring expenses' },
    { income: 500000, saving: 150000, surplus: 200000, pressure: 'Low', investment: 'Ready', priority: 'Start investing' },
  ]

  useEffect(() => {
    let mounted = true

    function animateTo(key: keyof AnimatedValues, to: number, duration = 1400) {
      const from = refs.current[key] ?? 0
      const direction = to > from ? 1 : to < from ? -1 : 0
      setTrends((p) => ({ ...p, [key]: direction }))
      const start = performance.now()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration)
        const eased = 1 - Math.pow(1 - t, 3)
        const val = Math.round(from + (to - from) * eased)
        refs.current[key] = val
        if (!mounted) return
        setValues((p) => ({ ...p, [key]: val }))
        if (t < 1) rafRef.current = requestAnimationFrame(step)
      }
      rafRef.current = requestAnimationFrame(step)
    }

    const metrics = apiData?.metrics ?? apiData?.summary?.high_level ?? {}

    const useApi = !!apiData && !forceDemo
    if (useApi) {
      // live API values: animate towards them and then gently jitter
      const income = toNumber(apiData.income ?? metrics.monthly_income ?? metrics.disposable_income ?? refs.current.income)
      let saving = toNumber(metrics.savings_rate ?? apiData.saving ?? refs.current.saving)
      if (saving > 0 && saving <= 1) saving = Math.round(income * saving)
      const surplus = Number(
        metrics.disposable_income != null && metrics.estimated_monthly_expenses != null
          ? metrics.disposable_income - metrics.estimated_monthly_expenses
          : apiData.surplus ?? refs.current.surplus
      )

      setDemoScenario(null)
      animateTo('income', income)
      animateTo('saving', saving)
      animateTo('surplus', surplus)

      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => {
        const jitter = (v: number) => Math.round(v * (1 + (Math.random() * 0.02 - 0.01)))
        animateTo('income', jitter(refs.current.income))
        animateTo('saving', jitter(refs.current.saving))
        animateTo('surplus', jitter(refs.current.surplus))
      }, 5000)
    } else {
      // offline/demo: cycle through explicit scenarios the user requested
      scenIndex.current = 0
      const applyScenario = (s: any) => {
        setDemoScenario(s)
        animateTo('income', toNumber(s.income))
        animateTo('saving', toNumber(s.saving))
        animateTo('surplus', toNumber(s.surplus))
      }

      applyScenario(scenarios[scenIndex.current])
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => {
        scenIndex.current = (scenIndex.current + 1) % scenarios.length
        applyScenario(scenarios[scenIndex.current])
      }, 5200)
    }

    return () => {
      mounted = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [apiData])

  return { values, getPressureState: mapPressure, demoScenario, trends }
}
