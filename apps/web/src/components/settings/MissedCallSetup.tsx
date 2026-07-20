'use client'

import { useState } from 'react'
import { Phone, Copy, Check, ChevronRight, Loader2 } from 'lucide-react'

export function MissedCallSetup({ currentNumber }: { currentNumber: string | null }) {
  const [number,  setNumber]  = useState(currentNumber)
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [copied,  setCopied]  = useState(false)

  function normalise(raw: string): string {
    const digits = raw.replace(/\D/g, '')
    if (digits.length === 10) return `+1${digits}`
    if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
    return `+${digits}`
  }

  async function handleConnect() {
    const phoneNumber = normalise(input)
    if (!/^\+1\d{10}$/.test(phoneNumber)) {
      setError('Enter a valid 10-digit US number, e.g. (404) 555-1234')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch('/api/twilio/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setNumber(data.number)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    if (!number) return
    navigator.clipboard.writeText(number)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      borderRadius: '18px',
      background: 'hsl(var(--card))',
      border: '1px solid hsl(var(--border))',
      overflow: 'hidden',
    }}>
      {/* Header row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '14px 16px',
        borderBottom: '1px solid hsl(var(--border))',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'rgba(16,185,129,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Phone style={{ width: '17px', height: '17px', color: '#10b981' }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'hsl(var(--foreground))' }}>
            Missed-Call Text-Back
          </p>
          <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginTop: '1px' }}>
            Auto-text callers when you miss their call
          </p>
        </div>
        {number && (
          <span style={{
            fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px',
            background: 'rgba(16,185,129,0.12)', color: '#059669',
          }}>
            Active
          </span>
        )}
      </div>

      <div style={{ padding: '16px' }}>
        {number ? (
          /* ── Connected state ── */
          <>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px', borderRadius: '12px',
              background: 'hsl(var(--muted))',
              marginBottom: '16px',
            }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginBottom: '2px' }}>
                  Your forwarding number
                </p>
                <p style={{ fontSize: '18px', fontWeight: 800, color: 'hsl(var(--foreground))', letterSpacing: '0.02em' }}>
                  {number}
                </p>
              </div>
              <button
                onClick={handleCopy}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', borderRadius: '10px', border: '1px solid hsl(var(--border))',
                  background: 'hsl(var(--card))', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 600, color: 'hsl(var(--foreground))',
                }}
              >
                {copied ? <Check style={{ width: '14px', height: '14px', color: '#10b981' }} /> : <Copy style={{ width: '14px', height: '14px' }} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* Setup instructions */}
            <p style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'hsl(var(--muted-foreground))', marginBottom: '10px' }}>
              Setup — takes 2 minutes
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { n: '1', text: 'On your phone, open Settings → Phone → Call Forwarding (iOS) or Settings → Calls → Additional settings → Call forwarding (Android).' },
                { n: '2', text: `Enable "Forward when busy" and "Forward when unanswered" — enter ${number} as the destination.` },
                { n: '3', text: 'Test it: call your business number from another phone and don\'t answer. Within seconds the caller should receive a text.' },
              ].map(step => (
                <div key={step.n} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(42,82,160,0.10)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 800, color: '#2a52a0', marginTop: '1px',
                  }}>
                    {step.n}
                  </div>
                  <p style={{ fontSize: '14px', color: 'hsl(var(--foreground))', lineHeight: 1.5 }}>
                    {step.text}
                  </p>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '14px', padding: '10px 14px', borderRadius: '10px',
              background: 'rgba(42,82,160,0.06)', border: '1px solid rgba(42,82,160,0.14)',
            }}>
              <p style={{ fontSize: '13px', color: '#2a52a0', lineHeight: 1.5 }}>
                <strong>Tip:</strong> Edit the auto-reply text under <strong>Templates → Missed call follow-up</strong> to personalise the message callers receive.
              </p>
            </div>
          </>
        ) : (
          /* ── Setup state ── */
          <>
            <p style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', marginBottom: '14px', lineHeight: 1.5 }}>
              Enter your Twilio number below. We'll configure its voice webhook so missed calls trigger an automatic text-back within seconds.
            </p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginBottom: '6px' }}>
                  Twilio phone number
                </label>
                <input
                  value={input}
                  onChange={e => { setInput(e.target.value); setError(null) }}
                  placeholder="+14045551234 or (404) 555-1234"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '12px',
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--muted))',
                    fontSize: '15px', color: 'hsl(var(--foreground))',
                    outline: 'none',
                  }}
                />
              </div>
              <button
                onClick={handleConnect}
                disabled={loading || input.trim().length < 10}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '10px 18px', borderRadius: '12px',
                  background: 'linear-gradient(135deg,#2a52a0,#4a9db5)',
                  color: '#fff', fontSize: '14px', fontWeight: 700,
                  border: 'none', cursor: loading ? 'wait' : 'pointer',
                  opacity: input.trim().length < 10 ? 0.5 : 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {loading ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <ChevronRight style={{ width: '14px', height: '14px' }} />}
                {loading ? 'Connecting…' : 'Connect'}
              </button>
            </div>
            {error && (
              <p style={{ fontSize: '13px', color: '#dc2626', marginTop: '8px' }}>{error}</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
