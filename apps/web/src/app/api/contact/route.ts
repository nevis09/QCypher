import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('API key present:', !!process.env.RESEND_API_KEY)
    console.log('API key value:', process.env.RESEND_API_KEY)
    const { businessName, phone, email, message, selectedPackages } = await request.json()

    // Validate required fields
    if (!businessName || !phone || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'info@qcyphertech.com',
        to: 'info@qcyphertech.com',
        subject: `New Lead: ${businessName}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                .header { background: linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%); padding: 40px 30px; text-align: center; color: white; }
                .logo { font-size: 28px; font-weight: 700; margin-bottom: 10px; letter-spacing: -0.5px; }
                .tagline { font-size: 14px; opacity: 0.9; }
                .content { padding: 40px 30px; }
                .greeting { font-size: 24px; font-weight: 600; margin-bottom: 10px; color: #1e3a8a; }
                .subtitle { font-size: 16px; color: #0369a1; font-weight: 600; margin-bottom: 25px; }
                .message { font-size: 15px; line-height: 1.8; margin-bottom: 25px; color: #555; }
                .highlight { color: #0369a1; font-weight: 600; }
                .info-section { background: #f8fafc; border-radius: 12px; padding: 24px; margin: 25px 0; border-left: 4px solid #0369a1; }
                .info-section h3 { margin: 0 0 20px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #1e3a8a; }
                .info-row { margin-bottom: 16px; }
                .info-row:last-child { margin-bottom: 0; }
                .info-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; margin-bottom: 4px; }
                .info-value { font-size: 15px; color: #1e3a8a; font-weight: 600; }
                .cta-box { background: linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%); border-radius: 12px; padding: 24px; margin: 25px 0; text-align: center; }
                .cta-text { color: white; font-size: 15px; margin-bottom: 8px; }
                .cta-phone { font-size: 18px; font-weight: 700; color: white; }
                .footer { padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 13px; color: #94a3b8; }
                .footer-branding { font-weight: 600; color: #1e3a8a; margin-bottom: 8px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">QCypher</div>
                  <div class="tagline">Simple tech solutions for local businesses</div>
                </div>
                <div class="content">
                  <div class="greeting">New Lead Received! 🎉</div>
                  <div class="subtitle">A prospect is interested in learning more about QCypher</div>

                  <p class="message">A new business has submitted a request and is interested in our services.</p>

                  <div class="info-section">
                    <h3>Contact Information</h3>
                    <div class="info-row">
                      <div class="info-label">Business Name</div>
                      <div class="info-value">${businessName}</div>
                    </div>
                    <div class="info-row">
                      <div class="info-label">Phone</div>
                      <div class="info-value">${phone}</div>
                    </div>
                    <div class="info-row">
                      <div class="info-label">Email</div>
                      <div class="info-value"><a href="mailto:${email}" style="color: #0369a1; text-decoration: none;">${email}</a></div>
                    </div>
                    ${selectedPackages && selectedPackages.length > 0 ? `
                    <div class="info-row">
                      <div class="info-label">Interested In</div>
                      <div class="info-value">${selectedPackages.join(', ')}</div>
                    </div>
                    ` : ''}
                    ${message ? `
                    <div class="info-row">
                      <div class="info-label">Message</div>
                      <div class="info-value" style="white-space: pre-wrap;">${message}</div>
                    </div>
                    ` : ''}
                  </div>

                  <div class="cta-box">
                    <div class="cta-text">Ready to connect?</div>
                    <div class="cta-phone"><a href="mailto:${email}" style="color: white; text-decoration: none;">Send Email</a> or <a href="tel:${phone}" style="color: white; text-decoration: none;">Call Now</a></div>
                  </div>

                  <p class="message">Follow up with this lead within 24 hours for best results!</p>
                </div>
                <div class="footer">
                  <div class="footer-branding">QCypher Technologies</div>
                  <div>Talk to Felix or Thomas directly. No sales team.</div>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Resend API error:', errorData)
      throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`)
    }

    return NextResponse.json(
      { success: true, message: 'Email sent successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
