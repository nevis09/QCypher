import { createClient } from '@/lib/supabase/server'
import { ContactListWithSearch } from '@/components/contacts/ContactListWithSearch'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Contacts' }

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const { q, status } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('contacts')
    .select('id, first_name, last_name, email, phone, tags, status, created_at')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status as 'active' | 'inactive' | 'lead')
  }

  if (q) {
    query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
  }

  const { data: contacts, error } = await query
  if (error) throw error

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Contacts</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">{contacts?.length ?? 0} total</p>
        </div>
        <Link
          href="/contacts/new"
          className="bg-accent text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-accent-hover transition-colors"
        >
          Add contact
        </Link>
      </div>
      <ContactListWithSearch contacts={contacts ?? []} />
    </div>
  )
}
