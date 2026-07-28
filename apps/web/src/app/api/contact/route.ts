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
          <h2>Thank you for reaching out to QCypher!</h2>
          <p>Hi ${businessName},</p>
          <p>We've received your request and our team will be in touch within 24 hours to discuss your business needs and find the right solution for you.</p>
          <p>In the meantime, if you have any questions, feel free to reply to this email or call us at <strong>(804) 250-5066</strong>.</p>
          <hr>
          <p><strong>Your Information:</strong></p>
          <p>Business Name: ${businessName}</p>
          <p>Phone: ${phone}</p>
          <p>Email: ${email}</p>
          <hr>
          <p>Best regards,<br>The QCypher Team</p>
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
