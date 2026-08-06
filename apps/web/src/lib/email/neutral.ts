// Modern, sleek HTML shell for emails a TENANT sends to THEIR OWN
// customers (quotes, portal sign-in links, quick-reply templates).
// Deliberately has no QCypher logo or branding — these should read as
// coming from the tenant's business, not from QCypher. Uses a neutral
// charcoal/slate accent rather than QCypher's indigo/cyan so it doesn't
// read as "QCypher-flavored" white-label, just clean and professional.

type NeutralEmailOptions = {
  /** The tenant's business name — shown as the email's header in place of a logo */
  senderName: string
  /** Main HTML content — headings, paragraphs, lists. Keep it simple inline HTML. */
  bodyHtml: string
  /** Optional call-to-action button below the body */
  cta?: { label: string; href: string }
}

export function renderNeutralEmail({ senderName, bodyHtml, cta }: NeutralEmailOptions): string {
  const ctaHtml = cta ? `
    <div style="text-align:center;margin:32px 0 8px;">
      <a href="${cta.href}" style="display:inline-block;padding:14px 32px;border-radius:10px;background:#2d3748;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;">
        ${cta.label}
      </a>
    </div>
  ` : ''

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0;padding:0;background:#f7f7f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
    <div style="padding:40px 20px;">
      <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.08);border:1px solid rgba(15,23,42,0.06);">
        <div style="height:4px;background:#2d3748;"></div>
        <div style="padding:32px 40px 4px;">
          <p style="margin:0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#718096;">${senderName}</p>
        </div>
        <div style="padding:16px 40px 8px;color:#1a202c;font-size:15px;line-height:1.75;">
          ${bodyHtml}
          ${ctaHtml}
        </div>
        <div style="padding:20px 40px 32px;">
          <p style="margin:0;font-size:12px;color:#a0aec0;">Sent by ${senderName}</p>
        </div>
      </div>
    </div>
  </body>
</html>
`.trim()
}
