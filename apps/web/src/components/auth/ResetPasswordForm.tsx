'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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

export function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const supabase = createClient()
  const router   = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return }
    setLoading(true); setError(null)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div style={CARD}>
      <p style={{ fontSize: '14px', color: 'rgba(148,180,220,0.75)', marginBottom: '24px', lineHeight: 1.6 }}>
        Choose a strong password — at least 8 characters.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label htmlFor="password" style={LABEL}>New password</label>
          <input id="password" type="password" required value={password}
            onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" style={INPUT} />
        </div>
        <div>
          <label htmlFor="confirm" style={LABEL}>Confirm new password</label>
          <input id="confirm" type="password" required value={confirm}
            onChange={e => setConfirm(e.target.value)} placeholder="••••••••" style={INPUT} />
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
          {loading ? 'Updating…' : 'Set new password'}
        </button>
      </form>
    </div>
  )
}
