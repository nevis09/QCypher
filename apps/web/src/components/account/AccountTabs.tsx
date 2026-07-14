'use client'

import { useState } from 'react'

type Tab = 'profile' | 'security'

export function AccountTabs({ profile, security }: {
  profile:  React.ReactNode
  security: React.ReactNode
}) {
  const [tab, setTab] = useState<Tab>('profile')

  return (
    <div className="space-y-6">
      <div className="flex gap-1 p-1 rounded-2xl w-fit"
        style={{ background: 'hsl(var(--muted))' }}>
        {(['profile', 'security'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-5 py-1.5 rounded-xl text-[15px] font-bold capitalize transition-all"
            style={{
              background:  tab === t ? 'hsl(var(--card))' : 'transparent',
              color:       tab === t ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
              boxShadow:   tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'profile'  && profile}
      {tab === 'security' && security}
    </div>
  )
}
