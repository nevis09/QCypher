import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'
import { DEFAULT_SETTINGS, type TenantSettings } from '@/lib/types/settings'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: tenant } = await supabase.from('tenants').select('is_admin, settings, name').single()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings: TenantSettings = { ...DEFAULT_SETTINGS, ...((tenant as any)?.settings ?? {}) }

  const businessName = (tenant as { name?: string } | null)?.name ?? ''
  const words = businessName.trim().split(/\s+/).filter(Boolean)
  const initials = words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : (businessName.slice(0, 2).toUpperCase() || (user.email ?? 'U').slice(0, 2).toUpperCase())

  return (
    <AppShell
      isAdmin={(tenant as { is_admin?: boolean } | null)?.is_admin ?? false}
      settings={settings}
      userInitial={initials}>
      {children}
    </AppShell>
  )
}
