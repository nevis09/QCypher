export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { validateMagicLink } from '@/lib/actions/portal'
import { PORTAL_COOKIE } from '@/lib/portal-session'

export default async function PortalAuthPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { token?: string }
}) {
  const token = searchParams.token

  if (!token) {
    return <ErrorScreen message="No token provided." slug={params.slug} />
  }

  const result = await validateMagicLink(token)

  if (!result.ok) {
    const msg =
      result.error === 'already_used'
        ? 'This sign-in link has already been used. Please request a new one.'
        : result.error === 'expired'
        ? 'This sign-in link has expired (links are valid for 24 hours). Please request a new one.'
        : 'This sign-in link is not valid.'
    return <ErrorScreen message={msg} slug={params.slug} />
  }

  const store = await cookies()
  store.set(PORTAL_COOKIE, result.sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(result.expiresAt),
    path: `/portal/${params.slug}`,
  })

  redirect(`/portal/${params.slug}/dashboard`)
}

function ErrorScreen({ message, slug }: { message: string; slug: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-sm w-full text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Sign-in link invalid</h1>
        <p className="text-[15px] text-gray-600">{message}</p>
        <a
          href={`/portal/${slug}`}
          className="block w-full py-3 rounded-xl text-[15px] font-bold text-white text-center"
          style={{ background: 'linear-gradient(135deg, #1a3070, #2a52a0)' }}
        >
          Request a new link
        </a>
      </div>
    </div>
  )
}
