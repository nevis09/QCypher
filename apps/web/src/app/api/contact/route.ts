import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('API key present:', !!process.env.RESEND_API_KEY)
    const { businessName, phone, email, message, selectedPackages } = await request.json()

    // Validate required fields
    if (!businessName || !phone || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const commonStyles = `
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
      .header { background: linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%); padding: 48px 30px; text-align: center; color: white; }
      .logo { font-size: 28px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.5px; }
      .tagline { font-size: 14px; opacity: 0.95; font-weight: 500; }
      .content { padding: 48px 30px; }
      .greeting { font-size: 28px; font-weight: 800; margin-bottom: 12px; color: #1e3a8a; }
      .subtitle { font-size: 16px; color: #0369a1; font-weight: 600; margin-bottom: 20px; }
      .message { font-size: 15px; line-height: 1.8; margin-bottom: 24px; color: #555; }
      .info-section { background: linear-gradient(135deg, #f8fafc 0%, #f0f4f8 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #0369a1; }
      .info-section h3 { margin: 0 0 20px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #1e3a8a; }
      .info-row { margin-bottom: 16px; }
      .info-row:last-child { margin-bottom: 0; }
      .info-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; margin-bottom: 4px; }
      .info-value { font-size: 15px; color: #1e3a8a; font-weight: 600; }
      .cta-box { background: linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%); border-radius: 12px; padding: 28px; margin: 28px 0; text-align: center; box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2); }
      .cta-text { color: white; font-size: 15px; margin-bottom: 12px; font-weight: 600; }
      .cta-phone { color: white; font-size: 16px; font-weight: 700; }
      .footer { padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 13px; color: #94a3b8; }
      .footer-branding { font-weight: 600; color: #1e3a8a; margin-bottom: 8px; font-size: 14px; }
    `

    // Customer confirmation email
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${commonStyles}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">QCypher</div>
              <div class="tagline">Simple tech solutions for local businesses</div>
            </div>
            <div class="content">
              <div class="greeting">Request Received ✓</div>
              <div class="subtitle">Thank you for your interest in QCypher</div>

              <p class="message">Hi ${businessName},</p>
              <p class="message">We've received your request and we're excited to help grow your business. Our team will review your information and reach out within 24 hours to discuss your needs and present the perfect solution for you.</p>

              <div class="info-section">
                <h3>Your Request Summary</h3>
                <div class="info-row">
                  <div class="info-label">Business</div>
                  <div class="info-value">${businessName}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Contact Phone</div>
                  <div class="info-value">${phone}</div>
                </div>
                ${selectedPackages && selectedPackages.length > 0 ? `
                <div class="info-row">
                  <div class="info-label">Interested In</div>
                  <div class="info-value">${selectedPackages.join(', ')}</div>
                </div>
                ` : ''}
              </div>

              <div class="cta-box">
                <div class="cta-text">Need something urgent?</div>
                <div class="cta-phone">(804) 250-5066</div>
              </div>

              <p class="message">Looking forward to working with you!</p>
            </div>
            <div class="footer">
              <div class="footer-branding">QCypher Technologies</div>
              <div>Simple tech, real results</div>
            </div>
          </div>
        </body>
      </html>
    `

    // Team lead notification email
    const teamEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${commonStyles}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">QCypher</div>
              <div class="tagline">Simple tech solutions for local businesses</div>
            </div>
            <div class="content">
              <div class="greeting">New Lead Received 🎉</div>
              <div class="subtitle">A prospect is interested in learning more about QCypher</div>

              <p class="message">A new business has submitted a request and is interested in your services.</p>

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
                <div class="cta-phone"><a href="tel:${phone}" style="color: white; text-decoration: none;">Call: ${phone}</a></div>
              </div>

              <p class="message">Follow up within 24 hours for best results!</p>
            </div>
            <div class="footer">
              <div class="footer-branding">QCypher Technologies</div>
            </div>
          </div>
        </body>
      </html>
    `

    // Send team lead notification email
    const teamResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: 'qcyphertech@gmail.com',
        subject: `New Lead: ${businessName}`,
        html: teamEmailHtml,
      }),
    })

    if (!teamResponse.ok) {
      throw new Error(`Failed to send team email: ${await teamResponse.text()}`)
    }

    console.log('Emails sent successfully to customer and team')
    return NextResponse.json(
      { success: true, message: 'Emails sent successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message', details: String(error) },
      { status: 500 }
    )
  }
}
