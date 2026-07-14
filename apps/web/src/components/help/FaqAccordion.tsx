'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    q: 'How do I add a new contact?',
    a: 'Go to Contacts in the top nav, then click "New contact" in the top-right corner. Fill in the name, email, phone, and any tags, then save.',
  },
  {
    q: 'Can I import contacts from a spreadsheet?',
    a: 'CSV import is on the roadmap. For now, contacts can be added one at a time or via the API if you\'re comfortable with that.',
  },
  {
    q: 'How does my billing work?',
    a: 'You\'re billed monthly based on your subscription plan. Payment is handled securely by our payment processor — QCypher never stores your card number. You can view and update billing in Settings.',
  },
  {
    q: 'How do I cancel my subscription?',
    a: 'You can cancel anytime from the Account page under Billing. Your access continues until the end of the current billing period and your data is retained for 30 days after that.',
  },
  {
    q: 'Is my data isolated from other businesses on QCypher?',
    a: 'Yes — completely. Every table in our database uses Row Level Security (RLS) policies that strictly tie every row to your tenant ID. No other business can read, write, or even detect the existence of your data.',
  },
  {
    q: 'How do I send a quick reply via SMS or email?',
    a: 'From any contact\'s detail page, open the Templates section. Select a template, customize it if needed, and hit Send. SMS routes through Twilio and email through Resend.',
  },
  {
    q: 'Can multiple staff members use the same account?',
    a: 'Yes. Each staff member gets their own login under your workspace — no shared passwords. Invite them from Settings → Team (coming in a future update).',
  },
  {
    q: 'What happens if I toggle off a module in Settings?',
    a: 'The module is hidden from your navigation and dashboard, but your data is untouched. Toggle it back on at any time and everything reappears exactly as you left it.',
  },
]

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }}>
      {FAQS.map((faq, i) => (
        <div key={i}>
          {i > 0 && <div className="h-px" style={{ background: 'hsl(var(--border))' }} />}
          <button onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[hsl(var(--muted))] transition-colors">
            <span className="flex-1 text-[15px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              {faq.q}
            </span>
            <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform"
              style={{
                color: 'hsl(var(--muted-foreground))',
                transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)',
              }} />
          </button>
          {open === i && (
            <div className="px-5 pb-4 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
              <p className="text-[15px] leading-relaxed pt-3" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {faq.a}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
