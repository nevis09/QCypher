import { Eye } from 'lucide-react'

// Phase 21 RBAC — shown wherever a read-only user lands on a page that
// normally has create/edit/delete actions, so the missing buttons make
// sense rather than looking like a bug.
export function ReadOnlyBanner() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '10px 14px', borderRadius: '12px',
      background: 'rgba(161,98,7,0.08)', border: '1px solid rgba(161,98,7,0.18)',
    }}>
      <Eye style={{ width: '15px', height: '15px', color: '#a16207', flexShrink: 0 }} />
      <p style={{ fontSize: '14px', fontWeight: 600, color: '#a16207' }}>
        You have view-only access — changes are disabled for this account.
      </p>
    </div>
  )
}
