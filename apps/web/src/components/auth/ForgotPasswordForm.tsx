'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const TEAL   = '#4a9db5'
const BTN_BG = 'linear-gradient(135deg, #1a3070 0%, #2a52a0 60%, #4a9db5 100%)'
const BORDER = 'rgba(74,157,181,0.22)'
const CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${BORDER}`,
  borderRadius: '20px',
  padding: '32px',
  boxShadow: '0 8px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
}
const INPUT: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(74,157,181,0.28)',
  borderRadius: '12px',
  padding: '11px 14px',
  fontSize: '15px',
  color: '#e8f0fa',
  outline: 'none',
}
const LABEL: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  color: 'rgba(148,180,220,0.9)',
  marginBottom: '7px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
}

export function ForgotPasswordForm() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/confirm`,
    })
    if (error) { setError(error.message); setLoading(false) }
    else setSent(true)
  }

  if (sent) {
    return (
      <div style={{ ...CARD, textAlign: 'center' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 16px',
          background: BTN_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
        }}>✉️</div>
        <p style={{ fontWeight: 700, color: '#e8f0fa', fontSize: '17px', marginBottom: '6px' }}>Check your email</p>
        <p style={{ fontSize: '14px', color: 'rgba(148,180,220,0.75)', lineHeight: 1.6 }}>
          If <strong style={{ color: TEAL }}>{email}</strong> has an account, a reset link is on its way.
        </p>
        <Link href="/auth/login" style={{ display: 'inline-block', marginTop: '16px', fontSize: '14px', color: TEAL, fontWeight: 700, textDecoration: 'none' }}>
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div style={CARD}>
      <p style={{ fontSize: '14px', color: 'rgba(148,180,220,0.75)', marginBottom: '24px', lineHeight: 1.6 }}>
        Enter your email and we'll send a link to reset your password.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label htmlFor="email" style={LABEL}>Email</label>
          <input id="email" type="email" required value={email}
            onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={INPUT} />
        </div>
        {error && (
          <p style={{ fontSize: '14px', color: '#f87171', background: 'rgba(248,113,113,0.1)', borderRadius: '10px', padding: '10px 14px' }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', background: BTN_BG, border: 'none', borderRadius: '12px',
            padding: '13px', fontSize: '15px', fontWeight: 700, color: '#fff',
            cursor: 'pointer', boxShadow: '0 4px 20px rgba(42,82,160,0.45)',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '22px', fontSize: '14px', color: 'rgba(148,180,220,0.65)' }}>
        <Link href="/auth/login" style={{ color: TEAL, fontWeight: 700, textDecoration: 'none' }}>Back to sign in</Link>
      </p>
    </div>
  )
}
