'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div className="bg-[hsl(var(--card))] rounded-2xl shadow-card p-8 text-center space-y-2">
        <p className="font-medium">Verify your email</p>
        <p className="text-[15px] text-[hsl(var(--muted-foreground))]">
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
        </p>
        <Link href="/auth/login" className="inline-block mt-3 text-[15px] text-accent hover:underline">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[hsl(var(--card))] rounded-2xl shadow-card p-8 space-y-4">
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
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-[15px] font-medium">Password</label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Min. 8 characters"
          className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-[15px] outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] bg-transparent"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="confirm" className="text-[15px] font-medium">Confirm password</label>
        <input
          id="confirm"
          type="password"
          required
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-[15px] outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] bg-transparent"
        />
      </div>
      {error && <p className="text-[15px] text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-accent text-white rounded-xl py-2 text-[15px] font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
      >
        {loading ? 'Creating account…' : 'Create account'}
      </button>
      <p className="text-center text-[15px] text-[hsl(var(--muted-foreground))]">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-accent hover:underline">Sign in</Link>
      </p>
    </form>
  )
}
