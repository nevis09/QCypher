'use client'

import { useState } from 'react'

const WEBHOOK_URL = 'https://www.qcyphertech.com/api/telnyx/voice'

interface Props {
  currentNumber: string | null
}

export function MissedCallSetup({ currentNumber }: Props) {
  const [number, setNumber]       = useState<string | null>(currentNumber)
  const [areaCode, setAreaCode]   = useState('')
  const [existing, setExisting]   = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [copied, setCopied]       = useState(false)

  async function provision() {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch('/api/telnyx/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ areaCode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to provision')
      setNumber(data.number)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  async function connect() {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch('/api/telnyx/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: existing }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to connect')
      setNumber(data.number)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  function copyWebhook() {
    navigator.clipboard.writeText(WEBHOOK_URL).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const row: React.CSSProperties = {
    display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '12px',
    borderTop: '1px solid hsl(var(--border))',
  }
  const card: React.CSSProperties = {
    borderRadius: '16px', background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))', overflow: 'hidden',
  }
  const input: React.CSSProperties = {
    flex: 1, border: '1px solid hsl(var(--border))', borderRadius: '10px',
    padding: '9px 12px', fontSize: '14px', background: 'hsl(var(--background))',
    color: 'hsl(var(--foreground))', outline: 'none',
  }
  const btn: React.CSSProperties = {
    padding: '9px 18px', borderRadius: '10px', fontSize: '14px', fontWeight: 700,
    cursor: loading ? 'not-allowed' : 'pointer', border: 'none',
    background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))',
    opacity: loading ? 0.6 : 1, whiteSpace: 'nowrap',
  }
  const ghostBtn: React.CSSProperties = {
    ...btn, background: 'transparent', color: 'hsl(var(--foreground))',
    border: '1px solid hsl(var(--border))',
  }

  // ── Already provisioned ────────────────────────────────────────────────────
  if (number) {
    return (
      <div style={card}>
        <div style={{ padding: '16px', background: 'rgba(0,168,122,0.06)', borderBottom: '1px solid hsl(var(--border))' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#059669', marginBottom: '2px' }}>✓ Missed-call text-back active</p>
          <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
            Forwarding number: <strong style={{ color: 'hsl(var(--foreground))' }}>{number}</strong>
          </p>
        </div>
        <div style={{ padding: '16px' }}>
          <p style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.6, marginBottom: '12px' }}>
            Set your existing business number to forward unanswered calls to <strong>{number}</strong>.
            When a call is missed, we'll automatically send a text-back to the caller.
          </p>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--foreground))', marginBottom: '8px' }}>
            How to enable no-answer forwarding:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { carrier: 'Verizon', code: `*71 ${number}` },
              { carrier: 'AT&T', code: `**61*+1${number?.replace(/\D/g,'')}#` },
              { carrier: 'T-Mobile', code: `**61*+1${number?.replace(/\D/g,'')}#` },
            ].map(({ carrier, code }) => (
              <div key={carrier} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                <span style={{ width: '80px', color: 'hsl(var(--muted-foreground))' }}>{carrier}</span>
                <code style={{ flex: 1, padding: '5px 10px', borderRadius: '8px', background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))', fontSize: '12px' }}>{code}</code>
                <span style={{ color: 'hsl(var(--muted-foreground))' }}>then call</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', marginTop: '10px' }}>
            Dial the code from your business phone and press Call/Send. You'll hear a confirmation tone. To cancel: dial <code style={{ fontSize: '12px' }}>*73</code> (Verizon) or <code style={{ fontSize: '12px' }}>##61#</code> (AT&T / T-Mobile).
          </p>
        </div>
      </div>
    )
  }

  // ── Setup flow ─────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Explainer */}
      <p style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.65 }}>
        Your number stays the same. We set up a forwarding number that catches the calls you miss
        and automatically sends a text-back to the caller.
      </p>

      {/* Primary: auto-provision */}
      <div style={card}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid hsl(var(--border))' }}>
          <p style={{ fontSize: '15px', fontWeight: 700, color: 'hsl(var(--foreground))' }}>Get a forwarding number</p>
          <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginTop: '2px' }}>
            We'll provision a US number for you instantly.
          </p>
        </div>
        <div style={{ ...row, borderTop: 'none', flexWrap: 'wrap', gap: '8px' }}>
          <input
            style={input}
            placeholder="Area code (e.g. 804)"
            value={areaCode}
            maxLength={3}
            onChange={e => setAreaCode(e.target.value.replace(/\D/g, ''))}
          />
          <button style={btn} onClick={provision} disabled={loading || areaCode.length !== 3}>
            {loading ? 'Working…' : 'Get number'}
          </button>
        </div>
      </div>

      {/* Advanced: bring your own */}
      <div style={card}>
        <button
          onClick={() => setShowAdvanced(v => !v)}
          style={{ ...ghostBtn, width: '100%', textAlign: 'left', borderRadius: '16px', border: 'none', padding: '14px 16px' }}
        >
          <span style={{ fontSize: '14px', fontWeight: 600 }}>Advanced — use an existing Telnyx number</span>
          <span style={{ float: 'right', opacity: 0.5 }}>{showAdvanced ? '−' : '+'}</span>
        </button>

        {showAdvanced && (
          <div style={{ padding: '0 16px 16px', borderTop: '1px solid hsl(var(--border))' }}>
            <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', margin: '12px 0 10px', lineHeight: 1.6 }}>
              Already have a Telnyx number? Enter it below — we'll register it and configure the webhook automatically.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <label style={{ display: 'none' }}>Telnyx phone number</label>
              <input
                style={input}
                placeholder="+14045551234"
                value={existing}
                onChange={e => setExisting(e.target.value)}
              />
              <button style={btn} onClick={connect} disabled={loading || !existing}>
                {loading ? 'Working…' : 'Connect'}
              </button>
            </div>

            {/* Webhook URL */}
            <div style={{ marginTop: '14px', padding: '12px', borderRadius: '10px', background: 'hsl(var(--muted))', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <code style={{ flex: 1, fontSize: '12px', wordBreak: 'break-all', color: 'hsl(var(--foreground))' }}>
                {WEBHOOK_URL}
              </code>
              <button style={{ ...ghostBtn, padding: '6px 12px', fontSize: '13px' }} onClick={copyWebhook}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', marginTop: '8px' }}>
              In your Telnyx portal, set the voice webhook on this number to the URL above.
            </p>
          </div>
        )}
      </div>

      {error && (
        <p style={{ fontSize: '13px', color: 'hsl(var(--destructive))', padding: '10px 14px', background: 'hsl(var(--destructive) / 0.08)', borderRadius: '10px' }}>
          {error}
        </p>
      )}
    </div>
  )
}
