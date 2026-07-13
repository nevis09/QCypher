import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ContactForm } from '@/components/contacts/ContactForm'
import type { Metadata } from 'next'

type Props = { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: 'Edit contact' }

export default async function EditContactPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: contact } = await supabase.from('contacts').select('*').eq('id', id).single()
  if (!contact) notFound()

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-semibold">Edit contact</h1>
      <ContactForm contact={contact} />
    </div>
  )
}
