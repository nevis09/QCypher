'use client'

import Link from 'next/link'
import { Mail, MessageSquare } from 'lucide-react'
import type { Tables } from '@/types/database'

type Template = Tables<'templates'>

export function TemplateList({ templates }: { templates: Template[] }) {
  if (templates.length === 0) {
    return (
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-white dark:bg-[hsl(var(--muted))] p-12 text-center">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">No templates yet. Create your first quick-reply.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-white dark:bg-[hsl(var(--muted))] overflow-hidden shadow-soft divide-y divide-[hsl(var(--border))]">
      {templates.map(t => (
        <Link key={t.id} href={`/templates/${t.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[hsl(var(--muted))] transition-colors">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            t.channel === 'email'
              ? 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400'
              : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
          }`}>
            {t.channel === 'email' ? <Mail className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{t.name}</p>
            {t.subject && <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{t.subject}</p>}
          </div>
          <span className="text-xs text-[hsl(var(--muted-foreground))] flex-shrink-0 capitalize">{t.channel}</span>
        </Link>
      ))}
    </div>
  )
}
