'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="bg-white dark:bg-[hsl(var(--muted))] rounded-2xl shadow-card p-8 text-center space-y-2">
        <p className="font-medium">Check your email</p>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          We sent a magic link to <strong>{email}</strong>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-[hsl(var(--muted))] rounded-2xl shadow-card p-8 space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] bg-transparent"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-accent text-white rounded-xl py-2 text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
      >
        {loading ? 'Sending…' : 'Send magic link'}
      </button>
    </form>
  )
}
