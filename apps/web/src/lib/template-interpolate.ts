const SMS_OPTOUT = 'Reply STOP to unsubscribe.'

interface InterpolateContext {
  first_name?: string | null
  last_name?: string | null
  company?: string | null
  phone?: string | null
  business_name?: string | null
  appointment_date?: string | null
  amount_due?: string | null
}

/**
 * Substitutes {{variable}} placeholders with real values.
 * Unresolved variables are left as ⚠{{variable}} so staff notice before sending.
 */
export function interpolate(body: string, ctx: InterpolateContext): string {
  const map: Record<string, string | null | undefined> = {
    first_name:       ctx.first_name,
    last_name:        ctx.last_name,
    company:          ctx.company,
    phone:            ctx.phone,
    business_name:    ctx.business_name,
    appointment_date: ctx.appointment_date,
    amount_due:       ctx.amount_due,
  }

  return body.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const val = map[key]
    if (val != null && val !== '') return val
    return `⚠{{${key}}}`  // visibly flagged, not silently blank
  })
}

/**
 * Appends the SMS opt-out line to marketing SMS sends.
 * Called at the send layer — not editable template text.
 */
export function appendOptOut(body: string): string {
  if (body.includes(SMS_OPTOUT)) return body
  return `${body}\n${SMS_OPTOUT}`
}
