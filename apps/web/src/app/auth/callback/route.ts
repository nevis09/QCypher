import { NextResponse } from 'next/server'

// Legacy entry point — kept only so already-sent emails with this link
// still work. All auth flows now issue links to /auth/confirm instead,
// since that client-side handler also covers the hash-fragment (implicit)
// flow that this server route could never see (hash fragments never reach
// the server). Forward everything there, preserving query params — the
// hash fragment (if present) survives a same-origin redirect automatically.
export async function GET(request: Request) {
  const { search, origin } = new URL(request.url)
  return NextResponse.redirect(`${origin}/auth/confirm${search}`)
}
