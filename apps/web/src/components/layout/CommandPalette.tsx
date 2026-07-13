'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Users, Calendar, FileText, Settings } from 'lucide-react'

const commands = [
  { label: 'Contacts', href: '/contacts', icon: Users },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { label: 'Templates', href: '/templates', icon: FileText },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'New contact', href: '/contacts/new', icon: Users },
]

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()),
  )

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (!open) return
        onClose()
      }
      if (e.key === 'Escape') onClose()
    },
    [open, onClose],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[hsl(var(--muted))] rounded-2xl shadow-card overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[hsl(var(--border))]">
          <Search className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search or jump to…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[hsl(var(--muted-foreground))]"
          />
        </div>
        <ul className="py-2">
          {filtered.map(({ label, href, icon: Icon }) => (
            <li key={href}>
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[hsl(var(--muted))] transition-colors text-left"
                onClick={() => { router.push(href); onClose() }}
              >
                <Icon className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                {label}
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">No results</li>
          )}
        </ul>
      </div>
    </div>
  )
}
