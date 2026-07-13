/**
 * POST /api/send
 * Sends a quick-reply template via Resend (email) or Twilio (SMS).
 * Runs server-side only — API keys are never exposed to the client.
 * Logs every send attempt to send_log for audit trail.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? ''
const RESEND_FROM    = process.env.RESEND_FROM_EMAIL ?? 'noreply@example.com'

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID ?? ''
const TWILIO_AUTH_TOKEN  = process.env.TWILIO_AUTH_TOKEN ?? ''
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER ?? ''

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { templateId, contactId, channel, preview } = await request.json() as {
    templateId: string
    contactId: string
    channel: 'email' | 'sms'
    preview: string
  }

  if (!templateId || !contactId || !channel || !preview) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Fetch template and contact — RLS ensures they belong to the caller's tenant
  const [{ data: template }, { data: contact }] = await Promise.all([
    supabase.from('templates').select('*').eq('id', templateId).single(),
    supabase.from('contacts').select('*').eq('id', contactId).single(),
  ])

  if (!template || !contact) {
    return NextResponse.json({ error: 'Template or contact not found' }, { status: 404 })
  }

  const recipient = channel === 'email' ? contact.email : contact.phone
  if (!recipient) {
    return NextResponse.json({ error: `Contact has no ${channel} address` }, { status: 422 })
  }

  // Insert queued log entry
  const { data: logEntry } = await supabase
    .from('send_log')
    .insert({
      contact_id: contactId,
      template_id: templateId,
      channel,
      recipient,
      subject: channel === 'email' ? template.subject : null,
      body: preview,
      status: 'queued',
    })
    .select('id')
    .single()

  const logId = logEntry?.id

  try {
    let providerId: string | undefined

    if (channel === 'email') {
      if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured')
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: RESEND_FROM,
          to: [recipient],
          subject: template.subject ?? '(no subject)',
          text: preview,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Resend error')
      providerId = data.id
    } else {
      if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) throw new Error('Twilio credentials not configured')
      const params = new URLSearchParams({ From: TWILIO_FROM_NUMBER, To: recipient, Body: preview })
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Twilio error')
      providerId = data.sid
    }

    // Update log to sent
    if (logId) {
      await supabase.from('send_log').update({ status: 'sent', provider_id: providerId, sent_at: new Date().toISOString() }).eq('id', logId)
    }

    return NextResponse.json({ ok: true, providerId })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (logId) {
      await supabase.from('send_log').update({ status: 'failed', error: msg }).eq('id', logId)
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
