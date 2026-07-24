import { createPublicKey, verify } from 'crypto'

const TELNYX_API_KEY              = process.env.TELNYX_API_KEY              ?? ''
const TELNYX_PUBLIC_KEY           = process.env.TELNYX_PUBLIC_KEY           ?? ''
const TELNYX_FROM_NUMBER          = process.env.TELNYX_FROM_NUMBER          ?? ''
const TELNYX_MESSAGING_PROFILE_ID = process.env.TELNYX_MESSAGING_PROFILE_ID ?? ''

const VOICE_WEBHOOK_URL = 'https://www.qcyphertech.com/api/telnyx/voice'

// ─── Webhook signature validation (Ed25519) ───────────────────────────────────
// Telnyx signs webhooks with Ed25519. Headers: telnyx-signature-ed25519 (base64),
// telnyx-timestamp (unix seconds). Signed payload: `${timestamp}|${rawBody}`
export function validateTelnyxSignature(
  body: string,
  signature: string,
  timestamp: string,
): boolean {
  if (!TELNYX_PUBLIC_KEY || !signature || !timestamp) return false

  const ts = parseInt(timestamp, 10)
  if (Number.isNaN(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false

  try {
    const rawKey = Buffer.from(TELNYX_PUBLIC_KEY, 'base64')
    const spkiHeader = Buffer.from('302a300506032b6570032100', 'hex')
    const spkiDer = rawKey.length === 32
      ? Buffer.concat([spkiHeader, rawKey])
      : rawKey
    const publicKey = createPublicKey({ key: spkiDer, format: 'der', type: 'spki' })
    const message   = Buffer.from(`${timestamp}|${body}`, 'utf8')
    const sig       = Buffer.from(signature, 'base64')
    return verify(null, message, publicKey, sig)
  } catch {
    return false
  }
}

// ─── Send SMS ─────────────────────────────────────────────────────────────────
export async function sendSms(opts: {
  to: string
  body: string
  from?: string
}): Promise<{ id: string } | { error: string }> {
  if (!TELNYX_API_KEY) return { error: 'TELNYX_API_KEY not configured' }

  const from = opts.from ?? TELNYX_FROM_NUMBER
  if (!from) return { error: 'No Telnyx from number configured' }

  const payload: Record<string, string> = {
    from,
    to: opts.to,
    text: opts.body,
  }
  if (TELNYX_MESSAGING_PROFILE_ID) {
    payload.messaging_profile_id = TELNYX_MESSAGING_PROFILE_ID
  }

  const res = await fetch('https://api.telnyx.com/v2/messages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TELNYX_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json()
  if (!res.ok) return { error: data.errors?.[0]?.detail ?? `Telnyx error ${res.status}` }
  return { id: data.data?.id as string }
}

// ─── Search available numbers ─────────────────────────────────────────────────
export async function searchAvailableNumbers(areaCode: string): Promise<string[]> {
  if (!TELNYX_API_KEY) throw new Error('TELNYX_API_KEY not configured')

  const params = new URLSearchParams()
  params.set('filter[area_code]', areaCode)
  params.set('filter[features][]', 'sms')
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

// ─── Buy a number and configure voice webhook ─────────────────────────────────
export async function buyAndConfigureNumber(phoneNumber: string): Promise<string> {
  if (!TELNYX_API_KEY) throw new Error('TELNYX_API_KEY not configured')

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
  const purchased = (orderData.data?.phone_numbers?.[0]?.phone_number as string) ?? phoneNumber

  await configureNumberWebhook(purchased)
  return purchased
}

// ─── Configure voice webhook on an existing number ────────────────────────────
export async function configureNumberWebhook(phoneNumber: string): Promise<void> {
  if (!TELNYX_API_KEY) throw new Error('TELNYX_API_KEY not configured')

  const res = await fetch(
    `https://api.telnyx.com/v2/phone_numbers/${encodeURIComponent(phoneNumber)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${TELNYX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        voice: {
          webhook_url:        VOICE_WEBHOOK_URL,
          webhook_url_method: 'POST',
        },
      }),
    },
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.errors?.[0]?.detail ?? `Failed to configure webhook: ${res.status}`)
  }
}

// ─── TeXML helpers ────────────────────────────────────────────────────────────
export function texmlHangup(message?: string): string {
  const say = message ? `<Say>${message}</Say>` : ''
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${say}<Hangup/></Response>`
}
