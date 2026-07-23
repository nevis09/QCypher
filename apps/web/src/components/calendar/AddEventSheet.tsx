'use client'

import { X, PenLine, CheckCircle2 } from 'lucide-react'

interface Props {
  calConnected:  boolean
  gcalConnected: boolean
  onManual: () => void
  onClose:  () => void
}

const FX = {
  cyan:   '#4a9db5',
  violet: '#2a52a0',
  border: 'rgba(74,157,181,0.18)',
  grad:   'linear-gradient(135deg, #2a52a0 0%, #4a9db5 100%)',
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 814 1000" fill="currentColor">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 439.8 0 350.3 0 265.6c0-161.6 105.7-246.9 209.6-246.9 55.1 0 101 37.6 135.5 37.6 33 0 85.1-39.9 147.4-39.9 23.6 0 108.1 2 168.1 81.2zm-202.5-78.8c-27.1 33.9-74.9 59.7-120.3 59.7-5.8 0-11.5-.6-17.4-1.3-1.3-5.8-1.9-11.5-1.9-18 0-35.9 18.6-74.3 46.4-98.1C517.8 183.5 569.2 162 616.3 162c5.1 0 10.3.6 15.4 1.3 1.3 7.1 1.9 14.2 1.9 20.7 0 36.5-17.4 75.5-48 78.1z"/>
    </svg>
  )
}

export function AddEventSheet({ calConnected, gcalConnected, onManual, onClose }: Props) {
  const anyConnected = calConnected || gcalConnected

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden"
        style={{ background: 'hsl(var(--card))', border: `1px solid ${FX.border}`, maxHeight: '90svh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: FX.border }}>
          <span className="text-[15px] font-bold" style={{ color: 'hsl(var(--foreground))' }}>
            Add to Calendar
          </span>
          <button onClick={onClose} className="p-1 rounded-lg transition-colors hover:bg-[hsl(var(--muted))]">
            <X className="w-4 h-4" style={{ color: FX.cyan }} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-3 overflow-y-auto">

          {/* Connected status banner */}
          {anyConnected && (
            <div className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(74,157,181,0.07)', border: '1px solid rgba(74,157,181,0.2)' }}>
              <CheckCircle2 style={{ width: 16, height: 16, color: FX.cyan, flexShrink: 0 }} />
              <p className="text-[13px] font-semibold" style={{ color: FX.cyan }}>
                {gcalConnected ? 'Google Calendar connected' : 'Cal.com connected'} — events sync automatically
              </p>
            </div>
          )}

          {/* Section label */}
          <p className="text-[12px] font-bold uppercase tracking-wider px-1"
            style={{ color: 'hsl(var(--muted-foreground))' }}>
            Connect a calendar
          </p>

          {/* Google Calendar */}
          <a
            href="/api/google-cal/connect"
            className="flex items-center gap-4 p-4 rounded-2xl transition-all"
            style={{ background: 'hsl(var(--muted))', border: `1px solid ${FX.border}`, textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(74,157,181,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'hsl(var(--muted))')}
          >
            <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white shadow-sm">
              <GoogleIcon />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                Google Calendar
                {gcalConnected && <span className="ml-2 text-[12px] font-semibold" style={{ color: FX.cyan }}>✓ Connected</span>}
              </p>
              <p className="text-[13px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {gcalConnected ? 'Reconnect to refresh access' : 'Sign in with Google to sync your events'}
              </p>
            </div>
            <span style={{ color: FX.cyan, fontSize: 18 }}>›</span>
          </a>

          {/* Apple Calendar */}
          <a
            href="https://support.apple.com/guide/icloud/set-up-icloud-calendar-mm6b1a3350/icloud"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-2xl transition-all"
            style={{ background: 'hsl(var(--muted))', border: `1px solid ${FX.border}`, textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(74,157,181,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'hsl(var(--muted))')}
          >
            <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#1c1c1e' }}>
              <AppleIcon />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold" style={{ color: 'hsl(var(--foreground))' }}>Apple Calendar</p>
              <p className="text-[13px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Share via iCloud link — view setup guide
              </p>
            </div>
            <span style={{ color: FX.cyan, fontSize: 18 }}>›</span>
          </a>

          {/* Cal.com */}
          <a
            href="https://app.cal.com/settings/calendars"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-2xl transition-all"
            style={{ background: 'hsl(var(--muted))', border: `1px solid ${FX.border}`, textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(74,157,181,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'hsl(var(--muted))')}
          >
            <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: FX.grad }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold" style={{ color: 'hsl(var(--foreground))' }}>Cal.com</p>
              <p className="text-[13px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Connect Google, Outlook, or Apple inside Cal.com
              </p>
            </div>
            <span style={{ color: FX.cyan, fontSize: 18 }}>›</span>
          </a>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: FX.border }} />
            <span className="text-[12px] font-semibold uppercase tracking-wider"
              style={{ color: 'hsl(var(--muted-foreground))' }}>or</span>
            <div className="flex-1 h-px" style={{ background: FX.border }} />
          </div>

          {/* Manual add */}
          <button
            onClick={onManual}
            className="flex items-center gap-4 p-4 rounded-2xl transition-all text-left"
            style={{ background: 'hsl(var(--muted))', border: `1px solid ${FX.border}` }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(74,157,181,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'hsl(var(--muted))')}
          >
            <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(74,157,181,0.12)' }}>
              <PenLine style={{ width: 18, height: 18, color: FX.cyan }} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold" style={{ color: 'hsl(var(--foreground))' }}>Add event manually</p>
              <p className="text-[13px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Create a one-off event on this calendar
              </p>
            </div>
            <span style={{ color: FX.cyan, fontSize: 18 }}>›</span>
          </button>
        </div>
      </div>
    </div>
  )
}
