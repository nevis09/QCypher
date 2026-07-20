/**
 * POST /api/twilio/connect
 *
 * Saves an existing Twilio number to the tenant and configures its voice webhook.
 * Body: { phoneNumber: string }  — E.164 format, e.g. +14045551234
 * Returns: { number: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { configureExistingNumber } from '@/lib/twilio'

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

  const { data: tenant } = await supabase.from('tenants').select('id').single()
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

  const voiceWebhookUrl = `${process.env.APP_URL}/api/twilio/voice`

  try {
    await configureExistingNumber(phoneNumber, voiceWebhookUrl)

    const { error } = await supabase
      .from('tenants')
      .update({ twilio_number: phoneNumber })
      .eq('id', tenant.id)

    if (error) throw new Error(error.message)

    return NextResponse.json({ number: phoneNumber })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to connect number'
    console.error('[twilio/connect]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
