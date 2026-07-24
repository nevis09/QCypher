import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Helcim pings the URL with GET to validate it when saving webhook settings
export async function GET() {
  return NextResponse.json({ ok: true })
}

// Helcim sends webhook events for payment confirmations.
// Helcim embeds the verifier token in the request body; we validate it before trusting the event.
export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  const secret = process.env.HELCIM_WEBHOOK_SECRET ?? ''
  if (!secret) {
    console.error('[helcim-webhook] HELCIM_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: { eventType?: string; transactionId?: string; status?: string; invoiceNumber?: string; amount?: number; verifierToken?: string }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Validate Helcim verifier token sent in the body
  if (event.verifierToken !== secret) {
    return NextResponse.json({ error: 'Invalid verifier token' }, { status: 401 })
  }

  if (event.eventType !== 'TRANSACTION_APPROVED') {
    // Acknowledge but ignore non-payment events
    return NextResponse.json({ ok: true })
  }

  if (!event.transactionId || !event.invoiceNumber) {
    return NextResponse.json({ ok: true })
  }

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )

  // invoiceNumber is the last 8 chars of order.id (set in initHelcimCheckout)
  // Find the order where id ends with invoiceNumber (case-insensitive)
  const { data: orders } = await db
    .from('orders')
    .select('id, payment_status')
    .ilike('id', `%${event.invoiceNumber.toLowerCase()}`)
    .limit(1)

  const order = orders?.[0]
  if (!order || order.payment_status === 'paid') {
    return NextResponse.json({ ok: true })
  }

  await db.from('orders').update({
    payment_status: 'paid',
    paid_at: new Date().toISOString(),
    helcim_transaction_id: event.transactionId,
  }).eq('id', order.id)

  return NextResponse.json({ ok: true })
}
