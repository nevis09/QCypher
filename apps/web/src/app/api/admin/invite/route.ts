/**
 * POST /api/admin/invite
 * Creates a new tenant + sends an invite link.
 * Restricted to Tenant #0 (is_admin = true). Uses service_role for user provisioning.
 * This is one of the two legitimate server-side service_role uses (the other is scripts/).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { rateLimit, LIMITS } from '@/lib/rate-limit'
import { getIp } from '@/lib/get-ip'

function adminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set')
  return createAdmin(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function POST(request: NextRequest) {
  // Rate limit
  const rl = rateLimit(`invite:${getIp(request)}`, LIMITS.invite_accept)
  if (!rl.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  // Auth: caller must be authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify caller is the admin tenant (Tenant #0)
  const { data: callerTenant } = await supabase.from('tenants').select('is_admin').single()
  if (!callerTenant?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { name, slug, email } = await request.json() as { name: string; slug: string; email: string }
  if (!name?.trim() || !slug?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'name, slug, and email are required' }, { status: 400 })
  }

  const admin = adminSupabase()

  // 1. Create tenant row
  const { data: tenant, error: tenantErr } = await admin
    .from('tenants')
    .insert({ name: name.trim(), slug: slug.trim().toLowerCase() })
    .select('id')
    .single()

  if (tenantErr) {
    return NextResponse.json({ error: tenantErr.message }, { status: 422 })
  }

  // 2. Send invite — Supabase Auth sets a magic link; we stamp app_metadata after
  const appUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('.supabase.co', '') ?? 'http://localhost:3011'
  const { data: invite, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email.trim(), {
    redirectTo: `${appUrl}/auth/callback`,
    data: { tenant_id: tenant.id },
  })

  if (inviteErr) {
    // Roll back tenant creation
    await admin.from('tenants').delete().eq('id', tenant.id)
    return NextResponse.json({ error: inviteErr.message }, { status: 422 })
  }

  // 3. Stamp tenant_id into app_metadata so auth.tenant_id() resolves correctly in RLS
  await admin.auth.admin.updateUserById(invite.user.id, {
    app_metadata: { tenant_id: tenant.id },
  })

  return NextResponse.json({ tenantId: tenant.id, email: invite.user.email })
}
