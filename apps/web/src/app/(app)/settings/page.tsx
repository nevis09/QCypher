import { createClient } from '@/lib/supabase/server'
import { ThemeToggle } from '@/components/settings/ThemeToggle'
import { SignOutButton } from '@/components/settings/SignOutButton'
import { ModuleToggles } from '@/components/settings/ModuleToggles'
import { MissedCallSetup } from '@/components/settings/MissedCallSetup'
import { ProfileForm } from '@/components/account/ProfileForm'
import { SecurityPanel } from '@/components/account/SecurityPanel'
import { DEFAULT_SETTINGS, type TenantSettings } from '@/lib/types/settings'
import { Sun } from 'lucide-react'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Settings' }

function Section({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ marginBottom: '10px', paddingLeft: '2px' }}>
        <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))' }}>
          {label}
        </p>
        {hint && (
          <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginTop: '2px' }}>{hint}</p>
        )}
      </div>
      {children}
    </div>
  )
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: tenant }, { data: profile }] = await Promise.all([
    supabase.from('tenants').select('name, slug, settings, twilio_number').single(),
    supabase.from('users')
      .select('legal_name, nickname, phone, street, city, state, zip')
      .eq('id', user.id)
      .single(),
  ])

  const settings: TenantSettings = { ...DEFAULT_SETTINGS, ...(tenant?.settings ?? {}) }

  const identities  = user.identities ?? []
  const hasPassword = identities.some(i => i.provider === 'email')
  const hasGoogle   = identities.some(i => i.provider === 'google')
  const signedInAt  = user.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Unknown'

  return (
    <div style={{ maxWidth: '560px', paddingBottom: '64px' }}>

      {/* Page header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'hsl(var(--foreground))', letterSpacing: '-0.03em' }}>
          Settings
        </h1>
        <p style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', marginTop: '4px' }}>
          Manage your workspace and account
        </p>
      </div>

      {/* Appearance */}
      <Section label="Appearance">
        <div style={{
          borderRadius: '16px',
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '12px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
              background: 'rgba(42,82,160,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sun style={{ width: '15px', height: '15px', color: '#2a52a0' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--foreground))' }}>Theme</p>
              <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginTop: '1px' }}>Light or dark mode</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </Section>

      {/* Modules */}
      <Section label="Modules" hint="Toggle features on or off — hidden modules keep their data.">
        <ModuleToggles settings={settings} />
      </Section>

      {/* Automations */}
      <Section label="Automations">
        <MissedCallSetup currentNumber={(tenant as any)?.twilio_number ?? null} />
      </Section>

      {/* Profile */}
      <Section label="Profile">
        <ProfileForm
          initial={{
            business_name: tenant?.name ?? null,
            legal_name:    (profile as any)?.legal_name ?? null,
            nickname:      (profile as any)?.nickname   ?? null,
            phone:         (profile as any)?.phone      ?? null,
            street:        (profile as any)?.street     ?? null,
            city:          (profile as any)?.city       ?? null,
            state:         (profile as any)?.state      ?? null,
            zip:           (profile as any)?.zip        ?? null,
            email:         user.email ?? '',
          }}
        />
      </Section>

      {/* Security */}
      <Section label="Security">
        <SecurityPanel
          email={user.email ?? ''}
          hasPassword={hasPassword}
          hasGoogle={hasGoogle}
          signedInAt={signedInAt}
        />
      </Section>

      {/* Sign out */}
      <div style={{
        borderRadius: '16px',
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        overflow: 'hidden',
      }}>
        <SignOutButton />
      </div>

    </div>
  )
}
