import { useEffect, useRef, useState } from 'react'

export default function useAnimatedNumber(target: number, opts: { duration?: number } = {}) {
  const { duration = 800 } = opts
  const [value, setValue] = useState<number>(target)
  const raf = useRef<number | null>(null)
  const start = useRef<number | null>(null)
  const from = useRef<number>(target)

  useEffect(() => {
    from.current = value
    const diff = target - from.current
    if (diff === 0) return
    start.current = null
    const step = (timestamp: number) => {
      if (!start.current) start.current = timestamp
      const elapsed = timestamp - (start.current || 0)
      const t = Math.min(1, elapsed / duration)
      const eased = t // linear for now; could use easing
      setValue(Math.round(from.current + diff * eased))
      if (t < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target, duration])

  return value
}
