import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ContactDetail } from '@/components/contacts/ContactDetail'
import type { Metadata } from 'next'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('contacts')
    .select('first_name, last_name')
    .eq('id', id)
    .single()
  if (!data) return { title: 'Contact' }
  const d = data as { first_name?: string; last_name?: string }
  return { title: `${d.first_name ?? ''} ${d.last_name ?? ''}`.trim() }
}

export default async function ContactPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const tenantId = user?.app_metadata?.tenant_id ?? ''

  const [{ data: contact }, { data: interactions }, { data: tenantRaw }] = await Promise.all([
    supabase.from('contacts').select('*').eq('id', id).single(),
    supabase.from('interactions').select('*').eq('contact_id', id).order('occurred_at', { ascending: false }),
    supabase.from('tenants').select('slug, name').single(),
  ])

  if (!contact) notFound()

  const tenant = tenantRaw as { slug: string; name: string } | null
  return (
    <ContactDetail
      contact={contact}
      interactions={interactions ?? []}
      tenantId={tenantId}
      tenantSlug={tenant?.slug ?? ''}
      businessName={tenant?.name ?? ''}
    />
  )
}
