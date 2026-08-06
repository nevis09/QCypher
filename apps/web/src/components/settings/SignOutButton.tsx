'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { logAudit } from '@/lib/actions/audit'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
  const router  = useRouter()
  const supabase = createClient()

  async function signOut() {
    await logAudit({ action: 'logout', resource_type: 'auth' })
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <button
      onClick={signOut}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px',
        background: 'rgba(239,68,68,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <LogOut style={{ width: '16px', height: '16px', color: '#ef4444' }} />
      </div>
      <span style={{ fontSize: '15px', fontWeight: 600, color: '#ef4444' }}>Sign out</span>
    </button>
  )
}
