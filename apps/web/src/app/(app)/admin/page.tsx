import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
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

  // Gate: caller's own tenant must have is_admin=true (read through RLS)
  const { data: callerTenant } = await supabase.from('tenants').select('is_admin').single()
  if (!callerTenant?.is_admin) redirect('/contacts')

  // Fetch all tenants via service_role (admin view crosses RLS boundary by design)
  const admin = adminSupabase()
  const { data: tenants } = await admin
    .from('tenants')
    .select('id, name, slug, plan, status, is_admin, created_at')
    .order('created_at', { ascending: true })

  return <AdminDashboard tenants={tenants ?? []} />
}
