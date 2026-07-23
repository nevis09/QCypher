import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getServiceStats, getChecklist } from '@/lib/actions/admin'
import { TenantDetail } from '@/components/admin/TenantDetail'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Tenant Detail — Admin' }

function adminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

export default async function TenantDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: callerTenant } = await supabase.from('tenants').select('is_admin').single()
  if (!(callerTenant as { is_admin?: boolean } | null)?.is_admin) redirect('/contacts')

  const admin = adminSupabase()
  const { data: tenant } = await admin
    .from('tenants')
    .select('id, name, slug, plan, status, created_at')
    .eq('id', params.id)
    .single()

  if (!tenant) notFound()

  const [stats, checklist] = await Promise.all([
    getServiceStats(params.id),
    getChecklist(params.id),
  ])

  return (
    <TenantDetail
      tenant={tenant as any}
      stats={stats}
      checklist={checklist}
    />
  )
}
