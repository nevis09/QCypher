import { AlertCircle } from 'lucide-react'

export function Disclaimer() {
  return (
    <div className="flex items-start gap-3 rounded-2xl px-4 py-3.5"
      style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
      <AlertCircle style={{ width: '15px', height: '15px', color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
      <p className="text-[15px] leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>
        <span className="font-bold" style={{ color: 'hsl(var(--foreground))' }}>For reference only.</span>{' '}
        This is a simple overview, not accounting, bookkeeping, or tax advice. Consult a licensed bookkeeper
        or accountant for tax filing or financial decisions.
      </p>
    </div>
  )
}
