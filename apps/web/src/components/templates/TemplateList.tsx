'use client'

import Link from 'next/link'
import { Mail, MessageSquare, ArrowRight } from 'lucide-react'
import type { Tables } from '@/types/database'

type Template = Tables<'templates'>

export function TemplateList({ templates }: { templates: Template[] }) {
  if (templates.length === 0) {
    return (
      <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-14 text-center shadow-card">
        <p className="text-[15px] font-semibold" style={{ color: 'hsl(var(--muted-foreground))' }}>
          No templates yet. Create your first quick-reply.
        </p>
      </div>
    )
  }

  const emails = templates.filter(t => t.channel === 'email')
  const sms    = templates.filter(t => t.channel === 'sms')

  return (
    <div className="space-y-8">
      {emails.length > 0 && <Section label="Email Templates" templates={emails} />}
      {sms.length > 0    && <Section label="SMS Templates"   templates={sms} />}
    </div>
  )
}

function Section({ label, templates }: { label: string; templates: Template[] }) {
  const isEmail = templates[0]?.channel === 'email'
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-4 px-1">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ background: isEmail ? 'var(--badge-violet-bg)' : 'var(--badge-sky-bg)' }}>
          {isEmail
            ? <Mail className="w-3.5 h-3.5" style={{ color: '#7c3aed' }} />
            : <MessageSquare className="w-3.5 h-3.5" style={{ color: '#1d4ed8' }} />}
        </div>
        <h2 className="text-[15px] font-black uppercase tracking-widest" style={{ color: 'hsl(var(--muted-foreground))' }}>{label}</h2>
        <span className="text-[15px] font-black px-2 py-0.5 rounded-full"
          style={{ background: isEmail ? '#f5f3ff' : '#eff6ff', color: isEmail ? '#7c3aed' : '#1d4ed8' }}>
          {templates.length}
        </span>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {templates.map(t => <TemplateCard key={t.id} template={t} />)}
      </div>
    </div>
  )
}

function TemplateCard({ template: t }: { template: Template }) {
  const isEmail = t.channel === 'email'
  const theme = isEmail
    ? { iconBg: '#f5f3ff', iconColor: '#7c3aed', badgeBg: '#ede9fe', badgeColor: '#5b21b6', border: '#ddd6fe', headerBg: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }
    : { iconBg: '#eff6ff', iconColor: '#1d4ed8', badgeBg: '#dbeafe', badgeColor: '#1e40af', border: '#bfdbfe', headerBg: 'linear-gradient(135deg,#2563eb,#1d4ed8)' }

  return (
    <Link
      href={`/templates/${t.id}`}
      className="rounded-2xl border overflow-hidden shadow-soft hover:shadow-card transition-all hover:-translate-y-0.5 group flex flex-col bg-[hsl(var(--card))]"
      style={{ borderColor: theme.border }}
    >
      {/* Colored header strip */}
      <div className="px-4 py-3 flex items-center gap-2.5" style={{ background: theme.headerBg }}>
        <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
          {isEmail
            ? <Mail className="w-3.5 h-3.5 text-white" />
            : <MessageSquare className="w-3.5 h-3.5 text-white" />}
        </div>
        <p className="text-[15px] font-bold text-white truncate flex-1">{t.name}</p>
        <ArrowRight className="w-3.5 h-3.5 text-white/60 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </div>

      {/* Body */}
      <div className="px-4 py-3 flex-1 flex flex-col gap-2">
        {t.subject && (
          <p className="text-[15px] font-bold truncate" style={{ color: 'hsl(var(--foreground))' }}>
            {t.subject}
          </p>
        )}
        <p className="text-[15px] leading-relaxed line-clamp-3 flex-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {t.body}
        </p>
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t flex items-center justify-between" style={{ borderColor: theme.border, background: theme.badgeBg + '55' }}>
        <span className="text-[15px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full"
          style={{ background: theme.badgeBg, color: theme.badgeColor }}>
          {t.channel}
        </span>
        <span className="text-[15px] font-semibold" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {new Date(t.created_at).toLocaleDateString()}
        </span>
      </div>
    </Link>
  )
}
