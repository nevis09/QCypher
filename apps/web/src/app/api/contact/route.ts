import { NextRequest, NextResponse } from 'next/server'

const qcypherLogo = `
  <div style="color: white; font-weight: 400; font-size: 24px; line-height: 1.2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; letter-spacing: -0.5px;">QCypher Technologies</div>
`

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
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif; line-height: 1.6; color: #2c3e50; background: #f8fafb; }
      .wrapper { background: #f8fafb; padding: 20px; }
      .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }
      .header { background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%); padding: 60px 40px; text-align: center; color: white; }
      .logo { font-size: 36px; font-weight: 400; margin-bottom: 16px; letter-spacing: -0.5px; color: #ffffff !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
      .tagline { font-size: 14px; opacity: 0.92; font-weight: 400; letter-spacing: 0.3px; }
      .content { padding: 50px 40px; }
      .greeting { font-size: 32px; font-weight: 400; margin-bottom: 8px; color: #1a365d; }
      .subtitle { font-size: 17px; color: #2c5282; font-weight: 400; margin-bottom: 28px; }
      .message { font-size: 15px; line-height: 1.9; margin-bottom: 24px; color: #4a5568; }
      .message-intro { font-size: 15px; line-height: 1.9; margin-bottom: 28px; color: #4a5568; }
      .divider { height: 1px; background: #e2e8f0; margin: 32px 0; }
      .info-section { background: #f8fafc; border-radius: 10px; padding: 28px; margin: 28px 0; border: 1px solid #e2e8f0; }
      .info-section h3 { margin: 0 0 24px 0; font-size: 12px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.6px; color: #1a365d; }
      .info-row { margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid #e2e8f0; }
      .info-row:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
      .info-label { font-size: 11px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.6px; color: #718096; margin-bottom: 6px; }
      .info-value { font-size: 15px; color: #1a365d; font-weight: 400; }
      .cta-box { background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%); border-radius: 10px; padding: 36px 40px; margin: 32px 0; text-align: center; box-shadow: 0 8px 24px rgba(26, 54, 93, 0.15); }
      .cta-text { color: white; font-size: 15px; margin-bottom: 14px; font-weight: 400; opacity: 0.95; }
      .cta-phone { color: white; font-size: 18px; font-weight: 400; letter-spacing: 0.5px; }
      .footer { padding: 40px; text-align: center; border-top: 1px solid #e2e8f0; background: #fafbfc; font-size: 13px; }
      .footer-branding { font-weight: 400; color: #1a365d; margin-bottom: 6px; font-size: 15px; }
      .footer-text { color: #718096; font-size: 12px; }
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
              <div class="tagline">We handle the tech. You run the business</div>
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
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <div class="logo">${qcypherLogo}</div>
                <div class="tagline">We handle the tech. You run the business</div>
              </div>
              <div class="content">
                <div class="greeting">New Lead Received 🎉</div>
                <div class="subtitle">A prospect is interested in learning more about QCypher</div>

                <p class="message-intro">A new business has submitted a request and is interested in your services.</p>

                <div class="divider"></div>

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
                    <div class="info-value"><a href="mailto:${email}" style="color: #2c5282; text-decoration: none;">${email}</a></div>
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

                <p class="message">Follow up within 24 hours for best results! This prospect is ready to hear from you.</p>
              </div>
              <div class="footer">
                <div class="footer-branding">QCypher Technologies</div>
                <div class="footer-text">Simple tech, real results</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    // Send customer confirmation email
    const customerResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Request Received - QCypher Technologies',
        html: customerEmailHtml,
      }),
    })

    if (!customerResponse.ok) {
      const errorText = await customerResponse.text()
      console.error('Customer email sending failed:', errorText)
      // In testing mode, Resend only allows sending to verified emails.
      // This will work once domain is verified in Resend dashboard.
      // For now, log the error but continue with team notification.
      if (!errorText.includes('validation_error')) {
        throw new Error(`Failed to send customer email: ${errorText}`)
      }
    } else {
      console.log('Customer confirmation email sent to:', email)
    }

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
