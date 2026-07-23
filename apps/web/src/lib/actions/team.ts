'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient, getTenantId } from '@/lib/supabase/admin'

export type TeamMember = {
  id: string
  email: string
  role: 'owner' | 'member'
  joined_at: string
  last_seen: string | null
}

export type PendingInvite = {
  id: string
  email: string
  expires_at: string
  created_at: string
}

async function getCallerTenantId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return getTenantId(user.id, user.app_metadata)
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
      role: (u.app_metadata?.role ?? 'member') as 'owner' | 'member',
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

  return (data ?? []) as PendingInvite[]
}

export async function revokeInvite(id: string) {
  const tenant_id = await getCallerTenantId()
  const admin = createAdminClient()
  await admin
    .from('invite_tokens')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenant_id)
}

export async function updateMemberRole(memberId: string, role: 'owner' | 'member') {
  const tenant_id = await getCallerTenantId()
  const admin = createAdminClient()

  // Verify the target user is in the same tenant before updating
  const { data: { user } } = await admin.auth.admin.getUserById(memberId)
  if (user?.app_metadata?.tenant_id !== tenant_id) throw new Error('Forbidden')

  await admin.auth.admin.updateUserById(memberId, {
    app_metadata: { ...user.app_metadata, role },
  })
}

export async function removeMember(memberId: string) {
  const tenant_id = await getCallerTenantId()
  const admin = createAdminClient()

  const { data: { user } } = await admin.auth.admin.getUserById(memberId)
  if (user?.app_metadata?.tenant_id !== tenant_id) throw new Error('Forbidden')
  if (user?.app_metadata?.role === 'owner') throw new Error('Cannot remove the owner')

  // Remove from tenant by clearing tenant_id — account still exists but can't access this workspace
  await admin.auth.admin.updateUserById(memberId, {
    app_metadata: { ...user.app_metadata, tenant_id: null, role: null },
  })
}
