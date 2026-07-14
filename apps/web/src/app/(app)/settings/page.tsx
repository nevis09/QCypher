import { createClient } from '@/lib/supabase/server'
import { ThemeToggle } from '@/components/settings/ThemeToggle'
import { SignOutButton } from '@/components/settings/SignOutButton'
import { ModuleToggles } from '@/components/settings/ModuleToggles'
import { AccountTabs } from '@/components/account/AccountTabs'
import { ProfileForm } from '@/components/account/ProfileForm'
import { SecurityPanel } from '@/components/account/SecurityPanel'
import { DEFAULT_SETTINGS, type TenantSettings } from '@/lib/types/settings'
import { Building2, Palette, ChevronRight } from 'lucide-react'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Settings' }

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: '15px', fontWeight: 700, letterSpacing: '0.07em',
      textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))',
      marginBottom: '8px', paddingLeft: '4px',
    }}>
      {children}
    </p>
  )
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      borderRadius: '18px',
      background: 'hsl(var(--card))',
      border: '1px solid hsl(var(--border))',
      overflow: 'hidden',
    }}>
      {children}
    </div>
  )
}

function SettingsRow({
  icon,
  iconBg,
  label,
  value,
  action,
  divider = true,
}: {
  icon: React.ReactNode
  iconBg: string
  label: string
  value?: string
  action?: React.ReactNode
  divider?: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '14px 16px',
      borderBottom: divider ? '1px solid hsl(var(--border))' : 'none',
    }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px',
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '15px', fontWeight: 600, color: 'hsl(var(--foreground))', marginBottom: value ? '1px' : 0 }}>
          {label}
        </p>
        {value && (
          <p style={{ fontSize: '15px', color: 'hsl(var(--muted-foreground))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {value}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: tenant }, { data: profile }] = await Promise.all([
    supabase.from('tenants').select('name, slug, settings').single(),
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

  const initial = user.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <div style={{ maxWidth: '560px', paddingBottom: '48px' }}>

      {/* Page header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'hsl(var(--foreground))', letterSpacing: '-0.02em' }}>
          Settings
        </h1>
        <p style={{ fontSize: '15px', color: 'hsl(var(--muted-foreground))', marginTop: '4px' }}>
          Workspace, appearance, and account preferences
        </p>
      </div>

      {/* Workspace hero */}
      <div style={{
        borderRadius: '20px',
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        padding: '20px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: '-10px', top: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', right: '60px', bottom: '-30px', width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>{initial}</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {tenant?.name ?? 'Your Workspace'}
            </p>
            {tenant?.slug && (
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)' }}>
                qcyphertech.com/{tenant.slug}
              </p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', position: 'relative' }}>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '10px', padding: '8px 14px', flex: 1 }}>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', marginBottom: '2px' }}>Email</p>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '10px', padding: '8px 14px' }}>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', marginBottom: '2px' }}>Signed in</p>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>{signedInAt}</p>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div style={{ marginBottom: '28px' }}>
        <SectionLabel>Appearance</SectionLabel>
        <SettingsCard>
          <SettingsRow
            icon={<Palette style={{ width: '17px', height: '17px', color: '#6366f1' }} />}
            iconBg="rgba(99,102,241,0.12)"
            label="Theme"
            value="Light / Dark mode"
            action={<ThemeToggle />}
            divider={false}
          />
        </SettingsCard>
      </div>

      {/* Modules */}
      <div style={{ marginBottom: '28px' }}>
        <SectionLabel>Modules</SectionLabel>
        <p style={{ fontSize: '15px', color: 'hsl(var(--muted-foreground))', marginBottom: '10px', paddingLeft: '4px' }}>
          Toggle features on or off. Hidden modules keep all their data.
        </p>
        <ModuleToggles settings={settings} />
      </div>

      {/* Account */}
      <div style={{ marginBottom: '32px' }}>
        <SectionLabel>Account</SectionLabel>
        <AccountTabs
          profile={
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
          }
          security={
            <SecurityPanel
              email={user.email ?? ''}
              hasPassword={hasPassword}
              hasGoogle={hasGoogle}
              signedInAt={signedInAt}
            />
          }
        />
      </div>

      {/* Sign out */}
      <SettingsCard>
        <SignOutButton />
      </SettingsCard>

    </div>
  )
}
