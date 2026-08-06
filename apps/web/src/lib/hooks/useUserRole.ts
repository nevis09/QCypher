'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Role } from '@/lib/actions/team'

// Phase 21 RBAC — client-side role check for conditional UI rendering.
// 'owner' = Admin, 'member' = User, 'read_only' = Read-only.
// Reads role from the session JWT's app_metadata, so it can lag a step
// behind a role change made by an admin until the next token refresh
// (same staleness tradeoff as auth.tenant_id() server-side — see
// lib/actions/team.ts, which re-fetches fresh metadata for its own
// authorization checks rather than trusting this client-side value).
export function useUserRole() {
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled) return
      setRole((user?.app_metadata?.role as Role | undefined) ?? 'member')
      setLoading(false)
    })

    return () => { cancelled = true }
  }, [])

  return {
    role,
    loading,
    isAdmin: role === 'owner',
    isReadOnly: role === 'read_only',
    canEdit: role === 'owner' || role === 'member',
  }
}
