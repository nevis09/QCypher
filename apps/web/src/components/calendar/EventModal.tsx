'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { X, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/database'

type CalEvent = Pick<Tables<'events'>, 'id' | 'title' | 'description' | 'starts_at' | 'ends_at' | 'contact_id'>

function toInputDateTime(iso: string) {
  return iso.slice(0, 16)
}

function toISO(local: string) {
  return new Date(local).toISOString()
}

export function EventModal({ date, event, onClose }: {
  date?: Date
  event?: CalEvent
  onClose: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const defaultStart = date ? format(date, "yyyy-MM-dd'T'09:00") : toInputDateTime(event?.starts_at ?? new Date().toISOString())
  const defaultEnd   = date ? format(date, "yyyy-MM-dd'T'10:00") : toInputDateTime(event?.ends_at ?? new Date().toISOString())

  const [form, setForm] = useState({
    title: event?.title ?? '',
    description: event?.description ?? '',
    starts_at: defaultStart,
    ends_at: defaultEnd,
  })

  const isPast = new Date(form.starts_at) < new Date()

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const tenantId = user?.app_metadata?.tenant_id ?? user?.user_metadata?.tenant_id
      if (!tenantId) { setError('Session error — please refresh and try again.'); return }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        starts_at: toISO(form.starts_at),
        ends_at: toISO(form.ends_at),
        tenant_id: tenantId,
      }
      if (event) {
        const { error } = await supabase.from('events').update(payload).eq('id', event.id)
        if (error) { setError(error.message); return }
      } else {
        const { error } = await supabase.from('events').insert(payload)
        if (error) { setError(error.message); return }
      }
      router.refresh()
      onClose()
    })
  }

  async function handleDelete() {
    if (!event) return
    startTransition(async () => {
      await supabase.from('events').delete().eq('id', event.id)
      router.refresh()
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-[hsl(var(--card))] rounded-t-2xl sm:rounded-2xl shadow-card flex flex-col"
        style={{ maxHeight: '92svh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header — always visible */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))] flex-shrink-0">
          <h2 className="text-[15px] font-semibold">{event ? 'Edit event' : 'New event'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-[15px] font-medium">Title *</label>
            <input required value={form.title} onChange={set('title')} className={input} placeholder="Team call…" />
          </div>

          {/* Stack on mobile, side-by-side on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[15px] font-medium">Start</label>
              <input type="datetime-local" required value={form.starts_at} onChange={set('starts_at')} className={input} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[15px] font-medium">End</label>
              <input type="datetime-local" required value={form.ends_at} onChange={set('ends_at')} className={input} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[15px] font-medium">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={3} className={`${input} resize-none`} />
          </div>

          {isPast && (
            <div className="flex items-start gap-2 rounded-xl px-3 py-2.5" style={{ background: 'rgba(234,179,8,0.10)', border: '1px solid rgba(234,179,8,0.35)' }}>
              <span style={{ fontSize: 16, lineHeight: 1.4, flexShrink: 0 }}>⚠️</span>
              <p className="text-[13px] font-semibold" style={{ color: '#b45309' }}>
                This event is scheduled in the past. Double-check the date and time before saving.
              </p>
            </div>
          )}

          {error && <p className="text-[13px] text-red-500">{error}</p>}

          <div className="flex items-center gap-3 pt-1 pb-2">
            <button type="submit" disabled={isPending}
              className="flex-1 sm:flex-none bg-accent text-white text-[15px] font-medium px-5 py-2.5 rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-50">
              {isPending ? 'Saving…' : event ? 'Save changes' : 'Create event'}
            </button>
            {event && (
              <button type="button" onClick={handleDelete} disabled={isPending}
                className="ml-auto flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[15px] font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

const input = 'w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-[15px] bg-transparent outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]'
