'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSuperAdminUser } from '@/lib/auth/superadmin'

export type TenantSummary = {
  id: string
  name: string
  slug: string
  plan: string | null
  created_at: string
}

async function requireSuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Re-fetch fresh app_metadata — same staleness reasoning as role checks
  // elsewhere (lib/actions/team.ts): a flag change shouldn't require the
  // caller to log out and back in before it takes effect.
  const admin = createAdminClient()
  const { data: { user: fresh } } = await admin.auth.admin.getUserById(user.id)
  if (!isSuperAdminUser(fresh)) throw new Error('Super admin only')

  return user
}

export async function listTenants(): Promise<TenantSummary[]> {
  await requireSuperAdmin()
  const admin = createAdminClient()
  const { data } = await admin
    .from('tenants')
    .select('id, name, slug, plan, created_at')
    .order('created_at', { ascending: false })
  return (data ?? []) as TenantSummary[]
}
