/**
 * POST /api/telnyx/provision
 *
 * Provisions a Telnyx phone number for the authenticated tenant.
 * - Searches available US local numbers by area code
 * - Buys the first available one
 * - Configures its voice webhook to point at /api/telnyx/voice
 * - Saves the number to tenants.telnyx_number
 *
 * Body: { areaCode: string }
 * Returns: { number: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchAvailableNumbers, buyAndConfigureNumber } from '@/lib/telnyx'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { areaCode } = await request.json() as { areaCode?: string }
  if (!areaCode || !/^\d{3}$/.test(areaCode)) {
    return NextResponse.json({ error: 'Valid 3-digit area code required' }, { status: 400 })
  }

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, telnyx_number')
    .single()

  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
  if ((tenant as any).telnyx_number) {
    return NextResponse.json({ number: (tenant as any).telnyx_number })
  }

  const voiceWebhookUrl = `${process.env.APP_URL}/api/telnyx/voice`

  try {
    const available = await searchAvailableNumbers(areaCode)
    if (!available.length) {
      return NextResponse.json(
        { error: `No numbers available in area code ${areaCode}. Try a nearby area code.` },
        { status: 422 },
      )
    }

    const number = await buyAndConfigureNumber(available[0], voiceWebhookUrl)

    const { error } = await supabase
      .from('tenants')
      .update({ telnyx_number: number })
      .eq('id', tenant.id)

    if (error) throw new Error(error.message)

    return NextResponse.json({ number })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to provision number'
    console.error('[telnyx/provision]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
