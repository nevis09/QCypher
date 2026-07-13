'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Search } from 'lucide-react'
import { ContactList } from './ContactList'
import type { Tables } from '@/types/database'
import { cn } from '@/lib/utils'

type Contact = Pick<Tables<'contacts'>, 'id' | 'first_name' | 'last_name' | 'email' | 'phone' | 'tags' | 'status' | 'created_at'>

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'lead', label: 'Leads' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
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
      {/* Search + filter bar — stacks on mobile */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="search"
            defaultValue={q}
            onChange={e => updateParam('q', e.target.value)}
            placeholder="Search by name, email, phone…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[hsl(var(--border))] bg-white dark:bg-[hsl(var(--muted))] outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>
        <div className="flex gap-1 bg-[hsl(var(--muted))] rounded-xl p-1 overflow-x-auto flex-shrink-0">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => updateParam('status', f.value)}
              className={cn(
                'text-xs font-medium px-3 py-1.5 rounded-lg transition-colors',
                status === f.value
                  ? 'bg-white dark:bg-[hsl(var(--background))] shadow-soft text-[hsl(var(--foreground))]'
                  : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <ContactList contacts={contacts} />
    </div>
  )
}
