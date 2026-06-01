import React from 'react'
import { useAuthStore } from '../../store/auth.store'

export default function TopBar() {
  const logout = useAuthStore(state => state.logout)
  const user = useAuthStore(state => state.user)
  return (
    <header className="flex items-center justify-between p-4 bg-[var(--navyL)]">
      <div className="flex items-center gap-4">
        <div className="font-bold">NairaIQ</div>
        <div className="text-sm text-[var(--gray)]">Analytics</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-[var(--gray)]">{user?.email ?? ''}</div>
        <button onClick={logout} className="px-3 py-1 rounded bg-[var(--teal)] text-black">Logout</button>
      </div>
    </header>
  )
}
