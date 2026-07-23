'use client'

import Link from 'next/link'
import { Mail, Phone, ChevronRight } from 'lucide-react'

type Contact = {
  id: string; first_name: string; last_name: string | null
  email: string | null; phone: string | null
  tags: string[] | null; status?: string; created_at: string
}

function initials(c: Contact) {
  return `${c.first_name[0]}${c.last_name?.[0] ?? ''}`.toUpperCase()
}

const STATUS: Record<string, { color: string; bg: string; dot: string; label: string }> = {
  lead:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  dot: '#f59e0b', label: 'Lead'     },
  active:   { color: '#10b981', bg: 'rgba(16,185,129,0.12)', dot: '#10b981', label: 'Active'   },
  inactive: { color: '#2a52a0', bg: 'rgba(42,82,160,0.12)',  dot: '#2a52a0', label: 'Inactive' },
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#2a52a0,#4a9db5)',
  'linear-gradient(135deg,#10b981,#059669)',
  'linear-gradient(135deg,#f97316,#ea580c)',
  'linear-gradient(135deg,#0ea5e9,#0284c7)',
  'linear-gradient(135deg,#a855f7,#7c3aed)',
  'linear-gradient(135deg,#ec4899,#be185d)',
]

export function ContactList({ contacts }: { contacts: Contact[] }) {
  if (contacts.length === 0) {
    return (
      <div style={{
        background: 'hsl(var(--card))', borderRadius: '16px',
        border: '1px solid hsl(var(--border))',
        padding: '48px 24px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>👥</div>
        <p style={{ fontSize: '15px', fontWeight: 600, color: 'hsl(var(--foreground))', marginBottom: '4px' }}>No contacts yet</p>
        <p style={{ fontSize: '15px', color: 'hsl(var(--muted-foreground))' }}>Add your first contact to get started.</p>
      </div>
    )
  }

  return (
    <div style={{ background: 'hsl(var(--card))', borderRadius: '16px', border: '1px solid hsl(var(--border))', overflow: 'hidden' }}>
      {/* Table header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '48px 1fr 1fr 1fr 100px 20px',
        gap: '12px',
        padding: '10px 20px',
        borderBottom: '1px solid hsl(var(--border))',
        background: 'hsl(var(--muted))',
      }} className="hidden sm:grid">
        {['', 'Name', 'Email', 'Phone', 'Status', ''].map((h, i) => (
          <span key={i} style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))' }}>
            {h}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {contacts.map((contact, i) => {
          const st = STATUS[contact.status ?? ''] ?? { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', dot: '#94a3b8', label: contact.status ?? '' }
          const grad = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]

          return (
            <Link
              key={contact.id}
              href={`/contacts/${contact.id}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '48px 1fr',
                gap: '12px',
                padding: '14px 20px',
                alignItems: 'center',
                borderBottom: i < contacts.length - 1 ? '1px solid hsl(var(--border))' : 'none',
                textDecoration: 'none',
                transition: 'background .12s',
              }}
              className="hover:bg-[hsl(var(--muted))] sm:grid-cols-[48px_1fr_1fr_1fr_100px_20px]"
            >
              {/* Avatar */}
              <div style={{
                width: '38px', height: '38px', borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '15px', fontWeight: 900, color: '#fff', flexShrink: 0,
                background: grad,
              }}>
                {initials(contact)}
              </div>

              {/* Name + tags */}
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '15px', fontWeight: 700, color: 'hsl(var(--foreground))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {contact.first_name} {contact.last_name}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                  {/* Mobile: show email inline */}
                  {contact.email && (
                    <span className="sm:hidden" style={{ fontSize: '15px', color: 'hsl(var(--muted-foreground))' }}>{contact.email}</span>
                  )}
                  {contact.tags?.slice(0, 2).map(tag => (
                    <span key={tag} style={{ fontSize: '15px', fontWeight: 600, padding: '2px 8px', borderRadius: '99px', background: 'rgba(74,157,181,0.1)', color: '#4a9db5', border: '1px solid rgba(74,157,181,0.2)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Email — desktop */}
              <div className="hidden sm:flex" style={{ alignItems: 'center', gap: '6px', minWidth: 0 }}>
                {contact.email
                  ? <><Mail style={{ width: '13px', height: '13px', color: 'hsl(var(--muted-foreground))', flexShrink: 0 }} /><span style={{ fontSize: '15px', color: 'hsl(var(--muted-foreground))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contact.email}</span></>
                  : <span style={{ fontSize: '15px', color: 'hsl(var(--muted-foreground))', opacity: 0.4 }}>—</span>}
              </div>

              {/* Phone — desktop */}
              <div className="hidden sm:flex" style={{ alignItems: 'center', gap: '6px' }}>
                {contact.phone
                  ? <><Phone style={{ width: '13px', height: '13px', color: 'hsl(var(--muted-foreground))', flexShrink: 0 }} /><span style={{ fontSize: '15px', color: 'hsl(var(--muted-foreground))' }}>{contact.phone}</span></>
                  : <span style={{ fontSize: '15px', color: 'hsl(var(--muted-foreground))', opacity: 0.4 }}>—</span>}
              </div>

              {/* Status badge — desktop */}
              <div className="hidden sm:flex">
                {contact.status && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    fontSize: '15px', fontWeight: 700,
                    padding: '4px 10px', borderRadius: '99px',
                    background: st.bg, color: st.color,
                    border: `1px solid ${st.color}30`,
                    textTransform: 'capitalize',
                    letterSpacing: '0.01em',
                  }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: st.dot, flexShrink: 0 }} />
                    {st.label}
                  </span>
                )}
              </div>

              {/* Chevron */}
              <div className="hidden sm:flex" style={{ justifyContent: 'flex-end' }}>
                <ChevronRight style={{ width: '15px', height: '15px', color: 'hsl(var(--muted-foreground))', opacity: 0.4 }} />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
