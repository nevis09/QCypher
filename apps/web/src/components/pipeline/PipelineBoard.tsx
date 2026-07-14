'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

type Contact = {
  id: string; first_name: string; last_name: string | null
  email: string | null; phone: string | null; company: string | null
  tags: string[] | null; status: string; created_at: string
}

const STAGES = [
  {
    key: 'lead',
    label: 'Leads',
    headerGrad: 'linear-gradient(135deg,#f59e0b,#d97706)',
    colBg: 'var(--badge-lead-bg)',
    colBorder: 'var(--badge-lead-text)',
    badgeBg: 'var(--badge-lead-bg)', badgeColor: 'var(--badge-lead-text)', badgeDot: '#f59e0b',
    avatarGrad: 'linear-gradient(135deg,#f59e0b,#d97706)',
  },
  {
    key: 'active',
    label: 'Active',
    headerGrad: 'linear-gradient(135deg,#10b981,#059669)',
    colBg: 'var(--badge-active-bg)',
    colBorder: 'var(--badge-active-text)',
    badgeBg: 'var(--badge-active-bg)', badgeColor: 'var(--badge-active-text)', badgeDot: '#10b981',
    avatarGrad: 'linear-gradient(135deg,#10b981,#059669)',
  },
  {
    key: 'inactive',
    label: 'Inactive',
    headerGrad: 'linear-gradient(135deg,#6366f1,#4f46e5)',
    colBg: 'var(--badge-indigo-bg)',
    colBorder: 'var(--badge-indigo-text)',
    badgeBg: 'var(--badge-indigo-bg)', badgeColor: 'var(--badge-indigo-text)', badgeDot: '#6366f1',
    avatarGrad: 'linear-gradient(135deg,#6366f1,#4f46e5)',
  },
] as const

function initials(c: Contact) {
  return `${c.first_name[0]}${c.last_name?.[0] ?? ''}`.toUpperCase()
}

function ContactCard({ contact, stage }: { contact: Contact; stage: typeof STAGES[number] }) {
  const router = useRouter()
  const supabase = createClient()

  async function moveTo(status: string) {
    await supabase.from('contacts').update({ status: status as 'lead' | 'active' | 'inactive' }).eq('id', contact.id)
    router.refresh()
  }

  const others = STAGES.filter(s => s.key !== contact.status)

  return (
    <div className="bg-[hsl(var(--card))] rounded-xl shadow-soft border overflow-hidden group transition-all hover:shadow-card hover:-translate-y-0.5"
      style={{ borderColor: stage.colBorder }}>
      <div className="p-3.5">
        <div className="flex items-start gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[15px] font-black text-white flex-shrink-0 mt-0.5"
            style={{ background: stage.avatarGrad }}>
            {initials(contact)}
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/contacts/${contact.id}`}
              className="text-[15px] font-bold hover:text-indigo-600 transition-colors truncate block"
              style={{ color: 'hsl(var(--foreground))' }}>
              {contact.first_name} {contact.last_name}
            </Link>
            {contact.company && (
              <p className="text-[15px] font-semibold truncate mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {contact.company}
              </p>
            )}
            {contact.email && (
              <p className="text-[15px] font-medium truncate" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {contact.email}
              </p>
            )}
          </div>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: 'hsl(var(--muted-foreground))' }} />
        </div>

        {contact.tags && contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {contact.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[15px] px-1.5 py-0.5 rounded-full font-bold"
                style={{ background: stage.badgeBg, color: stage.badgeColor }}>{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Move buttons on hover */}
      <div className="hidden group-hover:flex border-t gap-px" style={{ borderColor: stage.colBorder, background: stage.colBg }}>
        {others.map(s => (
          <button key={s.key} onClick={() => moveTo(s.key)}
            className="flex-1 text-[15px] font-black py-2 transition-opacity hover:opacity-80"
            style={{ color: s.badgeColor }}>
            → {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function PipelineBoard({ contacts }: { contacts: Contact[] }) {
  const grouped = STAGES.map(stage => ({
    ...stage,
    contacts: contacts.filter(c => c.status === stage.key),
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-6">
      {grouped.map(stage => (
        <div key={stage.key} className="flex flex-col gap-3 min-h-[400px]">
          {/* Column header — gradient pill */}
          <div className="rounded-2xl px-4 py-3 flex items-center justify-between"
            style={{ background: stage.headerGrad }}>
            <p className="text-[15px] font-black text-white">{stage.label}</p>
            <span className="text-[15px] font-black px-2.5 py-1 rounded-full bg-white/20 text-white">
              {stage.contacts.length}
            </span>
          </div>

          {/* Cards column */}
          <div className="flex flex-col gap-2.5 flex-1 rounded-2xl p-3"
            style={{ background: stage.colBg }}>
            {stage.contacts.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[15px] font-semibold" style={{ color: stage.badgeColor, opacity: 0.6 }}>No contacts</p>
              </div>
            ) : (
              stage.contacts.map(c => <ContactCard key={c.id} contact={c} stage={stage} />)
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
