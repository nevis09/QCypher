'use client'

import { useState, useEffect } from 'react'
import { Mail, MessageSquare, X, Send, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/database'

type Contact = Tables<'contacts'>
type Template = Tables<'templates'>

function interpolate(body: string, contact: Contact): string {
  return body
    .replace(/{{first_name}}/g, contact.first_name)
    .replace(/{{last_name}}/g, contact.last_name ?? '')
    .replace(/{{company}}/g, contact.company ?? '')
    .replace(/{{phone}}/g, contact.phone ?? '')
}

export function QuickSendButton({ contact, channel }: { contact: Contact; channel: 'email' | 'sms' }) {
  const [open, setOpen] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [selected, setSelected] = useState<Template | null>(null)
  const [preview, setPreview] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!open) return
    supabase.from('templates').select('*').eq('channel', channel).order('name').then(({ data }) => {
      setTemplates(data ?? [])
    })
  }, [open, channel])

  function selectTemplate(t: Template) {
    setSelected(t)
    setPreview(interpolate(t.body, contact))
  }

  async function handleSend() {
    if (!selected) return
    setSending(true)
    setResult(null)
    const body = { templateId: selected.id, contactId: contact.id, channel, preview }
    const res = await fetch('/api/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const json = await res.json()
    setSending(false)
    setResult({ ok: res.ok, msg: res.ok ? 'Sent!' : (json.error ?? 'Send failed') })
    if (res.ok) setTimeout(() => { setOpen(false); setSelected(null); setResult(null) }, 1200)
  }

  const Icon = channel === 'email' ? Mail : MessageSquare
  const recipient = channel === 'email' ? contact.email : contact.phone
  if (!recipient) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))] px-3 py-1.5 rounded-lg transition-colors"
      >
        <Icon className="w-3.5 h-3.5" />
        Quick {channel}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md bg-white dark:bg-[hsl(var(--muted))] rounded-2xl shadow-card" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))]">
              <h2 className="text-sm font-semibold capitalize">Quick {channel} → {recipient}</h2>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {templates.length === 0 ? (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">No {channel} templates yet. Create one first.</p>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Template</label>
                    <div className="relative">
                      <select
                        className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-sm bg-transparent outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] appearance-none pr-8"
                        value={selected?.id ?? ''}
                        onChange={e => {
                          const t = templates.find(t => t.id === e.target.value)
                          if (t) selectTemplate(t)
                        }}
                      >
                        <option value="">Select a template…</option>
                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 pointer-events-none text-[hsl(var(--muted-foreground))]" />
                    </div>
                  </div>
                  {selected && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Preview (editable)</label>
                      <textarea
                        value={preview}
                        onChange={e => setPreview(e.target.value)}
                        rows={5}
                        className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-sm bg-transparent outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
                      />
                    </div>
                  )}
                  {result && (
                    <p className={`text-sm ${result.ok ? 'text-emerald-600' : 'text-red-500'}`}>{result.msg}</p>
                  )}
                  <button
                    onClick={handleSend}
                    disabled={!selected || sending}
                    className="w-full flex items-center justify-center gap-2 bg-accent text-white text-sm font-medium py-2 rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                    {sending ? 'Sending…' : `Send ${channel}`}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
