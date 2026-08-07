'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSuperAdminEmail } from '@/lib/auth/superadmin'

// Scope decision: this is a read-only "view as tenant" for troubleshooting,
// not a full auth session swap (impersonating the target tenant's actual
// login). A true swap would mean minting a session under the client's
// identity, which is a much bigger, riskier change to the auth model.
// This still satisfies the practical goal — a super admin can inspect a
// tenant's contacts, team, and audit trail — with every session logged to
// impersonation_logs per the spec.

async function requireSuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdminEmail(user.email)) throw new Error('Super admin only')
  return user
}

export async function startImpersonation(tenant_id: string, reason?: string) {
  const user = await requireSuperAdmin()
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('impersonation_logs')
    .insert({ super_admin_id: user.id, tenant_id, reason: reason ?? null })
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  return data.id as string
}

export async function endImpersonation(logId: string) {
  await requireSuperAdmin()
  const admin = createAdminClient()
  await admin.from('impersonation_logs').update({ ended_at: new Date().toISOString() }).eq('id', logId)
}

export async function getTenantSnapshot(tenant_id: string) {
  await requireSuperAdmin()
  const admin = createAdminClient()

  const [{ data: tenant }, { count: contactCount }, { data: { users } }] = await Promise.all([
    admin.from('tenants').select('id, name, slug, created_at').eq('id', tenant_id).single(),
    admin.from('contacts').select('*', { count: 'exact', head: true }).eq('tenant_id', tenant_id),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ])

  const members = users
    .filter(u => u.app_metadata?.tenant_id === tenant_id)
    .map(u => ({ id: u.id, email: u.email ?? '', role: (u.app_metadata?.role ?? 'member') as string }))

  const { data: recentAudit } = await admin
    .from('audit_logs')
    .select('id, user_email, action, resource_name, created_at')
    .eq('tenant_id', tenant_id)
    .order('created_at', { ascending: false })
    .limit(10)

  return {
    tenant: tenant as { id: string; name: string; slug: string; created_at: string } | null,
    contactCount: contactCount ?? 0,
    members,
    recentAudit: recentAudit ?? [],
  }
}
