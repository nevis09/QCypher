// Shared branded HTML shell for every QCypher-to-customer transactional
// email (team invites, account notices, etc). Keeps typography, color,
// and logo placement consistent with the marketing site's theme
// (--indigo-d #2a52a0, --cyan #4a9db5, --mint #00a87a, --bg #f8f9fc).
//
// Not used for white-label sends (quote/portal/template emails a tenant
// sends to their own customers) — those should look like they're from
// the tenant's business, not QCypher.

const LOGO_URL = 'https://www.qcyphertech.com/qcypher-logo-full.png'

type BrandedEmailOptions = {
  /** Main HTML content — headings, paragraphs, lists. Keep it simple inline HTML. */
  bodyHtml: string
  /** Optional call-to-action button below the body */
  cta?: { label: string; href: string }
}

export function renderBrandedEmail({ bodyHtml, cta }: BrandedEmailOptions): string {
  const ctaHtml = cta ? `
    <div style="text-align:center;margin:32px 0 8px;">
      <a href="${cta.href}" style="display:inline-block;padding:14px 32px;border-radius:10px;background:linear-gradient(135deg,#2a52a0,#4a9db5);color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;">
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
  <body style="margin:0;padding:0;background:#f8f9fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
    <div style="padding:40px 20px;">
      <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(26,48,112,0.10);border:1px solid rgba(26,48,112,0.08);">
        <div style="height:4px;background:linear-gradient(90deg,#2a52a0,#4a9db5,#00a87a);"></div>
        <div style="padding:36px 40px 4px;text-align:center;">
          <img src="${LOGO_URL}" alt="QCypher Technologies" width="140" style="width:140px;max-width:100%;height:auto;display:inline-block;">
        </div>
        <div style="padding:12px 40px 8px;color:#171a2b;font-size:15px;line-height:1.75;">
          ${bodyHtml}
          ${ctaHtml}
        </div>
        <div style="background:#f8f9fc;padding:20px 40px;text-align:center;border-top:1px solid rgba(26,48,112,0.08);margin-top:24px;">
          <p style="margin:0;font-size:12px;color:#5b6072;">QCypher Technologies &middot; Simple tech solutions for local businesses</p>
        </div>
      </div>
    </div>
  </body>
</html>
`.trim()
}
