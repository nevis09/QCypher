'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient, getTenantId } from '@/lib/supabase/admin'

// 'owner' = Admin, 'member' = User, 'read_only' = Read-only (Phase 21 RBAC)
export type Role = 'owner' | 'member' | 'read_only'

export type TeamMember = {
  id: string
  email: string
  role: Role
  joined_at: string
  last_seen: string | null
}

export type PendingInvite = {
  id: string
  email: string
  role: Role
  expires_at: string
  created_at: string
}

async function getCaller() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const tenant_id = await getTenantId(user.id, user.app_metadata)

  // Re-fetch fresh app_metadata via Admin API — the caller's own JWT can be
  // stale (same staleness issue getTenantId works around), and role is a
  // security-sensitive check so we don't trust a cached token for it.
  const admin = createAdminClient()
  const { data: { user: fresh } } = await admin.auth.admin.getUserById(user.id)
  const role = (fresh?.app_metadata?.role ?? 'member') as Role

  return { userId: user.id, tenant_id, role }
}

async function getCallerTenantId() {
  return (await getCaller()).tenant_id
}

async function requireOwner() {
  const caller = await getCaller()
  if (caller.role !== 'owner') throw new Error('Only admins can manage team members')
  return caller
}

async function logTeamAudit(
  caller: { userId: string; tenant_id: string },
  action: 'role_changed' | 'user_removed',
  resource_id: string,
  details?: Record<string, unknown>,
) {
  const admin = createAdminClient()
  const { data: { user } } = await admin.auth.admin.getUserById(caller.userId)
  await admin.from('audit_logs').insert({
    tenant_id: caller.tenant_id,
    user_id: caller.userId,
    user_email: user?.email ?? '',
    action,
    resource_type: 'team',
    resource_id,
    details: details ?? null,
  })
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const tenant_id = await getCallerTenantId()
  const admin = createAdminClient()
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })

  return users
    .filter(u => u.app_metadata?.tenant_id === tenant_id)
    .map(u => ({
      id: u.id,
      email: u.email ?? '',
      role: (u.app_metadata?.role ?? 'member') as Role,
      joined_at: u.created_at,
      last_seen: u.last_sign_in_at ?? null,
    }))
    .sort((a, b) => {
      // owners first, then by join date
      if (a.role === 'owner' && b.role !== 'owner') return -1
      if (b.role === 'owner' && a.role !== 'owner') return 1
      return new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime()
    })
}

export async function getPendingInvites(): Promise<PendingInvite[]> {
  const tenant_id = await getCallerTenantId()
  const admin = createAdminClient()

  const { data } = await admin
    .from('invite_tokens')
    .select('id, email, expires_at, created_at')
    .eq('tenant_id', tenant_id)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (!data?.length) return []

  // Role isn't stored on invite_tokens — it lives on the stub auth user
  // Supabase creates at invite time (see api/team/invite/route.ts), so look
  // it up by email to display it alongside the pending invite.
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const roleByEmail = new Map(users.map(u => [u.email?.toLowerCase(), (u.app_metadata?.role ?? 'member') as Role]))

  const invites = data as { id: string; email: string; expires_at: string; created_at: string }[]
  return invites.map(invite => ({
    ...invite,
    role: roleByEmail.get(invite.email.toLowerCase()) ?? 'member',
  }))
}

export async function revokeInvite(id: string) {
  const caller = await requireOwner()
  const admin = createAdminClient()
  await admin
    .from('invite_tokens')
    .delete()
    .eq('id', id)
    .eq('tenant_id', caller.tenant_id)
}

const VALID_ROLES: Role[] = ['owner', 'member', 'read_only']

export async function updateMemberRole(memberId: string, role: Role) {
  const caller = await requireOwner()
  if (!VALID_ROLES.includes(role)) throw new Error('Invalid role')

  const admin = createAdminClient()

  // Verify the target user is in the same tenant before updating
  const { data: { user } } = await admin.auth.admin.getUserById(memberId)
  if (user?.app_metadata?.tenant_id !== caller.tenant_id) throw new Error('Forbidden')
  if (memberId === caller.userId && role !== 'owner') {
    throw new Error("You can't demote yourself — ask another admin to change your role")
  }

  await admin.auth.admin.updateUserById(memberId, {
    app_metadata: { ...user.app_metadata, role },
  })
  await logTeamAudit(caller, 'role_changed', memberId, { new_role: role, email: user.email })
}

export async function removeMember(memberId: string) {
  const caller = await requireOwner()
  const admin = createAdminClient()

  const { data: { user } } = await admin.auth.admin.getUserById(memberId)
  if (user?.app_metadata?.tenant_id !== caller.tenant_id) throw new Error('Forbidden')
  if (user?.app_metadata?.role === 'owner') throw new Error('Cannot remove an admin')

  // Remove from tenant by clearing tenant_id — account still exists but can't access this workspace
  await admin.auth.admin.updateUserById(memberId, {
    app_metadata: { ...user.app_metadata, tenant_id: null, role: null },
  })
  await logTeamAudit(caller, 'user_removed', memberId, { email: user.email })
}
