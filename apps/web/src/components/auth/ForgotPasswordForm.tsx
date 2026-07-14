'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/auth/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="bg-[hsl(var(--card))] rounded-2xl shadow-card p-8 text-center space-y-2">
        <p className="font-medium">Check your email</p>
        <p className="text-[15px] text-[hsl(var(--muted-foreground))]">
          If <strong>{email}</strong> has an account, you'll receive a password reset link shortly.
        </p>
        <Link href="/auth/login" className="inline-block mt-3 text-[15px] text-accent hover:underline">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[hsl(var(--card))] rounded-2xl shadow-card p-8 space-y-4">
      <p className="text-[15px] text-[hsl(var(--muted-foreground))]">
        Enter your email and we'll send you a link to reset your password.
      </p>
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-[15px] font-medium">Email</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-[15px] outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] bg-transparent"
        />
      </div>
      {error && <p className="text-[15px] text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-accent text-white rounded-xl py-2 text-[15px] font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
      >
        {loading ? 'Sending…' : 'Send reset link'}
      </button>
      <p className="text-center text-[15px] text-[hsl(var(--muted-foreground))]">
        <Link href="/auth/login" className="text-accent hover:underline">Back to sign in</Link>
      </p>
    </form>
  )
}
