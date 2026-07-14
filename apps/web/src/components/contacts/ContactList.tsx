'use client'

import Link from 'next/link'

type Contact = {
  id: string; first_name: string; last_name: string | null
  email: string | null; phone: string | null
  tags: string[] | null; status?: string; created_at: string
}

function initials(c: Contact) {
  return `${c.first_name[0]}${c.last_name?.[0] ?? ''}`.toUpperCase()
}

const STATUS: Record<string, { bg: string; color: string; dot: string }> = {
  lead:     { bg: 'var(--badge-lead-bg)',     color: 'var(--badge-lead-text)',     dot: '#f59e0b' },
  active:   { bg: 'var(--badge-active-bg)',   color: 'var(--badge-active-text)',   dot: '#10b981' },
  inactive: { bg: 'var(--badge-inactive-bg)', color: 'var(--badge-inactive-text)', dot: '#6366f1' },
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#6366f1,#8b5cf6)',
  'linear-gradient(135deg,#10b981,#059669)',
  'linear-gradient(135deg,#f97316,#ea580c)',
  'linear-gradient(135deg,#0ea5e9,#0284c7)',
  'linear-gradient(135deg,#a855f7,#7c3aed)',
  'linear-gradient(135deg,#ec4899,#be185d)',
]

export function ContactList({ contacts }: { contacts: Contact[] }) {
  if (contacts.length === 0) {
    return (
      <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-14 text-center shadow-card">
        <p className="text-[15px] font-semibold" style={{ color: 'hsl(var(--muted-foreground))' }}>
          No contacts yet. Add your first one.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] shadow-card overflow-hidden">
      {/* Header row */}
      <div className="hidden sm:grid grid-cols-[44px_1fr_1fr_1fr_120px] gap-4 px-5 py-3 border-b border-[hsl(var(--border))]"
        style={{ background: 'hsl(var(--muted))' }}>
        {['', 'Name', 'Email', 'Phone', 'Status'].map(h => (
          <span key={h} className="text-[15px] font-black uppercase tracking-widest"
            style={{ color: 'hsl(var(--muted-foreground))' }}>{h}</span>
        ))}
      </div>

      <div className="divide-y divide-[hsl(var(--border))]">
        {contacts.map((contact, i) => {
          const st = STATUS[contact.status ?? ''] ?? { bg: 'var(--badge-inactive-bg)', color: 'var(--badge-inactive-text)', dot: '#94a3b8' }
          const grad = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]
          return (
            <Link
              key={contact.id}
              href={`/contacts/${contact.id}`}
              className="grid sm:grid-cols-[44px_1fr_1fr_1fr_120px] gap-4 px-5 py-3.5 items-center hover:bg-[hsl(var(--muted))] transition-colors min-h-[60px]"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[15px] font-black text-white flex-shrink-0"
                style={{ background: grad }}>
                {initials(contact)}
              </div>

              <div className="min-w-0">
                <p className="text-[15px] font-bold truncate" style={{ color: 'hsl(var(--foreground))' }}>
                  {contact.first_name} {contact.last_name}
                </p>
                {contact.tags && contact.tags.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {contact.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[15px] px-2 py-0.5 rounded-full font-bold"
                        style={{ background: 'var(--badge-tag-bg)', color: 'var(--badge-tag-text)' }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-[15px] font-medium truncate hidden sm:block" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {contact.email ?? '—'}
              </p>
              <p className="text-[15px] font-medium hidden sm:block" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {contact.phone ?? '—'}
              </p>

              {contact.status && (
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[15px] font-black px-2.5 py-1.5 rounded-full capitalize w-fit"
                  style={{ background: st.bg, color: st.color }}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: st.dot }} />
                  {contact.status}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
