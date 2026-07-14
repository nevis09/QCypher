'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Mode = 'password' | 'magic'

export function LoginForm() {
  const [mode, setMode] = useState<Mode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/contacts')
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="bg-[hsl(var(--card))] rounded-2xl shadow-card p-8 text-center space-y-2">
        <p className="font-medium">Check your email</p>
        <p className="text-[15px] text-[hsl(var(--muted-foreground))]">
          We sent a magic link to <strong>{email}</strong>
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[hsl(var(--card))] rounded-2xl shadow-card p-8 space-y-5">
      {/* Tab toggle */}
      <div className="flex rounded-xl border border-[hsl(var(--border))] p-1 gap-1">
        {(['password', 'magic'] as Mode[]).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError(null) }}
            className={`flex-1 rounded-lg py-1.5 text-[15px] font-medium transition-colors ${
              mode === m
                ? 'bg-accent text-white'
                : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            }`}
          >
            {m === 'password' ? 'Password' : 'Magic link'}
          </button>
        ))}
      </div>

      {mode === 'password' ? (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-[15px] font-medium">Password</label>
              <Link href="/auth/forgot-password" className="text-[15px] text-accent hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
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
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleMagicLink} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email-magic" className="text-[15px] font-medium">Email</label>
            <input
              id="email-magic"
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
            {loading ? 'Sending…' : 'Send magic link'}
          </button>
        </form>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[hsl(var(--border))]" />
        </div>
        <div className="relative flex justify-center text-[15px] text-[hsl(var(--muted-foreground))]">
          <span className="bg-[hsl(var(--card))] px-2">or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 border border-[hsl(var(--border))] rounded-xl py-2 text-[15px] font-medium hover:bg-[hsl(var(--muted))] transition-colors disabled:opacity-50"
      >
        <GoogleIcon />
        Continue with Google
      </button>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.96L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}
