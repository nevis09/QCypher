/**
 * One-time (or re-run-as-needed) script that stamps app_metadata.is_super_admin
 * on the two designated super admin accounts. This is the ONLY place their
 * emails are hardcoded — the actual authorization checks throughout the app
 * and in RLS policies read the DB-backed flag (app_metadata.is_super_admin),
 * not this list, so granting/revoking super admin status going forward is a
 * data change, not a code deploy. Re-run this script any time the roster
 * of super admins changes.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx ts-node scripts/seed-super-admins.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL ?? ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
  process.exit(1)
}

const SUPER_ADMIN_EMAILS = ['nevis09@gmail.com', 'qcyphertech@gmail.com']

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  const { data: { users }, error } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (error) throw error

  for (const email of SUPER_ADMIN_EMAILS) {
    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    if (!user) {
      console.warn(`⚠️  No account found for ${email} — they must sign up first, then re-run this script.`)
      continue
    }
    if (user.app_metadata?.is_super_admin === true) {
      console.log(`✓ ${email} already flagged as super admin`)
      continue
    }
    const { error: updateErr } = await admin.auth.admin.updateUserById(user.id, {
      app_metadata: { ...user.app_metadata, is_super_admin: true },
    })
    if (updateErr) {
      console.error(`✗ Failed to flag ${email}:`, updateErr.message)
    } else {
      console.log(`✓ Flagged ${email} as super admin`)
    }
  }
}

main().catch(err => { console.error(err); process.exit(1) })
