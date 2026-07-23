import { createPublicKey, verify } from 'crypto'

const TELNYX_API_KEY    = process.env.TELNYX_API_KEY    ?? ''
const TELNYX_PUBLIC_KEY = process.env.TELNYX_PUBLIC_KEY ?? ''
const TELNYX_APP_ID     = process.env.TELNYX_APP_ID     ?? ''

// ─── Webhook signature validation ────────────────────────────────────────────
// Telnyx signs webhooks with Ed25519 (asymmetric).
// Headers: telnyx-signature-ed25519 (base64), telnyx-timestamp (unix seconds)
// Signed payload: `${timestamp}|${rawBody}`
export function validateTelnyxSignature(
  body: string,
  signature: string,
  timestamp: string,
): boolean {
  if (!TELNYX_PUBLIC_KEY || !signature || !timestamp) return false

  // Reject stale webhooks (> 5 min skew)
  const ts = parseInt(timestamp, 10)
  if (Number.isNaN(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false

  try {
    // Telnyx provides a raw 32-byte Ed25519 key (base64). Node crypto needs SPKI-wrapped DER.
    const rawKey = Buffer.from(TELNYX_PUBLIC_KEY, 'base64')
    const spkiHeader = Buffer.from('302a300506032b6570032100', 'hex')
    const spkiDer = rawKey.length === 32
      ? Buffer.concat([spkiHeader, rawKey])
      : rawKey // already full DER if not 32 bytes
    const publicKey = createPublicKey({ key: spkiDer, format: 'der', type: 'spki' })
    const message   = Buffer.from(`${timestamp}|${body}`, 'utf8')
    const sig       = Buffer.from(signature, 'base64')
    return verify(null, message, publicKey, sig)
  } catch {
    return false
  }
}

// ─── Send SMS ────────────────────────────────────────────────────────────────
export async function sendSms(opts: {
  from: string
  to: string
  body: string
}): Promise<{ id: string } | { error: string }> {
  if (!TELNYX_API_KEY) return { error: 'Telnyx credentials not configured' }

  const res = await fetch('https://api.telnyx.com/v2/messages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TELNYX_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: opts.from, to: opts.to, text: opts.body }),
  })

  const data = await res.json()
  if (!res.ok) return { error: data.errors?.[0]?.detail ?? 'Telnyx error' }
  return { id: data.data?.id as string }
}

// ─── Search available numbers ─────────────────────────────────────────────────
export async function searchAvailableNumbers(areaCode: string): Promise<string[]> {
  if (!TELNYX_API_KEY) throw new Error('Telnyx credentials not configured')

  // Telnyx uses bracket-notation query params: filter[area_code]=804
  const params = new URLSearchParams()
  params.set('filter[area_code]', areaCode)
  params.set('filter[features][]', 'sms')
  params.append('filter[features][]', 'voice')
  params.set('filter[limit]', '5')

  const res = await fetch(
    `https://api.telnyx.com/v2/available_phone_numbers?${params}`,
    { headers: { Authorization: `Bearer ${TELNYX_API_KEY}` } },
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.errors?.[0]?.detail ?? `Telnyx error ${res.status}`)
  }

  const data = await res.json()
  return (data.data ?? []).map((n: { phone_number: string }) => n.phone_number)
}

// ─── Buy a number and configure webhook ───────────────────────────────────────
export async function buyAndConfigureNumber(
  phoneNumber: string,
  voiceWebhookUrl: string,
): Promise<string> {
  if (!TELNYX_API_KEY) throw new Error('Telnyx credentials not configured')

  // Order the number
  const orderRes = await fetch('https://api.telnyx.com/v2/number_orders', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TELNYX_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone_numbers: [{ phone_number: phoneNumber }] }),
  })

  if (!orderRes.ok) {
    const err = await orderRes.json()
    throw new Error(err.errors?.[0]?.detail ?? 'Failed to purchase number')
  }

  const orderData = await orderRes.json()
  const orderedNumber = orderData.data?.phone_numbers?.[0]?.phone_number as string ?? phoneNumber

  // Attach to the messaging/voice app (TeXML App) so webhooks route correctly
  if (TELNYX_APP_ID) {
    await fetch(`https://api.telnyx.com/v2/phone_numbers/${encodeURIComponent(orderedNumber)}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${TELNYX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        connection_id: TELNYX_APP_ID,
        voice_settings: { webhook_url: voiceWebhookUrl, webhook_url_method: 'POST' },
      }),
    })
  }

  return orderedNumber
}

// ─── Configure webhook on an existing number ─────────────────────────────────
export async function configureExistingNumber(
  phoneNumber: string,
  voiceWebhookUrl: string,
): Promise<void> {
  if (!TELNYX_API_KEY) throw new Error('Telnyx credentials not configured')

  const res = await fetch(
    `https://api.telnyx.com/v2/phone_numbers/${encodeURIComponent(phoneNumber)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${TELNYX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        connection_id: TELNYX_APP_ID || undefined,
        voice_settings: { webhook_url: voiceWebhookUrl, webhook_url_method: 'POST' },
      }),
    },
  )

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.errors?.[0]?.detail ?? 'Failed to configure number webhook')
  }
}

// ─── TeXML hangup ────────────────────────────────────────────────────────────
export function texmlHangup(message?: string): string {
  const say = message ? `<Say>${message}</Say>` : ''
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${say}<Hangup/></Response>`
}
