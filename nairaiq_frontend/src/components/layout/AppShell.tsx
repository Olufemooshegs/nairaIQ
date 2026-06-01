import React from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

const AppShell: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 hidden md:block bg-[var(--navyM)] p-4">
        <Sidebar />
      </aside>
      <div className="flex-1 min-h-screen flex flex-col">
        <TopBar />
        <main className="p-6 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

export default AppShell
