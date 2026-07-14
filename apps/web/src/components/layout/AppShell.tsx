'use client'

import { useState } from 'react'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'
import { CommandPalette } from './CommandPalette'
import { useTheme } from '@/hooks/useTheme'
import { DEFAULT_SETTINGS, type TenantSettings } from '@/lib/types/settings'

export function AppShell({
  children,
  isAdmin = false,
  settings = DEFAULT_SETTINGS,
  userInitial = 'U',
  welcomeBanner = null,
}: {
  children:       React.ReactNode
  isAdmin?:       boolean
  settings?:      TenantSettings
  userInitial?:   string
  welcomeBanner?: React.ReactNode
}) {
  const [cmdOpen, setCmdOpen] = useState(false)
  const { dark, toggle } = useTheme()

  return (
    <div className="flex flex-col h-screen bg-[hsl(var(--background))] overflow-hidden">
      <TopBar
        onOpenCmd={() => setCmdOpen(true)}
        dark={dark}
        onToggleDark={toggle}
        userInitial={userInitial}
        settings={settings}
        isAdmin={isAdmin}
      />

      <div className="flex-1 overflow-y-auto">
        {welcomeBanner}
        <div className="p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </div>
      </div>

      <BottomNav settings={settings} />

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} isAdmin={isAdmin} />
    </div>
  )
}
