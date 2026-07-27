export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { PortalLoginForm } from '@/components/portal/PortalLoginForm'

export const metadata: Metadata = { title: 'Client Portal' }

export default async function PortalLoginPage({ params }: { params: { slug: string } }) {
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
  const { data: tenant } = await db
    .from('tenants')
    .select('name, slug')
    .eq('slug', params.slug)
    .maybeSingle()

  if (!tenant) notFound()

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-sm w-full space-y-6">
        <div className="text-center space-y-1">
          <p className="text-[13px] font-semibold uppercase tracking-widest text-gray-400">Client Portal</p>
          <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
          <p className="text-[15px] text-gray-500">
            Enter your email to receive a sign-in link.
          </p>
        </div>
        <PortalLoginForm tenantSlug={params.slug} businessName={tenant.name} />
        <p className="text-[12px] text-gray-400 text-center">
          No account needed — we&apos;ll email you a secure link.
        </p>
      </div>
    </div>
  )
}
