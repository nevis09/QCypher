'use client'

import { useState } from 'react'
import { submitFeedback } from '@/lib/actions/account'
import { Send } from 'lucide-react'

export function FeedbackForm() {
  const [form, setForm] = useState({ subject: '', message: '' })
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setState('sending')
    try {
      await submitFeedback(form.subject, form.message)
      setState('sent')
      setForm({ subject: '', message: '' })
    } catch {
      setState('error')
    }
  }

  if (state === 'sent') return (
    <div className="rounded-2xl border px-6 py-8 text-center"
      style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }}>
      <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
        style={{ background: 'rgba(16,185,129,0.12)' }}>
        <Send className="w-5 h-5" style={{ color: '#10b981' }} />
      </div>
      <p className="text-[15px] font-bold" style={{ color: 'hsl(var(--foreground))' }}>Feedback sent</p>
      <p className="text-[15px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
        Thanks — we read every submission.
      </p>
      <button onClick={() => setState('idle')} className="text-[15px] font-semibold mt-3"
        style={{ color: '#6366f1' }}>Send another</button>
    </div>
  )

  return (
    <form onSubmit={submit} className="rounded-2xl border overflow-hidden space-y-0"
      style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }}>
      <div className="px-5 py-3.5">
        <label className="text-[15px] font-bold uppercase tracking-widest block mb-1.5"
          style={{ color: 'hsl(var(--muted-foreground))' }}>Subject</label>
        <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
          required placeholder="What's this about?" maxLength={120}
          className="w-full bg-transparent text-[15px] outline-none placeholder:text-[hsl(var(--muted-foreground))]"
          style={{ color: 'hsl(var(--foreground))' }} />
      </div>

      <div className="h-px" style={{ background: 'hsl(var(--border))' }} />

      <div className="px-5 py-3.5">
        <label className="text-[15px] font-bold uppercase tracking-widest block mb-1.5"
          style={{ color: 'hsl(var(--muted-foreground))' }}>Message</label>
        <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          required placeholder="Tell us anything — bugs, ideas, praise…" rows={4}
          className="w-full bg-transparent text-[15px] outline-none resize-none placeholder:text-[hsl(var(--muted-foreground))]"
          style={{ color: 'hsl(var(--foreground))' }} />
      </div>

      <div className="h-px" style={{ background: 'hsl(var(--border))' }} />

      <div className="px-5 py-3.5 flex items-center justify-between">
        {state === 'error' && (
          <span className="text-[15px] font-semibold" style={{ color: '#ef4444' }}>
            Something went wrong — try again.
          </span>
        )}
        <div className="ml-auto">
          <button type="submit" disabled={state === 'sending'}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-[15px] font-bold text-white disabled:opacity-60 transition-opacity"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
            <Send className="w-3.5 h-3.5" />
            {state === 'sending' ? 'Sending…' : 'Send feedback'}
          </button>
        </div>
      </div>
    </form>
  )
}
