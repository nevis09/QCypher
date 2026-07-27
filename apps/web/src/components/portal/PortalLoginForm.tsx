'use client'

import { useState } from 'react'

export function PortalLoginForm({
  tenantSlug,
  businessName,
}: {
  tenantSlug: string
  businessName: string
}) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    try {
      const res = await fetch(`/api/portal/magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tenantSlug }),
      })
      const json = await res.json()
      if (json.ok) {
        setState('sent')
      } else {
        setErrorMsg(json.error ?? 'Something went wrong.')
        setState('error')
      }
    } catch {
      setErrorMsg('Something went wrong.')
      setState('error')
    }
  }

  if (state === 'sent') {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-[15px] font-semibold text-gray-900">Check your email</p>
        <p className="text-[13px] text-gray-500">
          We sent a sign-in link to <strong>{email}</strong>. It expires in 24 hours.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="portal-email" className="text-[15px] font-medium text-gray-700">
          Your email address
        </label>
        <input
          id="portal-email"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="jane@example.com"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      {state === 'error' && (
        <p className="text-[13px] text-red-600">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={state === 'loading' || !email}
        className="w-full py-3 rounded-xl text-[15px] font-bold text-white transition-opacity disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #1a3070, #2a52a0)' }}
      >
        {state === 'loading' ? 'Sending…' : 'Send sign-in link'}
      </button>
    </form>
  )
}
