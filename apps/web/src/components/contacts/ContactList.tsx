'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

type Contact = {
  id: string
  first_name: string
  last_name: string | null
  email: string | null
  phone: string | null
  tags: string[] | null
  created_at: string
}

function initials(c: Contact) {
  return `${c.first_name[0]}${c.last_name?.[0] ?? ''}`.toUpperCase()
}

export function ContactList({ contacts }: { contacts: Contact[] }) {
  if (contacts.length === 0) {
    return (
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-white dark:bg-[hsl(var(--muted))] p-12 text-center">
        <p className="text-[hsl(var(--muted-foreground))] text-sm">No contacts yet. Add your first one.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-white dark:bg-[hsl(var(--muted))] overflow-hidden shadow-soft divide-y divide-[hsl(var(--border))]">
      {contacts.map(contact => (
        <Link
          key={contact.id}
          href={`/contacts/${contact.id}`}
          className="flex items-center gap-4 px-5 py-3.5 hover:bg-[hsl(var(--muted))] transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {initials(contact)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {contact.first_name} {contact.last_name}
            </p>
            {contact.email && (
              <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{contact.email}</p>
            )}
          </div>
          {contact.phone && (
            <span className="text-xs text-[hsl(var(--muted-foreground))] flex-shrink-0 hidden sm:block">{contact.phone}</span>
          )}
          {contact.tags && contact.tags.length > 0 && (
            <div className="flex gap-1 flex-shrink-0">
              {contact.tags.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium',
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </Link>
      ))}
    </div>
  )
}
