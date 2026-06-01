import React from 'react'

export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size }} className="rounded-full bg-[var(--teal)] flex items-center justify-center text-black font-bold">IQ</div>
  )
}
