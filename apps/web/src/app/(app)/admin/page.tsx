import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { isSuperAdminUser } from '@/lib/auth/superadmin'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin' }

function adminSupabase() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

export default async function AdminPage() {
  // Auth via RLS-scoped client
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Gate: DB-backed super admin flag (app_metadata.is_super_admin), OR
  // caller's own tenant has is_admin=true (the original Tenant #0 gating,
  // kept for backward compat)
  const admin = adminSupabase()
  const { data: { user: fresh } } = await admin.auth.admin.getUserById(user.id)
  const isSuperAdmin = isSuperAdminUser(fresh)

  const { data: callerTenant } = await supabase.from('tenants').select('is_admin').single()
  if (!isSuperAdmin && !(callerTenant as { is_admin?: boolean } | null)?.is_admin) {
    redirect('/contacts')
  }

  // Fetch all tenants via service_role (admin view crosses RLS boundary by design)
  const { data: tenants } = await admin
    .from('tenants')
    .select('id, name, slug, plan, status, is_admin, created_at')
    .order('created_at', { ascending: true })

  return <AdminDashboard tenants={tenants ?? []} isSuperAdmin={isSuperAdmin} />
}
