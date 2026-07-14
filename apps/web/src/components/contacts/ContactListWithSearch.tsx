'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Search } from 'lucide-react'
import { ContactList } from './ContactList'
import type { Tables } from '@/types/database'

type Contact = Pick<Tables<'contacts'>, 'id' | 'first_name' | 'last_name' | 'email' | 'phone' | 'tags' | 'status' | 'created_at'>

const STATUS_FILTERS = [
  { value: 'all',      label: 'All',      color: '#6366f1', bg: '#eef2ff' },
  { value: 'lead',     label: 'Leads',    color: '#92400e', bg: '#fef3c7' },
  { value: 'active',   label: 'Active',   color: '#065f46', bg: '#d1fae5' },
  { value: 'inactive', label: 'Inactive', color: '#3730a3', bg: '#e0e7ff' },
]

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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
          <input
            type="search"
            defaultValue={q}
            onChange={e => updateParam('q', e.target.value)}
            placeholder="Search by name, email, phone…"
            className="w-full pl-10 pr-4 py-2.5 text-[15px] font-medium rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
            style={{ color: 'hsl(var(--foreground))' }}
          />
        </div>

        {/* Status filters */}
        <div className="flex gap-1.5 flex-shrink-0 flex-wrap">
          {STATUS_FILTERS.map(f => {
            const isActive = status === f.value
            return (
              <button
                key={f.value}
                onClick={() => updateParam('status', f.value)}
                className="text-[15px] font-black px-3.5 py-2 rounded-xl transition-all border"
                style={{
                  background: isActive ? f.bg : 'white',
                  color: isActive ? f.color : 'hsl(var(--muted-foreground))',
                  borderColor: isActive ? f.color + '55' : 'hsl(var(--border))',
                  boxShadow: isActive ? `0 0 0 2px ${f.color}22` : 'none',
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
