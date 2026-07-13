import { createClient } from '@/lib/supabase/server'
import { ContactList } from '@/components/contacts/ContactList'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Contacts' }

export default async function ContactsPage() {
  const supabase = await createClient()
  const { data: contacts, error } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, email, phone, tags, created_at')
    .order('created_at', { ascending: false })

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
      <ContactList contacts={contacts ?? []} />
    </div>
  )
}
