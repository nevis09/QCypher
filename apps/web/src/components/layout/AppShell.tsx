'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'
import { CommandPalette } from './CommandPalette'

export function AppShell({ children, isAdmin = false }: { children: React.ReactNode; isAdmin?: boolean }) {
  const [cmdOpen, setCmdOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[hsl(var(--background))] overflow-hidden">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar isAdmin={isAdmin} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onOpenCmd={() => setCmdOpen(true)} />
        {/* pb-16 on mobile so content clears the bottom nav */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} isAdmin={isAdmin} />
    </div>
  )
}
