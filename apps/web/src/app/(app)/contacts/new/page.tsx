import { ContactForm } from '@/components/contacts/ContactForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'New contact' }

export default function NewContactPage() {
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-black">New contact</h1>
      <ContactForm />
    </div>
  )
}
