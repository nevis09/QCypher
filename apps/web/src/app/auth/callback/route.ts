import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code      = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type      = searchParams.get('type') as 'recovery' | 'email' | 'signup' | null
  const next      = searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()

  // PKCE flow — OAuth sign-in and magic links
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
  }

  // Token-hash flow — password recovery and email confirmation
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (!error) {
      const destination = type === 'recovery' ? '/auth/reset-password' : next
      return NextResponse.redirect(`${origin}${destination}`)
    }
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}
