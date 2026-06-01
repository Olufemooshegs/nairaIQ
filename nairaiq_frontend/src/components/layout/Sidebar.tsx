import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  return (
    <nav className="flex flex-col gap-3">
      <NavLink to="/dashboard" className={({isActive}) => `px-3 py-2 rounded ${isActive ? 'bg-[var(--teal)] text-black' : 'text-white/80'}`}>Dashboard</NavLink>
      <NavLink to="/history" className={({isActive}) => `px-3 py-2 rounded ${isActive ? 'bg-[var(--teal)] text-black' : 'text-white/80'}`}>History</NavLink>
      <NavLink to="/trends" className={({isActive}) => `px-3 py-2 rounded ${isActive ? 'bg-[var(--teal)] text-black' : 'text-white/80'}`}>Trends</NavLink>
    </nav>
  )
}
