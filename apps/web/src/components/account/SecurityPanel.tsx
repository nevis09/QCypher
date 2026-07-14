'use client'

import { useState } from 'react'
import { changePassword, requestAccountDeactivation } from '@/lib/actions/account'
import { Mail, Chrome, Monitor, ChevronRight, Eye, EyeOff, AlertTriangle } from 'lucide-react'

type Props = {
  email:       string
  hasPassword: boolean
  hasGoogle:   boolean
  signedInAt:  string
}

export function SecurityPanel({ email, hasPassword, hasGoogle, signedInAt }: Props) {
  const [pwOpen,   setPwOpen]   = useState(false)
  const [pw,       setPw]       = useState({ next: '', confirm: '' })
  const [showPw,   setShowPw]   = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg,    setPwMsg]    = useState<{ ok: boolean; text: string } | null>(null)

  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [deactivating,   setDeactivating]   = useState(false)
  const [deactivated,    setDeactivated]     = useState(false)
  const [deactivateErr,  setDeactivateErr]  = useState('')

  async function submitPw(e: React.FormEvent) {
    e.preventDefault()
    if (pw.next !== pw.confirm) { setPwMsg({ ok: false, text: 'Passwords do not match' }); return }
    if (pw.next.length < 8)     { setPwMsg({ ok: false, text: 'Password must be at least 8 characters' }); return }
    setPwSaving(true)
    try {
      await changePassword(pw.next)
      setPwMsg({ ok: true, text: 'Password updated successfully' })
      setPw({ next: '', confirm: '' })
      setPwOpen(false)
    } catch (err: unknown) {
      setPwMsg({ ok: false, text: err instanceof Error ? err.message : 'Error updating password' })
    } finally {
      setPwSaving(false)
    }
  }

  async function handleDeactivate() {
    setDeactivating(true)
    setDeactivateErr('')
    try {
      await requestAccountDeactivation()
      setDeactivated(true)
    } catch {
      setDeactivateErr('Something went wrong. Please email hello@qcyphertech.com directly.')
    } finally {
      setDeactivating(false)
    }
  }

  return (
    <div className="space-y-4">

      {/* Login methods */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }}>

        {hasGoogle && (
          <>
            <LoginRow icon={Chrome} label="Google" email={email} color="#10b981" bg="rgba(16,185,129,0.10)" />
            {hasPassword && <Divider />}
          </>
        )}
        {hasPassword && (
          <LoginRow icon={Mail} label="Email" email={email} color="#6366f1" bg="rgba(99,102,241,0.10)" />
        )}

        <Divider />

        {/* Current session */}
        <div className="flex items-center gap-4 px-5 py-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'hsl(var(--muted))' }}>
            <Monitor style={{ width: '15px', height: '15px', color: 'hsl(var(--muted-foreground))' }} strokeWidth={2} />
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-bold uppercase tracking-widest"
              style={{ color: 'hsl(var(--muted-foreground))' }}>Current session</p>
            <p className="text-[15px] font-medium mt-0.5" style={{ color: 'hsl(var(--foreground))' }}>
              Signed in via this browser · {signedInAt}
            </p>
          </div>
        </div>
      </div>

      {/* Change password */}
      {hasPassword && (
        <div className="rounded-2xl border overflow-hidden"
          style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }}>
          <button onClick={() => { setPwOpen(o => !o); setPwMsg(null) }}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[hsl(var(--muted))] transition-colors text-left">
            <div className="flex-1">
              <p className="text-[15px] font-bold" style={{ color: 'hsl(var(--foreground))' }}>Change password</p>
              <p className="text-[15px] mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Update your login password
              </p>
            </div>
            <ChevronRight style={{
              width: '16px', height: '16px', color: 'hsl(var(--muted-foreground))',
              transform: pwOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s',
            }} />
          </button>

          {pwOpen && (
            <form onSubmit={submitPw} className="border-t px-5 pb-5 pt-4 space-y-3"
              style={{ borderColor: 'hsl(var(--border))' }}>
              {(['next', 'confirm'] as const).map(key => (
                <div key={key}>
                  <label className="text-[15px] font-bold uppercase tracking-widest block mb-1.5"
                    style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {key === 'next' ? 'New password' : 'Confirm password'}
                  </label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'}
                      value={pw[key]}
                      onChange={e => setPw(p => ({ ...p, [key]: e.target.value }))}
                      required minLength={8}
                      className="w-full px-3 py-2.5 rounded-xl border text-[15px] outline-none pr-10"
                      style={{
                        background:   'hsl(var(--muted))',
                        borderColor:  'hsl(var(--border))',
                        color:        'hsl(var(--foreground))',
                      }} />
                    {key === 'next' && (
                      <button type="button" onClick={() => setShowPw(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2">
                        {showPw
                          ? <EyeOff style={{ width: '14px', height: '14px', color: 'hsl(var(--muted-foreground))' }} />
                          : <Eye    style={{ width: '14px', height: '14px', color: 'hsl(var(--muted-foreground))' }} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {pwMsg && (
                <p className="text-[15px] font-semibold" style={{ color: pwMsg.ok ? '#10b981' : '#ef4444' }}>
                  {pwMsg.text}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setPwOpen(false)}
                  className="px-4 py-2 rounded-xl text-[15px] font-semibold transition-colors hover:bg-[hsl(var(--muted))]"
                  style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Cancel
                </button>
                <button type="submit" disabled={pwSaving}
                  className="px-4 py-2 rounded-xl text-[15px] font-bold text-white disabled:opacity-60 transition-opacity"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                  {pwSaving ? 'Updating…' : 'Update password'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Deactivate account */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ borderColor: deactivateOpen ? 'rgba(239,68,68,0.4)' : 'hsl(var(--border))', background: 'hsl(var(--card))' }}>

        <button onClick={() => setDeactivateOpen(o => !o)}
          className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[hsl(var(--muted))] transition-colors text-left">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(239,68,68,0.10)' }}>
            <AlertTriangle style={{ width: '15px', height: '15px', color: '#ef4444' }} strokeWidth={2} />
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-bold" style={{ color: '#ef4444' }}>Deactivate account</p>
            <p className="text-[15px] mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Submit a request to close your workspace
            </p>
          </div>
          <ChevronRight style={{
            width: '16px', height: '16px', color: 'hsl(var(--muted-foreground))',
            transform: deactivateOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s',
          }} />
        </button>

        {deactivateOpen && (
          <div className="border-t px-5 pb-5 pt-4 space-y-4" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
            {deactivated ? (
              <div className="rounded-xl px-4 py-4 space-y-1"
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <p className="text-[15px] font-bold" style={{ color: '#ef4444' }}>Request received</p>
                <p className="text-[15px] leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  We've sent a confirmation to your email and notified the QCypher team. Your account
                  remains active until our team processes the request — typically within 1–2 business days.
                  Reply to the confirmation email if this was a mistake.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-xl px-4 py-3 space-y-1"
                  style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <p className="text-[15px] font-bold" style={{ color: '#ef4444' }}>Before you go</p>
                  <ul className="space-y-1 mt-1">
                    {[
                      'Your account will not be deactivated immediately — a request is sent to the QCypher team.',
                      'You\'ll receive a confirmation email and we\'ll follow up within 1–2 business days.',
                      'Export any data you need before the team processes your request.',
                    ].map(line => (
                      <li key={line} className="text-[15px] leading-relaxed flex gap-2"
                        style={{ color: 'hsl(var(--muted-foreground))' }}>
                        <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0"
                          style={{ background: 'hsl(var(--muted-foreground))' }} />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>

                {deactivateErr && (
                  <p className="text-[15px] font-semibold" style={{ color: '#ef4444' }}>{deactivateErr}</p>
                )}

                <div className="flex gap-2">
                  <button onClick={() => setDeactivateOpen(false)}
                    className="px-4 py-2 rounded-xl text-[15px] font-semibold transition-colors hover:bg-[hsl(var(--muted))]"
                    style={{ color: 'hsl(var(--muted-foreground))' }}>
                    Cancel
                  </button>
                  <button onClick={handleDeactivate} disabled={deactivating}
                    className="px-4 py-2 rounded-xl text-[15px] font-bold text-white disabled:opacity-60 transition-opacity"
                    style={{ background: '#ef4444' }}>
                    {deactivating ? 'Submitting…' : 'Submit deactivation request'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function LoginRow({ icon: Icon, label, email, color, bg }: {
  icon: React.ElementType; label: string; email: string; color: string; bg: string
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: bg }}>
        <Icon style={{ width: '15px', height: '15px', color }} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold uppercase tracking-widest"
          style={{ color: 'hsl(var(--muted-foreground))' }}>{label} login</p>
        <p className="text-[15px] font-medium truncate mt-0.5" style={{ color: 'hsl(var(--foreground))' }}>{email}</p>
      </div>
      <span className="text-[15px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
        style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>Active</span>
    </div>
  )
}

function Divider() {
  return <div className="h-px mx-5" style={{ background: 'hsl(var(--border))' }} />
}
