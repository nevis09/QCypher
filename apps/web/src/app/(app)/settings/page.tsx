import { createClient } from '@/lib/supabase/server'
import { ThemeToggle } from '@/components/settings/ThemeToggle'
import { SignOutButton } from '@/components/settings/SignOutButton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: tenant } = await supabase.from('tenants').select('name, slug').single()

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>

      <section className="bg-white dark:bg-[hsl(var(--muted))] rounded-2xl border border-[hsl(var(--border))] shadow-soft divide-y divide-[hsl(var(--border))]">
        <div className="px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))] mb-3">Workspace</p>
          <p className="text-sm font-medium">{tenant?.name ?? '—'}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">/{tenant?.slug}</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))] mb-3">Account</p>
          <p className="text-sm">{user?.email}</p>
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <span className="text-sm">Appearance</span>
          <ThemeToggle />
        </div>
      </section>

      <SignOutButton />
    </div>
  )
}
