export function formatNaira(n: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n)
}

export function formatPercent(n: number) {
  return `${Math.round(n)}%`
}
