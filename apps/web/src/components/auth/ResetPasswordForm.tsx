'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

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

    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/contacts')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[hsl(var(--card))] rounded-2xl shadow-card p-8 space-y-4">
      <p className="text-[15px] text-[hsl(var(--muted-foreground))]">
        Choose a strong password — at least 8 characters.
      </p>
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-[15px] font-medium">New password</label>
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
        <label htmlFor="confirm" className="text-[15px] font-medium">Confirm new password</label>
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
        {loading ? 'Updating…' : 'Set new password'}
      </button>
    </form>
  )
}
