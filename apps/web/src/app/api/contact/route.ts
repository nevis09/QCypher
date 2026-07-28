import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('API key present:', !!process.env.RESEND_API_KEY)
    console.log('API key value:', process.env.RESEND_API_KEY)
    const { businessName, phone, email } = await request.json()

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
        to: email,
        subject: 'Your QCypher Request Received',
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
                .greeting { font-size: 24px; font-weight: 600; margin-bottom: 20px; color: #1e3a8a; }
                .message { font-size: 16px; line-height: 1.8; margin-bottom: 25px; color: #555; }
                .highlight { color: #0369a1; font-weight: 600; }
                .info-section { background: #f8fafc; border-radius: 12px; padding: 20px; margin: 25px 0; border-left: 4px solid #0369a1; }
                .info-section h3 { margin: 0 0 15px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #1e3a8a; }
                .info-item { font-size: 15px; padding: 8px 0; display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; }
                .info-item:last-child { border-bottom: none; }
                .info-label { font-weight: 600; color: #475569; }
                .info-value { color: #555; }
                .cta-box { background: linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%); border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center; }
                .cta-text { color: white; font-size: 15px; }
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
                  <div class="greeting">Thank you for reaching out! ✨</div>
                  <p class="message">Hi <span class="highlight">${businessName}</span>,</p>
                  <p class="message">We've received your request and we're excited to help. Our team will reach out within <span class="highlight">24 hours</span> to discuss your needs and find the right solution.</p>

                  <div class="info-section">
                    <h3>Your Information</h3>
                    <div class="info-item">
                      <span class="info-label">Business</span>
                      <span class="info-value">${businessName}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Phone</span>
                      <span class="info-value">${phone}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Email</span>
                      <span class="info-value">${email}</span>
                    </div>
                  </div>

                  <div class="cta-box">
                    <div class="cta-text">Have questions in the meantime?</div>
                    <div class="cta-phone"><a href="tel:+18042505066" style="color: white; text-decoration: none;">(804) 250-5066</a></div>
                  </div>

                  <p class="message">Looking forward to working with you!</p>
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
