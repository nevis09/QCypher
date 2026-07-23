import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

// Initiates Cal.com OAuth flow.
// Tenant clicks "Connect Your Calendar" → hits this route → redirected to Cal.com.
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/auth/login', process.env.APP_URL!))

  const state = crypto.randomBytes(16).toString('hex')

  // Store state in a short-lived cookie for CSRF verification on callback
  const cookieStore = await cookies()
  cookieStore.set('cal_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 min
    path: '/',
  })

  const params = new URLSearchParams({
    client_id:     process.env.CAL_CLIENT_ID!,
    redirect_uri:  `${process.env.APP_URL}/api/cal/callback`,
    response_type: 'code',
    scope:         'READ_BOOKING READ_PROFILE',
    state,
  })

  return NextResponse.redirect(
    `https://app.cal.com/oauth2/authorize?${params.toString()}`
  )
}
