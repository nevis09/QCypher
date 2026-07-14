import { FaqAccordion } from '@/components/help/FaqAccordion'
import { BackLink } from '@/components/ui/BackLink'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'FAQs' }

export default function FaqPage() {
  return (
    <div className="max-w-lg space-y-6">
      <BackLink href="/support" label="Help & Support" />
      <div>
        <h1 className="text-2xl font-black" style={{ color: 'hsl(var(--foreground))' }}>FAQs</h1>
        <p className="text-[15px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Common questions about billing, contacts, and data security
        </p>
      </div>
      <FaqAccordion />
    </div>
  )
}
