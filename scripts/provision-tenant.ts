/**
 * Server-side tenant provisioning script.
 *
 * This is the ONE legitimate use of the service_role key:
 * creating a tenant row and setting app_metadata on the invited user.
 * This script MUST only run in a secure server environment (CI, admin CLI).
 * It is never imported by or bundled into the Next.js app.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   npx ts-node scripts/provision-tenant.ts \
 *     --name "Acme Plumbing" --slug "acme-plumbing" --email "owner@acmeplumbing.com"
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL ?? ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
  process.exit(1)
}

const args = Object.fromEntries(
  process.argv.slice(2).reduce<string[][]>((acc, arg, i, arr) => {
    if (arg.startsWith('--')) acc.push([arg.slice(2), arr[i + 1]])
    return acc
  }, []),
)

const { name, slug, email } = args
if (!name || !slug || !email) {
  console.error('Usage: provision-tenant.ts --name "..." --slug "..." --email "..."')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function run() {
  // 1. Create tenant row
  const { data: tenant, error: tenantErr } = await admin
    .from('tenants')
    .insert({ name, slug })
    .select('id')
    .single()

  if (tenantErr) throw tenantErr
  console.log(`Tenant created: ${tenant.id}`)

  // 2. Send invite email to owner
  const { data: invite, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { tenant_id: tenant.id },
    redirectTo: `${process.env.APP_URL ?? 'http://localhost:3011'}/auth/callback`,
  })

  if (inviteErr) throw inviteErr

  // 3. Stamp tenant_id into app_metadata (used by auth.tenant_id() in RLS)
  const { error: metaErr } = await admin.auth.admin.updateUserById(invite.user.id, {
    app_metadata: { tenant_id: tenant.id },
  })

  if (metaErr) throw metaErr

  console.log(`Invite sent to ${email}. Tenant ID: ${tenant.id}`)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
