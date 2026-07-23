'use client'

import { useState } from 'react'
import { MessageSquare, X, Send } from 'lucide-react'

// Maps job status values to the starter template names they should trigger
const STATUS_TEMPLATE_NAME: Partial<Record<string, string>> = {
  en_route:  'On our way',
  completed: 'Job complete',
}

type Props = {
  status: string
  contactId: string
  contactName: string
  contactPhone: string | null
  businessName: string
}

export function JobStatusSmsPrompt({ status, contactId, contactName, contactPhone, businessName }: Props) {
  const [sending,   setSending]   = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [sent,      setSent]      = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const templateName = STATUS_TEMPLATE_NAME[status]
  if (!templateName || dismissed || !contactPhone) return null

  async function handleSend() {
    setSending(true)
    setError(null)
    try {
      // Look up the template by name, then send
      const res = await fetch('/api/telnyx/send-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateName, contactId, businessName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Send failed')
      setSent(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Send failed')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 14px', borderRadius: '12px',
        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.20)',
      }}>
        <Send style={{ width: '15px', height: '15px', color: '#059669', flexShrink: 0 }} />
        <p style={{ fontSize: '14px', color: '#059669', fontWeight: 600 }}>
          "{templateName}" text sent to {contactName}
        </p>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '10px 14px', borderRadius: '12px',
      background: 'rgba(42,82,160,0.06)', border: '1px solid rgba(42,82,160,0.18)',
    }}>
      <MessageSquare style={{ width: '15px', height: '15px', color: '#2a52a0', flexShrink: 0 }} />
      <p style={{ fontSize: '14px', color: 'hsl(var(--foreground))', flex: 1 }}>
        Send <strong>"{templateName}"</strong> text to {contactName}?
      </p>
      {error && (
        <p style={{ fontSize: '13px', color: '#dc2626' }}>{error}</p>
      )}
      <button
        onClick={handleSend}
        disabled={sending}
        style={{
          padding: '6px 14px', borderRadius: '8px',
          background: 'linear-gradient(135deg,#2a52a0,#4a9db5)',
          color: '#fff', fontSize: '13px', fontWeight: 700,
          border: 'none', cursor: sending ? 'wait' : 'pointer',
          opacity: sending ? 0.6 : 1, whiteSpace: 'nowrap',
        }}
      >
        {sending ? 'Sending…' : 'Send'}
      </button>
      <button
        onClick={() => setDismissed(true)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '28px', height: '28px', borderRadius: '8px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'hsl(var(--muted-foreground))',
        }}
        title="Skip"
      >
        <X style={{ width: '14px', height: '14px' }} />
      </button>
    </div>
  )
}
