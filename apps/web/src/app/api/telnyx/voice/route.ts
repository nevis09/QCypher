/**
 * POST /api/telnyx/voice
 *
 * Telnyx calls this webhook when an inbound call arrives on a tenant's
 * provisioned forwarding number (tenant forwards their existing number
 * → this Telnyx number on no-answer, so arriving here = missed call).
 *
 * Flow:
 *  1. Validate Telnyx webhook signature (reject unsigned requests)
 *  2. Look up tenant by the `To` number (their provisioned Telnyx number)
 *  3. Match `From` phone to an existing contact; create one if not found
 *  4. Look up tenant's "Missed call follow-up" SMS template
 *  5. Send the text-back from the tenant's Telnyx number
 *  6. Log to `calls` table + `interactions` timeline
 *  7. Return TeXML hangup
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateTelnyxSignature, sendSms, texmlHangup } from '@/lib/telnyx'
import { interpolate } from '@/lib/template-interpolate'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

function normalizePhone(raw: string): string {
  return raw.trim()
}

export async function POST(request: NextRequest) {
  const body        = await request.text()
  const contentType = request.headers.get('content-type') ?? ''

  // Telnyx signs both TeXML (form-encoded) and Call Control (JSON) webhooks
  // with the same Ed25519 mechanism — validate on every request.
  const signature = request.headers.get('telnyx-signature-ed25519') ?? ''
  const timestamp = request.headers.get('telnyx-timestamp') ?? ''

  if (!validateTelnyxSignature(body, signature, timestamp)) {
    console.warn('[telnyx/voice] invalid signature — rejecting')
    return new NextResponse('Forbidden', { status: 403 })
  }

  let callerPhone: string
  let toNumber: string
  let callSid: string | null

  if (contentType.includes('application/json')) {
    let payload: Record<string, unknown>
    try { payload = JSON.parse(body) } catch {
      return new NextResponse('Bad Request', { status: 400 })
    }
    const eventData   = (payload.data as Record<string, unknown>) ?? {}
    const callPayload = (eventData.payload as Record<string, unknown>) ?? {}
    callerPhone = normalizePhone((callPayload.from as string) ?? '')
    toNumber    = normalizePhone((callPayload.to as string) ?? '')
    callSid     = (callPayload.call_control_id as string) ?? null
  } else {
    // TeXML: form-encoded fields From, To, CallSid
    const form  = new URLSearchParams(body)
    callerPhone = normalizePhone(form.get('From') ?? '')
    toNumber    = normalizePhone(form.get('To') ?? '')
    callSid     = form.get('CallSid') ?? null
  }

  if (!callerPhone || !toNumber) {
    return new NextResponse(texmlHangup(), { headers: { 'Content-Type': 'text/xml' } })
  }

  const supabase = serviceClient()

  // ── 2. Find tenant by their provisioned Telnyx number ────────────────────
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name, telnyx_number')
    .eq('telnyx_number', toNumber)
    .single()

  if (!tenant) {
    console.warn('[telnyx/voice] no tenant found for number', toNumber)
    return new NextResponse(texmlHangup(), { headers: { 'Content-Type': 'text/xml' } })
  }

  const tenantId     = tenant.id
  const businessName = tenant.name ?? ''

  // ── 3. Match / create contact ─────────────────────────────────────────────
  let contactId: string | null = null
  let contactFirstName = ''

  const { data: existing } = await supabase
    .from('contacts')
    .select('id, first_name')
    .eq('tenant_id', tenantId)
    .eq('phone', callerPhone)
    .maybeSingle()

  if (existing) {
    contactId        = existing.id
    contactFirstName = existing.first_name ?? ''
  } else {
    const { data: created } = await supabase
      .from('contacts')
      .insert({
        tenant_id:  tenantId,
        first_name: 'Unknown',
        phone:      callerPhone,
        source:     'missed_call',
        tags:       ['missed_call'],
        status:     'lead',
      })
      .select('id')
      .single()

    contactId = created?.id ?? null
  }

  // ── 4. Find the "Missed call follow-up" template ──────────────────────────
  const { data: template } = await supabase
    .from('templates')
    .select('id, body, is_marketing')
    .eq('tenant_id', tenantId)
    .eq('channel', 'sms')
    .ilike('name', '%missed call%')
    .maybeSingle()

  // ── 5. Send the text-back ─────────────────────────────────────────────────
  let smsSent  = false
  let smsError: string | null = null

  if (template) {
    const msgBody = interpolate(template.body, {
      first_name:    contactFirstName || undefined,
      business_name: businessName,
    })

    const result = await sendSms({ from: toNumber, to: callerPhone, body: msgBody })

    if ('id' in result) {
      smsSent = true
      await supabase.from('send_log').insert({
        tenant_id:   tenantId,
        contact_id:  contactId,
        template_id: template.id,
        channel:     'sms',
        recipient:   callerPhone,
        body:        msgBody,
        status:      'sent',
        provider_id: result.id,
        sent_at:     new Date().toISOString(),
      })
    } else {
      smsError = result.error
      console.error('[telnyx/voice] sms send failed:', result.error)
    }
  } else {
    console.warn('[telnyx/voice] no missed-call template found for tenant', tenantId)
  }

  // ── 6. Log call + interaction ─────────────────────────────────────────────
  await supabase.from('calls').insert({
    tenant_id:    tenantId,
    caller_phone: callerPhone,
    provider_call_sid: callSid,
    contact_id:   contactId,
    sms_sent:     smsSent,
    sms_error:    smsError,
    occurred_at:  new Date().toISOString(),
  })

  if (contactId) {
    const note = smsSent
      ? `Missed call from ${callerPhone}. Auto text-back sent.`
      : `Missed call from ${callerPhone}. Text-back could not be sent${smsError ? ': ' + smsError : ''}.`

    await supabase.from('interactions').insert({
      tenant_id:   tenantId,
      contact_id:  contactId,
      type:        'call',
      body:        note,
      occurred_at: new Date().toISOString(),
    })
  }

  // ── 7. TeXML hangup ───────────────────────────────────────────────────────
  const texml = texmlHangup(
    smsSent
      ? `Thanks for calling ${businessName}. We missed you, but we just sent you a text message.`
      : `Thanks for calling ${businessName}. We missed your call and will get back to you shortly.`
  )

  return new NextResponse(texml, { headers: { 'Content-Type': 'text/xml' } })
}
