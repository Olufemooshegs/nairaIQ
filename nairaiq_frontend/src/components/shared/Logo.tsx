import React from 'react'

export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size }} className="rounded-full bg-[var(--navyL)] flex items-center justify-center text-[var(--teal)] font-bold">IQ</div>
  )
}
