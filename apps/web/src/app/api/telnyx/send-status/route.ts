/**
 * POST /api/telnyx/send-status
 *
 * One-tap job-status SMS. Called by JobStatusSmsPrompt when staff taps "Send".
 * Looks up the matching template by name, interpolates variables, sends via
 * Telnyx, and logs the send.
 *
 * Body: { templateName: string, contactId: string, businessName: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSms } from '@/lib/telnyx'
import { interpolate, appendOptOut } from '@/lib/template-interpolate'

const TELNYX_FROM = process.env.TELNYX_FROM_NUMBER ?? ''

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { templateName, contactId, businessName } = await request.json() as {
    templateName: string
    contactId: string
    businessName: string
  }

  if (!templateName || !contactId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data: template } = await supabase
    .from('templates')
    .select('id, body, is_marketing')
    .eq('channel', 'sms')
    .ilike('name', templateName)
    .maybeSingle()

  if (!template) {
    return NextResponse.json({ error: `Template "${templateName}" not found` }, { status: 404 })
  }

  const { data: contact } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, phone')
    .eq('id', contactId)
    .single()

  if (!contact?.phone) {
    return NextResponse.json({ error: 'Contact has no phone number' }, { status: 422 })
  }

  let body = interpolate(template.body, {
    first_name:    contact.first_name,
    last_name:     contact.last_name,
    business_name: businessName,
  })

  if (template.is_marketing) body = appendOptOut(body)

  const result = await sendSms({ from: TELNYX_FROM, to: contact.phone, body })
  const success = 'id' in result

  await supabase.from('send_log').insert({
    contact_id:  contactId,
    template_id: template.id,
    channel:     'sms',
    recipient:   contact.phone,
    body,
    status:      success ? 'sent' : 'failed',
    provider_id: success ? result.id : null,
    error:       success ? null : (result as { error: string }).error,
    sent_at:     success ? new Date().toISOString() : null,
  })

  if (success) {
    await supabase.from('interactions').insert({
      contact_id:  contactId,
      type:        'note',
      body:        `SMS sent: "${templateName}" — ${body.slice(0, 80)}${body.length > 80 ? '…' : ''}`,
      occurred_at: new Date().toISOString(),
    })
  }

  if (!success) {
    return NextResponse.json({ error: (result as { error: string }).error }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
