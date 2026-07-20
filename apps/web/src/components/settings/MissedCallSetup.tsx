'use client'

import { useState } from 'react'
import { Phone, Copy, Check, ChevronRight, Loader2 } from 'lucide-react'

const WEBHOOK_URL = 'https://www.qcyphertech.com/api/twilio/voice'

export function MissedCallSetup({ currentNumber }: { currentNumber: string | null }) {
  const [number,        setNumber]        = useState(currentNumber)
  const [input,         setInput]         = useState('')
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState<string | null>(null)
  const [copied,        setCopied]        = useState(false)
  const [copiedWebhook, setCopiedWebhook] = useState(false)

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

  function handleCopyWebhook() {
    navigator.clipboard.writeText(WEBHOOK_URL)
    setCopiedWebhook(true)
    setTimeout(() => setCopiedWebhook(false), 2000)
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
            <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'hsl(var(--muted-foreground))', marginBottom: '10px' }}>
              Two steps to finish setup
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

              {/* Step 1 — Twilio webhook */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(42,82,160,0.10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 800, color: '#2a52a0', marginTop: '1px',
                }}>1</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', color: 'hsl(var(--foreground))', lineHeight: 1.5, marginBottom: '8px' }}>
                    In your <strong>Twilio console</strong>, open the phone number {number} → set <em>A call comes in</em> → Webhook to:
                  </p>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '9px 12px', borderRadius: '10px',
                    background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))',
                  }}>
                    <code style={{ flex: 1, fontSize: '12px', color: 'hsl(var(--foreground))', wordBreak: 'break-all' }}>
                      {WEBHOOK_URL}
                    </code>
                    <button
                      onClick={handleCopyWebhook}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0,
                        padding: '5px 10px', borderRadius: '8px', border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--card))', cursor: 'pointer',
                        fontSize: '12px', fontWeight: 600, color: 'hsl(var(--foreground))',
                      }}
                    >
                      {copiedWebhook ? <Check style={{ width: '12px', height: '12px', color: '#10b981' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
                      {copiedWebhook ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 2 — call forwarding */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(42,82,160,0.10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 800, color: '#2a52a0', marginTop: '1px',
                }}>2</div>
                <p style={{ fontSize: '14px', color: 'hsl(var(--foreground))', lineHeight: 1.5 }}>
                  Forward your business number to {number} when unanswered (phone Settings → Call Forwarding, or through your carrier).
                </p>
              </div>
            </div>

            <div style={{
              marginTop: '14px', padding: '10px 14px', borderRadius: '10px',
              background: 'rgba(42,82,160,0.06)', border: '1px solid rgba(42,82,160,0.14)',
            }}>
              <p style={{ fontSize: '13px', color: '#2a52a0', lineHeight: 1.5 }}>
                <strong>Tip:</strong> Customise the auto-reply under <strong>Templates → Missed call follow-up</strong>.
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
