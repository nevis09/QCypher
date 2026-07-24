import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateTelnyxSignature, sendSms, texmlHangup } from '@/lib/telnyx'
import { interpolate } from '@/lib/template-interpolate'

const db = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

export async function POST(req: NextRequest) {
  const rawBody  = await req.text()
  const sig      = req.headers.get('telnyx-signature-ed25519') ?? ''
  const ts       = req.headers.get('telnyx-timestamp') ?? ''

  // Validate signature — skip in dev if public key not set
  if (process.env.TELNYX_PUBLIC_KEY && !validateTelnyxSignature(rawBody, sig, ts)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: Record<string, unknown>
  try {
    event = JSON.parse(rawBody)
  } catch {
    return new NextResponse(texmlHangup(), { headers: { 'Content-Type': 'text/xml' } })
  }

  // Telnyx wraps events in data.payload
  const payload = (event.data as Record<string, unknown>)?.payload as Record<string, unknown> ?? event
  const eventType  = (event.data as Record<string, unknown>)?.event_type as string ?? ''

  // Only handle incoming call events
  if (eventType && eventType !== 'call.initiated') {
    return new NextResponse(texmlHangup(), { headers: { 'Content-Type': 'text/xml' } })
  }

  const callerPhone = (payload.from as string) ?? (payload.caller_id_number as string) ?? ''
  const toNumber    = (payload.to as string)   ?? (payload.called_number as string)    ?? ''

  if (!callerPhone || !toNumber) {
    return new NextResponse(texmlHangup(), { headers: { 'Content-Type': 'text/xml' } })
  }

  const supabase = db()

  // Look up tenant by their Telnyx number
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name')
    .eq('telnyx_number', toNumber)
    .single()

  if (!tenant) {
    return new NextResponse(texmlHangup(), { headers: { 'Content-Type': 'text/xml' } })
  }

  // Match or create contact by caller phone
  let contactId: string | null = null
  const { data: existing } = await supabase
    .from('contacts')
    .select('id')
    .eq('tenant_id', tenant.id)
    .eq('phone', callerPhone)
    .single()

  if (existing) {
    contactId = existing.id
  } else {
    const { data: created } = await supabase
      .from('contacts')
      .insert({ tenant_id: tenant.id, first_name: callerPhone, phone: callerPhone })
      .select('id')
      .single()
    contactId = created?.id ?? null
  }

  // Find the first non-marketing SMS template for this tenant
  const { data: template } = await supabase
    .from('templates')
    .select('id, body, name')
    .eq('tenant_id', tenant.id)
    .eq('channel', 'sms')
    .eq('is_marketing', false)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  let smsSent  = false
  let smsError: string | null = null
  let providerId: string | null = null

  if (template) {
    const body = interpolate(template.body, {
      first_name:    callerPhone,
      business_name: tenant.name ?? undefined,
    })

    const result = await sendSms({ to: callerPhone, body })
    if ('id' in result) {
      smsSent    = true
      providerId = result.id
    } else {
      smsError = result.error
    }

    // Log to send_log
    await supabase.from('send_log').insert({
      tenant_id:   tenant.id,
      contact_id:  contactId,
      template_id: template.id,
      channel:     'sms',
      recipient:   callerPhone,
      body,
      status:      smsSent ? 'sent' : 'failed',
      provider_id: providerId,
      error:       smsError,
      sent_at:     smsSent ? new Date().toISOString() : null,
    })
  }

  // Log the call
  await supabase.from('calls').insert({
    tenant_id:   tenant.id,
    caller_phone: callerPhone,
    contact_id:  contactId,
    sms_sent:    smsSent,
    sms_error:   smsError,
    occurred_at: new Date().toISOString(),
  })

  // Log to interactions timeline if we have a contact
  if (contactId) {
    await supabase.from('interactions').insert({
      contact_id:  contactId,
      type:        'note',
      body:        smsSent
        ? `Missed call — text-back sent automatically`
        : `Missed call — text-back failed: ${smsError ?? 'unknown error'}`,
      occurred_at: new Date().toISOString(),
    })
  }

  return new NextResponse(texmlHangup(), { headers: { 'Content-Type': 'text/xml' } })
}
