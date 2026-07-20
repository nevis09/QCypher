import { createHmac } from 'crypto'

const ACCOUNT_SID  = process.env.TWILIO_ACCOUNT_SID  ?? ''
const AUTH_TOKEN   = process.env.TWILIO_AUTH_TOKEN   ?? ''

// ─── Signature validation ────────────────────────────────────────────────────
// Twilio signs every webhook: HMAC-SHA1(authToken, url + sortedParams) → base64
// Must be validated BEFORE any DB operation to prevent spoofed webhooks.

export function validateTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string,
): boolean {
  if (!AUTH_TOKEN) return false

  // Build the string to sign: URL + params sorted alphabetically, key+value concatenated
  const sortedKeys = Object.keys(params).sort()
  const paramStr   = sortedKeys.reduce((acc, k) => acc + k + params[k], '')
  const toSign     = url + paramStr

  const expected = createHmac('sha1', AUTH_TOKEN)
    .update(toSign, 'utf8')
    .digest('base64')

  // Constant-time comparison to prevent timing attacks
  if (expected.length !== signature.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i)
  }
  return diff === 0
}

// ─── Send SMS ────────────────────────────────────────────────────────────────

export async function sendSms(opts: {
  from: string
  to: string
  body: string
  accountSid?: string
  authToken?: string
}): Promise<{ sid: string } | { error: string }> {
  const sid   = opts.accountSid ?? ACCOUNT_SID
  const token = opts.authToken  ?? AUTH_TOKEN

  if (!sid || !token) return { error: 'Twilio credentials not configured' }

  const params = new URLSearchParams({ From: opts.from, To: opts.to, Body: opts.body })
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    },
  )
  const data = await res.json()
  if (!res.ok) return { error: data.message ?? 'Twilio error' }
  return { sid: data.sid }
}

// ─── Provision a phone number ─────────────────────────────────────────────────

export async function searchAvailableNumbers(areaCode: string): Promise<string[]> {
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/AvailablePhoneNumbers/US/Local.json?` +
    new URLSearchParams({ AreaCode: areaCode, Limit: '5', VoiceEnabled: 'true', SmsEnabled: 'true' }),
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString('base64')}`,
      },
    },
  )
  if (!res.ok) throw new Error('Failed to search available numbers')
  const data = await res.json()
  return (data.available_phone_numbers ?? []).map((n: { phone_number: string }) => n.phone_number)
}

export async function buyAndConfigureNumber(phoneNumber: string, voiceWebhookUrl: string): Promise<string> {
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/IncomingPhoneNumbers.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        PhoneNumber: phoneNumber,
        VoiceUrl:    voiceWebhookUrl,
        VoiceMethod: 'POST',
      }).toString(),
    },
  )
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message ?? 'Failed to purchase number')
  }
  const data = await res.json()
  return data.phone_number as string
}

// ─── Configure webhook on an existing number ─────────────────────────────────

export async function configureExistingNumber(phoneNumber: string, voiceWebhookUrl: string): Promise<void> {
  // First find the IncomingPhoneNumber SID for this number
  const listRes = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/IncomingPhoneNumbers.json?` +
    new URLSearchParams({ PhoneNumber: phoneNumber }),
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString('base64')}`,
      },
    },
  )
  if (!listRes.ok) throw new Error('Failed to look up number in your Twilio account')
  const listData = await listRes.json()
  const numbers = listData.incoming_phone_numbers ?? []
  if (!numbers.length) throw new Error(`${phoneNumber} was not found in your Twilio account`)

  const numberSid = numbers[0].sid as string
  const updateRes = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/IncomingPhoneNumbers/${numberSid}.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ VoiceUrl: voiceWebhookUrl, VoiceMethod: 'POST' }).toString(),
    },
  )
  if (!updateRes.ok) {
    const err = await updateRes.json()
    throw new Error(err.message ?? 'Failed to configure number webhook')
  }
}

// ─── TwiML helpers ───────────────────────────────────────────────────────────

export function twimlHangup(message?: string): string {
  const say = message
    ? `<Say voice="alice">${message}</Say>`
    : ''
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${say}<Hangup/></Response>`
}
