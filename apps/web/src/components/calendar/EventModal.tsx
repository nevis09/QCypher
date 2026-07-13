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

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      starts_at: toISO(form.starts_at),
      ends_at: toISO(form.ends_at),
    }
    startTransition(async () => {
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
      <div className="w-full sm:max-w-md bg-white dark:bg-[hsl(var(--muted))] rounded-t-2xl sm:rounded-2xl shadow-card" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-sm font-semibold">{event ? 'Edit event' : 'New event'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Title *</label>
            <input required value={form.title} onChange={set('title')} className={input} placeholder="Team call…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Start</label>
              <input type="datetime-local" required value={form.starts_at} onChange={set('starts_at')} className={input} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">End</label>
              <input type="datetime-local" required value={form.ends_at} onChange={set('ends_at')} className={input} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={2} className={`${input} resize-none`} />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex items-center gap-3 pt-1">
            <button type="submit" disabled={isPending} className="bg-accent text-white text-sm font-medium px-5 py-2 rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-50">
              {isPending ? 'Saving…' : event ? 'Save' : 'Create'}
            </button>
            {event && (
              <button type="button" onClick={handleDelete} disabled={isPending} className="ml-auto p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-[hsl(var(--muted-foreground))] hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

const input = 'w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-sm bg-transparent outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]'
