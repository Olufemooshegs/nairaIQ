import React from 'react'
import useAnimatedNumber from '../../hooks/useAnimatedNumber'

export default function NairaValue({ value = 0, duration = 800 }: { value?: number; duration?: number }) {
  const animated = useAnimatedNumber(value, { duration })
  const formatted = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(animated)
  return <span className="naira countup">{formatted}</span>
}
