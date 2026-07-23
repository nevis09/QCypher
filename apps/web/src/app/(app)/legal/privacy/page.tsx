import { BackLink } from '@/components/ui/BackLink'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacy Policy' }

const UPDATED = 'January 1, 2025'

const SECTIONS = [
  {
    title: '1. Overview',
    body: 'This Privacy Policy explains how QCypher Technologies ("QCypher," "we," "us," or "our") collects, uses, discloses, and protects information when you use our website and Services, including the QCypher Micro-CRM. This Policy describes two categories of information we handle: Account Data (information about you as our customer) and Customer Data (information you input into the Micro-CRM about your own customers). QCypher processes Customer Data on your behalf and under your instruction; you remain responsible for your own compliance obligations regarding that data.',
  },
  {
    title: '2. Information We Collect',
    subsections: [
      {
        label: '2.1 Information You Provide',
        items: [
          'Account registration details (name, email, phone number, business name)',
          'Billing and payment information (processed by our third-party payment processor; QCypher does not store full payment card numbers)',
          'Communications with us (support requests, feedback)',
          'Customer Data you input into the Micro-CRM (contact names, notes, scheduling information, line items, etc.)',
        ],
      },
      {
        label: '2.2 Information Collected Automatically',
        items: [
          'Log and usage data (IP address, browser type, pages visited, timestamps)',
          'Device information',
          'Cookies strictly necessary for the Services to function (e.g., session/login cookies)',
        ],
      },
      {
        label: '2.3 Information from Third Parties',
        items: [
          'If you sign in using Google OAuth, we receive basic profile information (name, email address) from Google as authorized by you during that sign-in flow.',
        ],
      },
    ],
  },
  {
    title: '3. How We Use Information',
    prefix: 'We use information to:',
    items: [
      'Provide, maintain, and improve the Services',
      'Create and manage your account',
      'Process payments and manage billing',
      'Provide customer support',
      'Send administrative or service-related communications (e.g., billing notices, security alerts)',
      'Send marketing communications where you have opted in, with an opt-out in every such communication',
      'Detect, prevent, and address security incidents, fraud, or abuse',
      'Comply with legal obligations',
    ],
    footer: 'We do not sell your personal information or your Customer Data.',
  },
  {
    title: '4. How We Share Information',
    subsections: [
      { label: 'Service Providers', body: 'Third parties who perform services on our behalf, such as cloud hosting, authentication providers, email and SMS delivery providers, and payment processors. These providers are contractually obligated to protect information and use it only to provide services to QCypher.' },
      { label: 'Legal Requirements', body: 'If required to comply with a legal obligation, protect our rights, or respond to lawful requests from public authorities.' },
      { label: 'Business Transfers', body: 'In connection with a merger, acquisition, financing, or sale of assets, subject to standard confidentiality protections.' },
      { label: 'With Your Consent', body: 'In any other circumstance, with your consent.' },
    ],
  },
  {
    title: '5. Data Security',
    prefix: 'We implement reasonable administrative, technical, and physical safeguards, including:',
    items: [
      'Tenant-level data isolation using row-level access controls, so each customer\'s data is logically separated from every other customer\'s data',
      'Encrypted connections between your device and our systems',
      'Access controls limiting internal access on a need-to-know basis',
      'Regular backups',
    ],
    footer: 'No method of transmission or storage is 100% secure, and we cannot guarantee absolute security.',
  },
  {
    title: '6. Data Breach Notification',
    body: 'If we become aware of a security incident involving unauthorized access to your Account Data or Customer Data, we will notify affected customers without undue delay and no later than 60 days after discovery, except where applicable law requires a shorter notification period.',
  },
  {
    title: '7. Customer Data — Controller/Processor Relationship',
    prefix: 'If you use the Micro-CRM to store information about your own customers, you act as the data controller and QCypher acts as a data processor. You are responsible for:',
    items: [
      'Ensuring you have a lawful basis to collect and store your customers\' personal information',
      'Responding to your own customers\' requests regarding their data (access or deletion requests), which QCypher will assist with via the Services\' functionality',
      'Your own compliance with applicable marketing laws (e.g., TCPA, CAN-SPAM) if you use SMS or email features',
    ],
  },
  {
    title: '8. Data Retention',
    body: 'We retain Account Data for as long as your account is active and for a reasonable period afterward to comply with legal, accounting, or security obligations. We retain Customer Data for as long as your account is active; upon account termination, we will retain Customer Data for a reasonable transition period to allow for export, after which it may be deleted.',
  },
  {
    title: '9. Your Rights and Choices',
    body: 'Depending on your location, you may have rights to access, correct, delete, or export your personal information, or to opt out of certain uses. You can exercise many of these rights directly within your Account settings, or by contacting us at legal@qcyphertech.com.',
  },
  {
    title: '10. Children\'s Privacy',
    body: 'The Services are not directed to individuals under 18, and we do not knowingly collect personal information from anyone under 18. If we learn we have collected such information, we will delete it.',
  },
  {
    title: '11. Third-Party Links and Services',
    body: 'The Services may integrate with or link to third-party services (e.g., Google, payment processors, SMS/email providers). This Policy does not apply to those third parties\' own data practices, which are governed by their respective privacy policies.',
  },
  {
    title: '12. International Users',
    body: 'The Services are hosted in the United States and intended for use by businesses located in the United States. If you access the Services from outside the United States, you understand your information will be transferred to and processed in the United States.',
  },
  {
    title: '13. Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. We will provide notice of material changes (e.g., by email or in-app notice) and update the "Last Updated" date above.',
  },
  {
    title: '14. Contact Us',
    body: 'QCypher Technologies · legal@qcyphertech.com',
  },
]

type Section = {
  title: string
  body?: string
  prefix?: string
  footer?: string
  items?: string[]
  subsections?: { label: string; body?: string; items?: string[] }[]
}

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl space-y-6 pb-10">
      <BackLink href="/support" label="Help & Support" />

      <div>
        <p className="text-[15px] font-bold uppercase tracking-widest mb-1"
          style={{ color: 'hsl(var(--muted-foreground))' }}>Legal</p>
        <h1 className="text-2xl font-black" style={{ color: 'var(--heading)' }}>Privacy Policy</h1>
        <p className="text-[15px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Last updated {UPDATED}
        </p>
      </div>

      <div className="space-y-6">
        {(SECTIONS as Section[]).map(({ title, body, prefix, footer, items, subsections }) => (
          <div key={title}>
            <h2 className="text-[15px] font-black mb-1.5" style={{ color: 'hsl(var(--foreground))' }}>{title}</h2>
            {prefix && (
              <p className="text-[15px] leading-relaxed mb-1.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{prefix}</p>
            )}
            {body && (
              <p className="text-[15px] leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>{body}</p>
            )}
            {items && (
              <ul className="space-y-1 pl-4 mb-1.5">
                {items.map(item => (
                  <li key={item} className="text-[15px] leading-relaxed list-disc"
                    style={{ color: 'hsl(var(--muted-foreground))' }}>{item}</li>
                ))}
              </ul>
            )}
            {footer && (
              <p className="text-[15px] leading-relaxed mt-1.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{footer}</p>
            )}
            {subsections && (
              <div className="space-y-3 mt-1">
                {subsections.map(sub => (
                  <div key={sub.label}>
                    <p className="text-[15px] font-bold mb-1" style={{ color: 'hsl(var(--foreground))' }}>{sub.label}</p>
                    {sub.body && (
                      <p className="text-[15px] leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>{sub.body}</p>
                    )}
                    {sub.items && (
                      <ul className="space-y-1 pl-4">
                        {sub.items.map(item => (
                          <li key={item} className="text-[15px] leading-relaxed list-disc"
                            style={{ color: 'hsl(var(--muted-foreground))' }}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
