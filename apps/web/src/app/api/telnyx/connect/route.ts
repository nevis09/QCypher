/**
 * POST /api/telnyx/connect
 *
 * Saves an existing Telnyx number to the tenant and confirms its voice webhook.
 * Body: { phoneNumber: string }  — E.164 format, e.g. +14045551234
 * Returns: { number: string, webhookUrl: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { configureExistingNumber } from '@/lib/telnyx'

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { phoneNumber } = await request.json() as { phoneNumber?: string }
  if (!phoneNumber || !/^\+1\d{10}$/.test(phoneNumber)) {
    return NextResponse.json(
      { error: 'Enter a valid US number in E.164 format, e.g. +14045551234' },
      { status: 400 },
    )
  }

  // Use RLS client to resolve the tenant for this user
  const { data: tenant } = await supabase.from('tenants').select('id').single()
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

  const webhookUrl = `${process.env.APP_URL}/api/telnyx/voice`

  try {
    await configureExistingNumber(phoneNumber, webhookUrl)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to configure number'
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  // Tenants table has no client UPDATE policy — use service role to write
  const { error } = await serviceClient()
    .from('tenants')
    .update({ telnyx_number: phoneNumber })
    .eq('id', tenant.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ number: phoneNumber, webhookUrl })
}
