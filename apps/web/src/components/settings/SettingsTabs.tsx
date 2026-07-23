'use client'

import { useState } from 'react'
import { Sun, Blocks, Zap, Users, User, Shield, LogOut } from 'lucide-react'

const TABS = [
  { id: 'workspace', label: 'Workspace', icon: Blocks },
  { id: 'team',      label: 'Team',      icon: Users  },
  { id: 'account',   label: 'Account',   icon: User   },
] as const

type TabId = typeof TABS[number]['id']

type Props = {
  workspaceContent: React.ReactNode
  teamContent: React.ReactNode
  accountContent: React.ReactNode
}

export function SettingsTabs({ workspaceContent, teamContent, accountContent }: Props) {
  const [active, setActive] = useState<TabId>('workspace')

  const content = { workspace: workspaceContent, team: teamContent, account: accountContent }

  return (
    <div>
      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: '4px',
        borderBottom: '1px solid hsl(var(--border))',
        marginBottom: '32px',
      }}>
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '10px 16px',
                fontSize: '14px', fontWeight: isActive ? 700 : 500,
                color: isActive ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: isActive ? '2px solid #2a52a0' : '2px solid transparent',
                marginBottom: '-1px',
                transition: 'color 0.15s',
              }}
            >
              <Icon style={{ width: '15px', height: '15px', flexShrink: 0 }} />
              {label}
            </button>
          )
        })}
      </div>

      {/* Active tab content */}
      <div>{content[active]}</div>
    </div>
  )
}

// Section wrapper used inside each tab
export function SettingsSection({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '36px' }}>
      <div style={{ marginBottom: '12px', paddingLeft: '2px' }}>
        <p style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))' }}>
          {label}
        </p>
        {hint && (
          <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginTop: '3px' }}>{hint}</p>
        )}
      </div>
      {children}
    </div>
  )
}
