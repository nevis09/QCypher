/**
 * /auth/invite
 * Supabase sends invite emails with a magic link that hits /auth/confirm,
 * which exchanges the code and redirects here for a one-time password set step
 * (only needed if we ever switch from magic-link to password auth).
 * For now, the callback already lands the user in the app — this page is a
 * friendly fallback for expired/invalid links.
 */
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Invitation' }

export default function InvitePage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const expired = searchParams.error === 'expired'

  return (
    <main className="min-h-screen flex items-center justify-center bg-[hsl(var(--muted))] px-4">
      <div className="w-full max-w-sm bg-[hsl(var(--card))] rounded-2xl shadow-card p-8 text-center space-y-4">
        {expired ? (
          <>
            <h1 className="text-lg font-semibold">Link expired</h1>
            <p className="text-[15px] text-[hsl(var(--muted-foreground))]">
              This invite link has expired or already been used. Ask your admin to send a new one.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold">Welcome to QCypher CRM</h1>
            <p className="text-[15px] text-[hsl(var(--muted-foreground))]">
              Your account is ready. Sign in with the magic link sent to your email.
            </p>
            <Link
              href="/auth/login"
              className="inline-block mt-2 bg-accent text-white text-[15px] font-medium px-5 py-2 rounded-xl hover:bg-accent-hover transition-colors"
            >
              Go to sign in
            </Link>
          </>
        )}
      </div>
    </main>
  )
}
