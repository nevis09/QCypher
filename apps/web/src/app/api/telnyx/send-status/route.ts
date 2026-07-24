import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateTelnyxSignature } from '@/lib/telnyx'

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sig     = req.headers.get('telnyx-signature-ed25519') ?? ''
  const ts      = req.headers.get('telnyx-timestamp') ?? ''

  if (process.env.TELNYX_PUBLIC_KEY && !validateTelnyxSignature(rawBody, sig, ts)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: Record<string, unknown>
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventType = (event.data as Record<string, unknown>)?.event_type as string ?? ''
  const payload   = (event.data as Record<string, unknown>)?.payload as Record<string, unknown> ?? {}

  // Only handle message delivery events
  if (!eventType.startsWith('message.')) {
    return NextResponse.json({ ok: true })
  }

  const providerId = payload.id as string
  if (!providerId) return NextResponse.json({ ok: true })

  const statusMap: Record<string, string> = {
    'message.sent':      'sent',
    'message.delivered': 'delivered',
    'message.failed':    'failed',
  }

  const status = statusMap[eventType]
  if (!status) return NextResponse.json({ ok: true })

  const error = status === 'failed'
    ? ((payload.errors as Array<{ detail?: string }>)?.[0]?.detail ?? 'Delivery failed')
    : null

  await db
    .from('send_log')
    .update({ status, error, ...(status === 'delivered' ? { delivered_at: new Date().toISOString() } : {}) })
    .eq('provider_id', providerId)

  return NextResponse.json({ ok: true })
}
