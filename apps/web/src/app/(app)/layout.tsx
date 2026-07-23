import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'
import { DEFAULT_SETTINGS, type TenantSettings } from '@/lib/types/settings'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: tenant } = await supabase.from('tenants').select('is_admin, settings').single()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings: TenantSettings = { ...DEFAULT_SETTINGS, ...((tenant as any)?.settings ?? {}) }

  const meta = user.user_metadata as { full_name?: string; name?: string } | undefined
  const displayName = meta?.full_name ?? meta?.name ?? user.email ?? ''
  const initial = displayName.charAt(0).toUpperCase() || 'U'

  return (
    <AppShell
      isAdmin={(tenant as { is_admin?: boolean } | null)?.is_admin ?? false}
      settings={settings}
      userInitial={initial}>
      {children}
    </AppShell>
  )
}
