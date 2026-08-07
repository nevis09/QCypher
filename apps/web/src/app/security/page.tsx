import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Security',
  description: 'Learn how QCypher protects your business data. Encryption, access control, monitoring, and transparent practices.',
  alternates: { canonical: 'https://www.qcyphertech.com/security' },
  openGraph: {
    title: 'Security by Design — QCypher Technologies',
    description: 'Encryption, role-based access control, and continuous monitoring — here’s exactly how QCypher protects your business data.',
    url: 'https://www.qcyphertech.com/security',
    type: 'website',
  },
}

const INTEGRATION_LOGOS = [
  { name: 'Google Business Profile', file: '/logos/googlebusiness.png' },
  { name: 'Cal.com', file: '/logos/calcom.png' },
  { name: 'Telnyx', file: '/logos/telnyx.svg' },
  { name: 'Resend', file: '/logos/resend.svg' },
  { name: 'Supabase', file: '/logos/supabase.svg' },
  { name: 'Cloudflare', file: '/logos/cloudflare.svg' },
  { name: 'Vercel', file: '/logos/vercel.svg' },
  { name: 'GitHub', file: '/logos/github.svg' },
  { name: 'Anthropic', file: '/logos/anthropic.png' },
]

type Point = { label: string; icon: string }
type Section = { id: string; eyebrow: string; title: string; icon: string; points: Point[]; note?: string }

const SECTIONS: Section[] = [
  {
    id: 'encryption',
    eyebrow: 'Section 01',
    title: 'Data in Transit & At Rest',
    icon: '🔒',
    points: [
      { icon: '🔐', label: 'TLS 1.2+ encryption for all data in transit — website, API, and mobile' },
      { icon: '🗄️', label: 'AES-256 encryption for data at rest in our Supabase Postgres database' },
      { icon: '📜', label: 'SSL/TLS certificates managed by Let’s Encrypt, with automatic renewal' },
      { icon: '✅', label: 'All customer data encrypted by default — no opt-in required' },
    ],
  },
  {
    id: 'access',
    eyebrow: 'Section 02',
    title: 'Who Can Access What',
    icon: '🛡️',
    points: [
      { icon: '🔑', label: 'Email/password authentication with secure password hashing' },
      { icon: '🔓', label: 'Google OAuth available for easier, passwordless login' },
      { icon: '📱', label: 'Multi-factor authentication (MFA) available for admin accounts' },
      { icon: '🧩', label: 'Role-based access control — Admin, User, and Read-only tiers' },
      { icon: '🏢', label: 'Each customer’s data isolated at the database level via row-level security (RLS)' },
      { icon: '🕵️', label: 'Super admin access to customer data is exceptional, not routine, and always logged to an audit trail' },
    ],
  },
  {
    id: 'monitoring',
    eyebrow: 'Section 03',
    title: 'We Watch What Matters',
    icon: '👁️',
    points: [
      { icon: '📋', label: 'Comprehensive audit logging — every create, update, and delete records who did what, and when' },
      { icon: '🗓️', label: '90-day audit trail retention, auto-purged on a schedule after that' },
      { icon: '⚡', label: 'Real-time access logging for admin accounts' },
      { icon: '💸', label: 'Cost-conscious, efficient logging — built for a growing business, not enterprise overkill' },
      { icon: '🔍', label: 'Super admin actions are logged and visible in each customer’s own audit trail' },
      { icon: '🚫', label: 'Logs record actions only — never the content of your customer data' },
    ],
  },
  {
    id: 'incident-response',
    eyebrow: 'Section 04',
    title: 'When Things Go Wrong',
    icon: '🚨',
    points: [
      { icon: '📝', label: 'A written incident response plan is in place' },
      { icon: '📧', label: 'Security vulnerabilities can be reported to legal@qcyphertech.com' },
      { icon: '⏱️', label: 'Customers notified within 24 hours of a confirmed breach, or as required by law' },
      { icon: '🔬', label: 'Every incident gets a post-incident review, with lessons learned documented' },
      { icon: '🚷', label: 'No data brokers or third parties are given access to customer data' },
    ],
  },
  {
    id: 'data-handling',
    eyebrow: 'Section 05',
    title: 'Your Data. Your Control.',
    icon: '🗂️',
    points: [
      { icon: '🏠', label: 'You own all of your data — contacts, notes, customer records, everything' },
      { icon: '📤', label: 'Data export available on request, in CSV or JSON' },
      { icon: '🗑️', label: 'All data removed within 30 days of account closure' },
      { icon: '💾', label: 'Automatic daily backups, managed by Supabase' },
      { icon: '📦', label: 'Backup retention: 7 days minimum, 30 days standard' },
      { icon: '🙅', label: 'We never sell or share your customer data with third parties' },
    ],
    note: 'In compliance terms: we are a "data processor" — you remain the "data controller" of your customer information.',
  },
  {
    id: 'infrastructure',
    eyebrow: 'Section 06',
    title: 'Built on Trusted Services',
    icon: '🏗️',
    points: [
      { icon: '🐘', label: 'Database: Supabase Postgres, AWS-backed and SOC 2 Type II compliant' },
      { icon: '▲', label: 'Hosting: Vercel — edge functions, DDoS protection, 99.95% uptime SLA' },
      { icon: '🔗', label: 'Third-party services: Cal.com for scheduling, Telnyx for SMS/voice, Resend for email' },
      { icon: '✔️', label: 'Every third-party service is evaluated for security before we integrate it' },
      { icon: '📭', label: 'No customer data is stored in third-party systems — only operational data like scheduled events or sent emails' },
    ],
  },
  {
    id: 'roadmap',
    eyebrow: 'Section 07',
    title: 'What’s Coming',
    icon: '🗺️',
    points: [
      { icon: '📊', label: 'SOC 2 Type II audit planned once our customer base reaches 50+' },
      { icon: '🌍', label: 'ISO 27001 certification as a long-term goal, 18–24 months out' },
      { icon: '🤖', label: 'Automated vulnerability scanning currently in development' },
      { icon: '🛡️', label: 'Additional API rate limiting and DDoS hardening' },
      { icon: '🐛', label: 'A bug bounty program, once scale justifies it' },
    ],
  },
  {
    id: 'compliance',
    eyebrow: 'Section 08',
    title: 'Security Documents & Assessments',
    icon: '📁',
    points: [
      { icon: '📄', label: 'Security & privacy documentation available on request' },
      { icon: '📋', label: 'Incident response plan available on request' },
      { icon: '🤝', label: 'Data Processing Agreement (DPA) available for enterprise customers' },
      { icon: '📑', label: 'SOC 2 report available upon request — currently undergoing preparation' },
    ],
    note: 'Contact legal@qcyphertech.com for compliance questions.',
  },
]

export default function SecurityPage() {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif', background: '#f8f9fc', color: '#171a2b', lineHeight: 1.5 }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        a { color: inherit; text-decoration: none; }
        img { max-width: 100%; display: block; }

        :root {
          --ink: #171a2b;
          --soft: #5b6072;
          --bg: #f8f9fc;
          --card: #ffffff;
          --border: rgba(26,48,112,0.10);
          --border2: rgba(26,48,112,0.18);
          --navy: #0B1640;
          --indigo: #1a3070;
          --indigo-d: #2a52a0;
          --steel: #2B5FA8;
          --cyan: #4a9db5;
          --teal: #17C9E8;
          --violet: #8B5CF6;
          --mint: #00a87a;
        }

        .wrap { max-width: 1060px; margin: 0 auto; padding: 0 20px; }

        /* NAV */
        .nav-bar {
          position: sticky; top: 0; z-index: 50;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
        }
        .nav-inner {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 20px; max-width: 1060px; margin: 0 auto;
        }
        .nav-logo { display: flex; align-items: center; gap: 2px; font-weight: 800; font-size: 17px; color: var(--indigo); }
        .nav-logo img { height: 44px; width: auto; display: block; }
        .nav-links { display: flex; align-items: center; gap: 24px; }
        .nav-link { font-size: 15px; font-weight: 600; color: var(--soft); transition: color .15s; }
        .nav-link:hover, .nav-link.active { color: var(--indigo); }
        .nav-cta { display: flex; align-items: center; gap: 8px; }

        .btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 7px;
          min-height: 44px; padding: 0 20px;
          border-radius: 10px; font-weight: 700; font-size: 15px;
          cursor: pointer; border: 1px solid transparent;
          transition: transform .15s, opacity .15s; font-family: inherit;
          text-align: center;
        }
        .btn:hover { transform: translateY(-1px); }
        .btn-ghost { background: transparent; color: var(--indigo); border: 1px solid var(--border2); }
        .btn-ghost:hover { border-color: var(--cyan); color: var(--cyan); }
        .btn-sm { min-height: 44px; padding: 0 14px; font-size: 14px; white-space: nowrap; }

        /* HERO */
        .sec-hero {
          padding: 76px 0 60px;
          background: linear-gradient(155deg, #0B1640 0%, #1a3070 45%, #2B5FA8 85%, #17C9E8 130%);
          position: relative;
          overflow: hidden;
        }
        .sec-hero::after {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 60% at 80% 0%, rgba(139,92,246,0.25) 0%, transparent 70%);
          pointer-events: none;
        }
        .sec-hero .wrap { position: relative; text-align: center; }
        .sec-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.16);
          border-radius: 99px; padding: 6px 16px; margin-bottom: 22px;
          font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.85);
          letter-spacing: 0.04em; text-transform: uppercase;
        }
        .sec-hero h1 {
          font-size: 44px; font-weight: 900; line-height: 1.1; letter-spacing: -0.03em;
          color: #fff; margin-bottom: 14px;
        }
        .sec-hero h2 {
          font-size: 19px; font-weight: 600; color: var(--teal);
          margin-bottom: 20px; letter-spacing: -0.01em;
        }
        .sec-hero p {
          font-size: 16px; color: rgba(255,255,255,0.75); max-width: 620px;
          margin: 0 auto; line-height: 1.7;
        }
        @media (max-width: 600px) {
          .sec-hero { padding: 52px 0 40px; }
          .sec-hero h1 { font-size: 30px; }
          .sec-hero h2 { font-size: 16px; }
        }

        /* SECTIONS */
        .sec-block { padding: 56px 0; border-bottom: 1px solid var(--border); }
        .sec-block:nth-child(odd) { background: #fff; }
        .sec-head { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 28px; }
        .sec-icon {
          flex-shrink: 0; width: 48px; height: 48px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          background: linear-gradient(135deg, rgba(43,95,168,0.12), rgba(23,201,232,0.12));
          border: 1px solid var(--border2);
        }
        .sec-eyebrow { font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--steel); margin-bottom: 4px; display: block; }
        .sec-head h3 { font-size: 24px; font-weight: 800; color: var(--ink); letter-spacing: -0.02em; }

        .point-list { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; padding-left: 64px; }
        @media (max-width: 720px) { .point-list { grid-template-columns: 1fr; padding-left: 0; } }
        .point {
          display: flex; align-items: flex-start; gap: 10px;
          font-size: 16px; color: var(--soft); line-height: 1.55;
        }
        .point .pt-icon { flex-shrink: 0; font-size: 16px; line-height: 1.5; }
        .sec-note {
          margin-top: 20px; margin-left: 64px; padding: 14px 18px;
          background: rgba(43,95,168,0.06); border-left: 3px solid var(--steel);
          border-radius: 8px; font-size: 15px; color: var(--soft); max-width: 640px;
        }
        @media (max-width: 720px) { .sec-note { margin-left: 0; } }

        /* HONESTY CALLOUT */
        .honesty-box {
          background: linear-gradient(135deg, rgba(139,92,246,0.06), rgba(23,201,232,0.06));
          border: 1px solid var(--border2); border-radius: 16px;
          padding: 28px 32px; margin: 8px 0 0;
        }
        .honesty-box p { font-size: 16px; color: var(--soft); line-height: 1.7; margin-bottom: 10px; }
        .honesty-box p:last-child { margin-bottom: 0; }
        .honesty-box strong { color: var(--ink); }

        /* CONTACT CTA */
        .contact-cta {
          padding: 64px 0;
          background: linear-gradient(135deg, var(--navy), var(--indigo) 60%, var(--steel));
          text-align: center;
        }
        .contact-cta h2 { font-size: 30px; font-weight: 900; color: #fff; margin-bottom: 12px; letter-spacing: -0.02em; }
        .contact-cta p { font-size: 16px; color: rgba(255,255,255,0.75); max-width: 480px; margin: 0 auto 24px; line-height: 1.6; }
        .contact-cta-links { display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap; margin-bottom: 16px; }
        .contact-cta-links a {
          font-size: 16px; font-weight: 700; color: #fff;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
          padding: 12px 22px; border-radius: 10px; transition: background .15s, transform .15s;
        }
        .contact-cta-links a:hover { background: rgba(255,255,255,0.18); transform: translateY(-1px); }
        .contact-cta-meta { font-size: 13px; color: rgba(255,255,255,0.5); }
        .contact-cta-docs { display: flex; align-items: center; justify-content: center; gap: 18px; flex-wrap: wrap; margin-top: 22px; }
        .contact-cta-docs a { font-size: 14px; font-weight: 600; color: var(--teal); }
        .contact-cta-docs a:hover { text-decoration: underline; }
        .contact-cta-updated { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 22px; }

        /* FOOTER — matches homepage/about */
        footer {
          position: relative;
          padding: 22px 0 12px;
          background: linear-gradient(145deg, #0e1f45 0%, #1a3070 45%, #1e4a7a 75%, #246080 100%);
          overflow: hidden;
        }
        footer::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, var(--cyan), var(--mint), transparent);
          opacity: 0.7;
        }
        footer::after {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 50% 60% at 85% 0%, rgba(74,157,181,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        footer .wrap { position: relative; }
        footer .nav-logo { color: #fff; }
        .foot-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 20px; margin-bottom: 12px; }
        @media (max-width: 680px) { .foot-grid { grid-template-columns: 1fr; gap: 14px; } }
        .foot-brand p { font-size: 13px; color: rgba(255,255,255,0.55); max-width: 260px; margin-top: 4px; line-height: 1.45; }
        .foot-col h5 {
          font-size: 11px; text-transform: uppercase; letter-spacing: .12em;
          color: rgba(255,255,255,0.4); margin-bottom: 6px; font-weight: 700;
        }
        .foot-col a {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; color: rgba(255,255,255,0.75); margin-bottom: 3px; font-weight: 500;
          transition: color .15s, transform .15s; width: fit-content;
        }
        .foot-col a:hover { color: #fff; transform: translateX(3px); }
        .foot-col a::after {
          content: '→'; opacity: 0; transform: translateX(-4px);
          transition: opacity .15s, transform .15s; font-size: 11px; color: var(--cyan);
        }
        .foot-col a:hover::after { opacity: 1; transform: translateX(0); }
        .foot-bottom {
          border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;
          display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px;
          font-size: 13px; color: rgba(255,255,255,0.4);
        }

        /* INTEGRATIONS FOOTER */
        .integrations-section { padding: 0.85rem 0; margin-bottom: 10px; border-top: 1px solid rgba(255,255,255,0.08); border-bottom: 1px solid rgba(255,255,255,0.08); }
        .integrations-headline { text-align: center; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 14px; }
        .integrations-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
        .integration-card {
          width: 60px; height: 30px; border-radius: 8px;
          background: rgba(255,255,255,0.92); display: flex; align-items: center; justify-content: center;
          padding: 6px; flex: 0 0 auto; transition: background .15s, transform .15s;
        }
        .integration-card:hover { background: #fff; transform: translateY(-2px); }
        .integration-card img { max-width: 100%; max-height: 100%; object-fit: contain; display: block; }

        @media (max-width: 480px) {
          .nav-inner { padding: 10px 16px; }
          .nav-logo img { height: 32px; }
          .btn-sm { font-size: 13px; padding: 0 12px; }
          .nav-links { display: none; }
          .nav-page-link { font-size: 13px !important; margin-right: 2px !important; }
        }
      `}</style>

      {/* NAV */}
      <header className="nav-bar">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <img src="/qcypher-logo-horizontal.png" alt="QCypher Technologies" />
          </Link>
          <nav className="nav-links">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/about" className="nav-link">About</Link>
            <Link href="/security" className="nav-link active">Security</Link>
          </nav>
          <div className="nav-cta">
            <Link href="/auth/login" className="btn btn-ghost btn-sm">Sign in</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <div className="sec-hero">
        <div className="wrap">
          <span className="sec-hero-badge">🔐 Security</span>
          <h1>Security by Design</h1>
          <h2>Your data. Protected. Transparent.</h2>
          <p>
            We take security seriously. QCypher is built on a foundation of encryption, role-based access control,
            and continuous monitoring. Here&apos;s exactly how we protect your business data — no corporate jargon,
            just the facts.
          </p>
        </div>
      </div>

      {/* CONTENT SECTIONS */}
      {SECTIONS.map(section => (
        <section key={section.id} id={section.id} className="sec-block">
          <div className="wrap">
            <div className="sec-head">
              <div className="sec-icon">{section.icon}</div>
              <div>
                <span className="sec-eyebrow">{section.eyebrow}</span>
                <h3>{section.title}</h3>
              </div>
            </div>
            <div className="point-list">
              {section.points.map((p, i) => (
                <div className="point" key={i}>
                  <span className="pt-icon">{p.icon}</span>
                  <span>{p.label}</span>
                </div>
              ))}
            </div>
            {section.note && <div className="sec-note">{section.note}</div>}
          </div>
        </section>
      ))}

      {/* HONESTY / TRANSPARENCY */}
      <section className="sec-block">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-icon">🤝</div>
            <div>
              <span className="sec-eyebrow">A Note on Honesty</span>
              <h3>Transparency Over Perfection</h3>
            </div>
          </div>
          <div className="honesty-box" style={{ marginLeft: '64px', maxWidth: '680px' }}>
            <p>We&apos;re a small team, not a 500-person security department — and we&apos;d rather tell you that than pretend otherwise.</p>
            <p>What we can tell you is that <strong>our architecture is designed for enterprise-grade security</strong> from day one: encryption everywhere, strict tenant isolation, and an audit trail for every action that matters.</p>
            <p>And when something does go wrong, you get a real incident response process — not just a promise that &quot;we handle everything.&quot;</p>
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <div className="contact-cta">
        <div className="wrap">
          <h2>Questions?</h2>
          <p>We believe in transparency. If you have questions about our security practices, please reach out.</p>
          <div className="contact-cta-links">
            <a href="mailto:legal@qcyphertech.com">legal@qcyphertech.com</a>
          </div>
          <p className="contact-cta-meta">Response time: within 48 business hours</p>
          <div className="contact-cta-docs">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
          <p className="contact-cta-updated">Last updated: August 7, 2026</p>
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <div className="nav-logo" style={{ marginBottom: 0 }}>
                <img src="/qcypher-logo-footer.png" alt="QCypher Technologies" />
              </div>
              <p>Simple tech solutions for local businesses. No jargon, just results.</p>
            </div>
            <div className="foot-col">
              <h5>Contact Us</h5>
              <a href="mailto:info@qcyphertech.com">info@qcyphertech.com</a>
              <a href="tel:+18042505066" style={{ fontWeight: 600, color: 'var(--cyan)', marginBottom: '4px' }}>(804) 250-5066</a>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', margin: '0' }}>Ask for Felix or Thomas.</p>
            </div>
            <div className="foot-col">
              <h5>Quick Links</h5>
              <Link href="/about">About</Link>
              <Link href="/security">Security</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/auth/login">Client Login</Link>
            </div>
          </div>

          <div className="integrations-section" role="region" aria-label="Integration partners">
            <div className="integrations-headline">Built to work together — no tech headaches</div>
            <div className="integrations-grid">
              {INTEGRATION_LOGOS.map((logo) => (
                <div className="integration-card" key={logo.file}>
                  <img src={logo.file} alt={logo.name} loading="lazy" />
                </div>
              ))}
            </div>
          </div>

          <div className="foot-bottom">
            <span>© 2026 QCypher Technologies. All rights reserved.</span>
            <span>Built for small businesses, by a small business.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
