'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Search } from 'lucide-react'
import { ContactList } from './ContactList'
import type { Tables } from '@/types/database'

type Contact = Pick<Tables<'contacts'>, 'id' | 'first_name' | 'last_name' | 'email' | 'phone' | 'tags' | 'status' | 'created_at'>

const STATUS_FILTERS = [
  { value: 'all',      label: 'All'      },
  { value: 'lead',     label: 'Leads'    },
  { value: 'active',   label: 'Active'   },
  { value: 'inactive', label: 'Inactive' },
]

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  all:      { color: '#4a9db5', bg: 'rgba(74,157,181,0.12)' },
  lead:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  active:   { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  inactive: { color: '#2a52a0', bg: 'rgba(42,82,160,0.12)'  },
}

export function ContactListWithSearch({ contacts }: { contacts: Contact[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const q = searchParams.get('q') ?? ''
  const status = searchParams.get('status') ?? 'all'

  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') { params.set(key, value) } else { params.delete(key) }
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }, [pathname, router, searchParams])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Search + filter row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'hsl(var(--muted-foreground))', pointerEvents: 'none' }} />
          <input
            type="search"
            defaultValue={q}
            onChange={e => updateParam('q', e.target.value)}
            placeholder="Search by name, email, phone…"
            style={{
              width: '100%',
              paddingLeft: '42px', paddingRight: '16px', paddingTop: '10px', paddingBottom: '10px',
              fontSize: '15px', fontWeight: 500,
              borderRadius: '12px',
              border: '1px solid hsl(var(--border))',
              background: 'hsl(var(--card))',
              color: 'hsl(var(--foreground))',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Status filter pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map(f => {
            const on = status === f.value
            const { color, bg } = STATUS_COLORS[f.value]
            return (
              <button
                key={f.value}
                onClick={() => updateParam('status', f.value)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '99px',
                  fontSize: '15px',
                  fontWeight: on ? 700 : 500,
                  border: `1px solid ${on ? color + '50' : 'hsl(var(--border))'}`,
                  background: on ? bg : 'transparent',
                  color: on ? color : 'hsl(var(--muted-foreground))',
                  cursor: 'pointer',
                  transition: 'all .15s',
                  letterSpacing: on ? '0.01em' : '0',
                }}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      <ContactList contacts={contacts} />
    </div>
  )
}
