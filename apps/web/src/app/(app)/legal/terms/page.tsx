import { BackLink } from '@/components/ui/BackLink'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terms of Service' }

const UPDATED = 'January 1, 2025'

const SECTIONS = [
  {
    title: '1. Agreement to Terms',
    body: 'These Terms of Service ("Terms") govern your access to and use of the QCypher Micro-CRM and related services ("Services") provided by QCypher Technologies ("QCypher," "we," "us," or "our"). By creating an account or using the Services, you agree to be bound by these Terms.',
  },
  {
    title: '2. Eligibility',
    body: 'You must be at least 18 years old and have the legal authority to enter into a binding agreement on behalf of yourself or your business. By using the Services, you represent that you meet these requirements.',
  },
  {
    title: '3. Account Registration',
    body: 'You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. You must notify us immediately of any unauthorized use of your account at hello@qcyphertech.com.',
  },
  {
    title: '4. Subscription and Payment',
    body: 'Access to the Services may require a paid subscription. Fees are billed in advance on the billing cycle you select. All fees are non-refundable except as expressly stated in these Terms or required by applicable law. We reserve the right to change our pricing with at least 30 days\' notice.',
  },
  {
    title: '5. Acceptable Use',
    items: [
      'Use the Services for any unlawful purpose or in violation of any applicable law',
      'Upload or transmit viruses, malware, or other malicious code',
      'Attempt to gain unauthorized access to the Services or other users\' accounts',
      'Use the Services to send unsolicited communications (spam)',
      'Reverse-engineer, decompile, or attempt to extract the source code of the Services',
      'Use the Services to store or transmit content that is defamatory, obscene, or infringes third-party intellectual property rights',
    ],
    prefix: 'You agree not to:',
  },
  {
    title: '6. Your Data',
    body: 'You retain ownership of all data you input into the Services ("Customer Data"). You grant QCypher a limited license to process your Customer Data solely to provide the Services. We will not access or use your Customer Data for any other purpose. You are responsible for the accuracy and legality of the Customer Data you submit, including compliance with applicable privacy laws when storing personal information about your own customers.',
  },
  {
    title: '7. Data Security and Isolation',
    body: 'QCypher implements row-level security controls to ensure each tenant\'s data is logically separated from every other tenant\'s data. We will not knowingly access or expose your data to other customers.',
  },
  {
    title: '8. Intellectual Property',
    body: 'The Services, including all software, design, text, and graphics, are owned by QCypher and protected by applicable intellectual property laws. These Terms do not grant you any rights in the Services other than the limited right to use them as described here.',
  },
  {
    title: '9. Third-Party Integrations',
    body: 'The Services may integrate with third-party services (e.g., Google, Twilio, Resend). Your use of those integrations is subject to those providers\' terms and privacy policies. QCypher is not responsible for third-party services.',
  },
  {
    title: '10. Disclaimer of Warranties',
    body: 'THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.',
  },
  {
    title: '11. Limitation of Liability',
    body: 'TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, QCYPHER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.',
  },
  {
    title: '12. Indemnification',
    body: 'You agree to indemnify and hold QCypher harmless from any claims, damages, or expenses (including reasonable attorneys\' fees) arising from your use of the Services, your violation of these Terms, or your violation of any third-party rights.',
  },
  {
    title: '13. Termination',
    body: 'We may suspend or terminate your access to the Services at any time for violation of these Terms or for any other reason with reasonable notice. You may cancel your account at any time through the Account settings page. Upon termination, your right to use the Services ceases. Sections relating to ownership, warranty disclaimers, limitation of liability, and indemnification survive termination.',
  },
  {
    title: '14. Changes to Terms',
    body: 'We may update these Terms from time to time. We will provide notice of material changes by email or in-app notice at least 14 days before they take effect. Continued use of the Services after that date constitutes acceptance of the revised Terms.',
  },
  {
    title: '15. Governing Law',
    body: 'These Terms are governed by the laws of the State of Maryland, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved in the state or federal courts located in Maryland.',
  },
  {
    title: '16. Contact Us',
    body: 'QCypher Technologies · hello@qcyphertech.com',
  },
]

export default function TermsPage() {
  return <LegalPage title="Terms of Service" updatedAt={UPDATED} sections={SECTIONS} />
}

function LegalPage({ title, updatedAt, sections }: {
  title: string
  updatedAt: string
  sections: { title: string; body?: string; items?: string[]; prefix?: string }[]
}) {
  return (
    <div className="max-w-2xl space-y-6 pb-10">
      <BackLink href="/support" label="Help & Support" />

      <div>
        <p className="text-[15px] font-bold uppercase tracking-widest mb-1"
          style={{ color: 'hsl(var(--muted-foreground))' }}>Legal</p>
        <h1 className="text-2xl font-black" style={{ color: 'hsl(var(--foreground))' }}>{title}</h1>
        <p className="text-[15px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Last updated {updatedAt}
        </p>
      </div>

      <div className="space-y-6">
        {sections.map(({ title: st, body, items, prefix }) => (
          <div key={st}>
            <h2 className="text-[15px] font-black mb-1.5" style={{ color: 'hsl(var(--foreground))' }}>{st}</h2>
            {prefix && (
              <p className="text-[15px] leading-relaxed mb-1.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{prefix}</p>
            )}
            {body && (
              <p className="text-[15px] leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>{body}</p>
            )}
            {items && (
              <ul className="space-y-1 pl-4">
                {items.map(item => (
                  <li key={item} className="text-[15px] leading-relaxed list-disc"
                    style={{ color: 'hsl(var(--muted-foreground))' }}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
