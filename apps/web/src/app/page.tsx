import Link from 'next/link'

// Public marketing page — no auth calls, no Supabase imports.
// Middleware handles logged-in redirect (/ → /dashboard).

export default function HomePage() {
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
          --indigo: #1a3070;
          --indigo-d: #2a52a0;
          --cyan: #4a9db5;
          --mint: #00a87a;
          --coral: #ff5a4e;
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
        .nav-logo img { height: 48px; width: auto; display: block; transform: translateY(-5px); }
        .nav-cta { display: flex; align-items: center; gap: 8px; }

        /* BUTTONS */
        .btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 7px;
          min-height: 44px; padding: 0 20px;
          border-radius: 10px; font-weight: 700; font-size: 15px;
          cursor: pointer; border: 1px solid transparent;
          transition: transform .15s, opacity .15s; font-family: inherit;
          text-align: center; text-decoration: none;
        }
        .btn:hover { transform: translateY(-1px); }
        .btn-primary { background: linear-gradient(135deg, var(--indigo-d), var(--cyan)); color: #fff; box-shadow: 0 4px 16px rgba(74,157,181,.25); }
        .btn-primary:hover { opacity: .9; }
        .btn-ghost { background: transparent; color: var(--indigo); border-color: var(--border2); }
        .btn-ghost:hover { border-color: var(--cyan); color: var(--cyan); }
        .btn-sm { min-height: 38px; padding: 0 14px; font-size: 14px; white-space: nowrap; }
        .btn-full { width: 100%; }

        /* HERO */
        .hero {
          padding: 88px 0 72px;
          background: linear-gradient(145deg, #0e1f45 0%, #1a3070 45%, #1e4a7a 75%, #246080 100%);
          position: relative; overflow: hidden;
        }
        .hero::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 70% at 80% 50%, rgba(74,157,181,0.18) 0%, transparent 70%),
                      radial-gradient(ellipse 40% 50% at 10% 80%, rgba(42,82,160,0.3) 0%, transparent 60%);
          pointer-events: none;
        }
        .hero .wrap { position: relative; }
        .hero h1 { font-size: 46px; font-weight: 900; line-height: 1.08; letter-spacing: -0.03em; color: #fff; margin-bottom: 16px; font-family: system-ui, -apple-system, "Segoe UI", Arial, sans-serif; }
        .hero h1 em { font-style: normal; background: linear-gradient(90deg, #7dd3f7, #4a9db5, #00e5aa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hero-lead { font-size: 16px; color: rgba(255,255,255,0.75); max-width: 500px; margin-bottom: 28px; line-height: 1.7; }
        .hero-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 28px; }
        .hero .btn-ghost { color: #fff; border-color: rgba(255,255,255,0.35); background: rgba(255,255,255,0.07); }
        .hero .btn-ghost:hover { border-color: #fff; background: rgba(255,255,255,0.14); }
        .trust-row { display: flex; gap: 18px; flex-wrap: wrap; font-size: 14px; color: rgba(255,255,255,0.6); font-weight: 600; }
        .trust-row span { display: flex; align-items: center; gap: 6px; }
        .dot { width: 5px; height: 5px; border-radius: 50%; background: #00e5aa; flex-shrink: 0; }
        @media (max-width: 600px) { .hero { padding: 56px 0 48px; } .hero h1 { font-size: 32px; } .hero-lead { font-size: 15px; } }

        /* SECTION */
        section { padding: 72px 0; }
        .eyebrow { font-size: 13px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--cyan); margin-bottom: 8px; display: block; }
        .section-head { margin-bottom: 40px; }
        .section-head.center { text-align: center; }
        .section-head h2 { font-size: 28px; font-weight: 800; color: var(--ink); letter-spacing: -0.02em; margin-bottom: 8px; }
        .section-head p { font-size: 15px; color: var(--soft); line-height: 1.65; max-width: 540px; }
        .section-head.center p { margin: 0 auto; }

        /* PACKAGES */
        .pkg-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          column-gap: 14px;
          row-gap: 14px;
        }
        @media (max-width: 960px) { .pkg-grid { grid-template-columns: repeat(2, 1fr); gap: 18px; } }
        @media (max-width: 540px)  { .pkg-grid { grid-template-columns: 1fr; gap: 24px; } }

        .pkg-card {
          background: var(--card);
          border: 1px solid var(--border2);
          border-radius: 18px;
          padding: 22px 20px;
          display: flex; flex-direction: column;
          position: relative;
          transition: box-shadow .2s, transform .2s;
          border-top: 3px solid var(--border2);
        }
        .pkg-card:hover { box-shadow: 0 12px 36px rgba(31,60,136,.14); transform: translateY(-2px); }
        .pkg-card.pop {
          border-color: var(--indigo-d);
          border-top: 3px solid var(--indigo-d);
          box-shadow: 0 0 0 1px var(--indigo-d), 0 8px 32px rgba(42,82,160,.18);
        }

        /* Online Launch — full width row below the 3 monthly tiers (desktop only) */
        @media (min-width: 961px) {
          .pkg-card.pkg-card-launch {
            grid-column: 1 / -1;
            flex-direction: row;
            align-items: center;
            gap: 48px;
            padding: 28px 36px;
          }
          .pkg-grid { row-gap: 32px; }
          .pkg-card-launch .launch-body { flex: 1; }
          .pkg-card-launch .launch-cta  { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 10px; min-width: 200px; }
          .pkg-card-launch .pkg-details { margin-bottom: 0; }
        }

        .pkg-badge {
          display: inline-block;
          background: var(--indigo-d); color: #fff;
          font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
          padding: 3px 9px; border-radius: 5px; margin-bottom: 10px;
          line-height: 1.4;
        }
        .pkg-badge-spacer {
          display: block;
          height: calc(11px * 1.4 + 6px + 10px); /* matches badge line-height + padding + margin */
          visibility: hidden;
        }
        .pkg-for {
          font-size: 13px; font-weight: 600; color: var(--cyan);
          background: rgba(74,157,181,.09); border: 1px solid rgba(74,157,181,.2);
          border-radius: 99px; padding: 3px 10px;
          display: inline-block; margin-bottom: 10px;
        }
        .pkg-name { font-size: 19px; font-weight: 800; color: var(--ink); margin-bottom: 5px; }
        .pkg-tagline { font-size: 13px; color: var(--soft); font-style: italic; margin-bottom: 14px; line-height: 1.5; }
        .pkg-price { margin-bottom: 16px; padding-bottom: 14px; border-bottom: 1px solid var(--border); }
        .pkg-price .amt { font-size: 26px; font-weight: 900; color: var(--ink); }
        .pkg-price .freq { font-size: 14px; color: var(--soft); margin-left: 2px; }
        .pkg-price .mo  { display: block; font-size: 14px; font-weight: 700; color: var(--cyan); margin-top: 2px; }
        .pkg-price .no-mo { display: block; font-size: 13px; color: #059669; font-weight: 700; margin-top: 2px; }

        /* Accordion */
        details.pkg-details { margin-bottom: 0; flex: 1; }
        details.pkg-details summary {
          display: flex; align-items: center; justify-content: space-between;
          font-size: 14px; font-weight: 700; color: var(--indigo);
          cursor: pointer; list-style: none; padding: 8px 0;
          border-top: 1px solid var(--border); min-height: 44px;
          user-select: none;
        }
        details.pkg-details summary::-webkit-details-marker { display: none; }
        details.pkg-details summary::after {
          content: "+"; font-size: 18px; font-weight: 400; color: var(--cyan);
          flex-shrink: 0; margin-left: 8px;
        }
        details.pkg-details[open] summary::after { content: "−"; }
        /* Desktop: always expanded, no pointer needed */
        @media (min-width: 641px) {
          details.pkg-details { pointer-events: none; }
          details.pkg-details[open] { pointer-events: auto; }
        }

        .pkg-section-label { font-size: 12px; font-weight: 700; color: var(--soft); text-transform: uppercase; letter-spacing: .1em; margin: 12px 0 6px; }
        .pkg-list { list-style: none; }
        .pkg-list li { display: flex; gap: 8px; font-size: 14px; color: var(--soft); padding: 5px 0; border-top: 1px solid var(--border); align-items: flex-start; line-height: 1.5; }
        .pkg-list li:first-child { border-top: none; }
        .pkg-inherit { font-size: 13px; font-style: italic; color: var(--soft); padding: 8px 0 6px; }
        .chk { flex-shrink: 0; width: 16px; height: 16px; border-radius: 50%; background: rgba(0,200,150,.15); color: var(--mint); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; margin-top: 2px; }

        .pkg-switch { font-size: 13px; color: var(--soft); text-align: center; margin-top: 10px; }
        .chk.crm-chk { background: rgba(0,168,122,.18); color: var(--mint); }

        /* CRM SECTION */
        .crm-section { background: linear-gradient(160deg, #0e1f45 0%, #1a3070 100%); }
        .crm-section .eyebrow { color: #7dd3f7; }
        .crm-section .section-head h2 { color: #fff; }
        .crm-card {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 20px;
          padding: 36px 32px;
          display: grid; grid-template-columns: 1fr auto; gap: 32px; align-items: start;
        }
        @media (max-width: 680px) { .crm-card { grid-template-columns: 1fr; padding: 24px 20px; } }
        .crm-lead { font-size: 15px; color: rgba(255,255,255,0.72); line-height: 1.65; margin-bottom: 16px; max-width: 520px; }
        .crm-price-line { font-size: 22px; font-weight: 900; color: #fff; margin-bottom: 20px; }
        .crm-price-line span { font-size: 16px; font-weight: 700; color: #7dd3f7; }
        .crm-features { list-style: none; display: flex; flex-direction: column; gap: 0; }
        .crm-features li { display: flex; gap: 8px; font-size: 15px; color: rgba(255,255,255,0.65); padding: 6px 0; border-top: 1px solid rgba(255,255,255,0.1); align-items: flex-start; }
        .crm-features li:first-child { border-top: none; }
        .crm-features .chk { background: rgba(0,229,170,0.2); color: #00e5aa; }
        .crm-cta-col { display: flex; flex-direction: column; align-items: center; gap: 8px; padding-top: 4px; }
        .crm-cta-col .btn { white-space: nowrap; }
        .crm-cta-col p { color: rgba(255,255,255,0.5) !important; }

        /* BENEFIT STRIP */
        .benefit-strip {
          background: #fff;
          border-bottom: 3px solid #eef2ff;
          padding: 32px 0;
        }
        .benefit-strip-inner {
          display: flex; gap: 0;
          justify-content: space-around;
          flex-wrap: wrap;
        }
        .benefit-item {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 20px; flex: 1; min-width: 180px;
        }
        .benefit-icon {
          width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .benefit-text strong { display: block; font-size: 14px; font-weight: 800; color: var(--ink); }
        .benefit-text span { font-size: 13px; color: var(--soft); line-height: 1.4; }
        @media (max-width: 540px) {
          .benefit-item { min-width: 50%; padding: 10px 14px; }
          .benefit-icon { width: 38px; height: 38px; }
        }

        /* TESTIMONIALS */
        .tcard {
          background: #f8f9fc; border: 1px solid rgba(31,60,136,.08);
          border-radius: 16px; padding: 28px;
        }

        /* FOOTER */
        footer { border-top: 1px solid var(--border); padding: 44px 0 28px; background: #f0f3ff; }
        .foot-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 32px; margin-bottom: 28px; }
        @media (max-width: 680px) { .foot-grid { grid-template-columns: 1fr; } }
        .foot-brand p { font-size: 15px; color: var(--soft); max-width: 240px; margin-top: 10px; line-height: 1.6; }
        .foot-col h5 { font-size: 13px; text-transform: uppercase; letter-spacing: .1em; color: var(--soft); margin-bottom: 12px; font-weight: 700; }
        .foot-col a { display: block; font-size: 15px; color: var(--soft); margin-bottom: 9px; font-weight: 500; }
        .foot-col a:hover { color: var(--indigo); }
        .foot-bottom {
          border-top: 1px solid var(--border); padding-top: 18px;
          display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px;
          font-size: 14px; color: var(--soft);
        }

        @media (max-width: 480px) {
          .nav-inner { padding: 10px 16px; }
          .nav-logo { font-size: 15px; }
          .nav-logo img { height: 36px; transform: translateY(-3px); }
          .btn-sm { font-size: 13px; padding: 0 12px; }
          section { padding: 56px 0; }
          .nav-page-link { font-size: 13px !important; margin-right: 2px !important; }
          .nav-logo-text { display: none; }
          .nav-quote-btn { display: none !important; }
        }
      `}</style>

      {/* NAV */}
      <header className="nav-bar">
        <div className="nav-inner">
          <div className="nav-logo">
            <img src="/qcypher-logo.png" alt="QCypher" />
            <span className="nav-logo-text">QCypher Technologies</span>
          </div>
          <div className="nav-cta">
            <Link href="/about" className="nav-page-link" style={{ fontSize: '15px', fontWeight: 600, color: '#5b6072', marginRight: '4px' }}>About</Link>
            <Link href="/auth/login" className="btn btn-ghost btn-sm">Sign in</Link>
            <button data-cal-link="qcypher" data-cal-namespace="qcypher" data-cal-config='{"notes":"Interested in: Free Quote"}' className="btn btn-primary btn-sm nav-quote-btn">Free quote</button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="wrap">
          <h1>We handle the tech.<br/>You run the <em>business.</em></h1>
          <p className="hero-lead">We set up and manage everything your business needs online — website, bookings, reviews, and more. No tech skills required on your end. And you get a real person guiding you through every step — month one and beyond.</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '28px', alignItems: 'center' }}>
            <a href="#packages" className="btn btn-primary">See packages & pricing →</a>
            <a href="#contact" className="btn btn-ghost">Get a free quote</a>
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontWeight: 500, marginBottom: '28px', marginTop: '-20px' }}>Talk to Felix or Thomas directly. No sales team.</p>
          <div className="trust-row">
            <span><span className="dot" />No long-term contracts</span>
            <span><span className="dot" />Switch tiers anytime</span>
            <span><span className="dot" />Real humans, real support</span>
          </div>
        </div>
      </section>

      {/* BENEFIT STRIP — 10.2 */}
      <div className="benefit-strip">
        <div className="wrap">
          <div className="benefit-strip-inner">
            <div className="benefit-item">
              <div className="benefit-icon" style={{ background: 'linear-gradient(135deg, #2a52a0, #1a3070)' }}>
                <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7.5" stroke="#fff" strokeWidth="1.5"/><path d="M6 9l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="benefit-text">
                <strong>More Online Visibility</strong>
                <span>Show up where customers are searching</span>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon" style={{ background: 'linear-gradient(135deg, #4a9db5, #2a7a96)' }}>
                <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><rect x="2" y="4" width="14" height="10" rx="2" stroke="#fff" strokeWidth="1.5"/><path d="M6 8h6M6 11h4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <div className="benefit-text">
                <strong>More Bookings</strong>
                <span>Customers schedule without calling</span>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon" style={{ background: 'linear-gradient(135deg, #00a87a, #007a58)' }}>
                <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><path d="M9 2l1.8 3.6 4 .6-2.9 2.8.7 4L9 11l-3.6 2 .7-4L3.2 6.2l4-.6z" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/></svg>
              </div>
              <div className="benefit-text">
                <strong>More 5-Star Reviews</strong>
                <span>Automated follow-ups that fill your listing</span>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon" style={{ background: 'linear-gradient(135deg, #6c3fc5, #4a2a96)' }}>
                <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><rect x="3" y="3" width="12" height="12" rx="1" stroke="#fff" strokeWidth="1.5"/><line x1="6" y1="3" x2="6" y2="15" stroke="#fff" strokeWidth="1.5"/><line x1="3" y1="6" x2="15" y2="6" stroke="#fff" strokeWidth="1.5"/></svg>
              </div>
              <div className="benefit-text">
                <strong>Monthly Reports</strong>
                <span>See what's working, get it explained by someone who knows your business</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PACKAGES */}
      <section id="packages" style={{ background: '#f4f6fc', borderTop: '1px solid rgba(31,60,136,.08)' }}>
        <div className="wrap">
          <div className="section-head center">
            <span className="eyebrow">Packages & Pricing</span>
            <h2>Everything included. Pick your pace.</h2>
            <p style={{ marginTop: '16px', fontSize: '15px', color: 'var(--ink)', fontWeight: 600 }}>Everything includes a dedicated setup call + 90-day check-in to make sure it's working.</p>
          </div>

          <div className="pkg-grid">

            {/* Starter */}
            <div className="pkg-card">
              <span className="pkg-badge-spacer" />
              <div className="pkg-for">Getting started with protection</div>
              <div className="pkg-name">Starter</div>
              <p className="pkg-tagline">Get online with hands-on setup. We do the first 48 hours with you.</p>
              <div className="pkg-price">
                <span className="amt">$600</span><span className="freq"> one-time</span>
                <span className="mo">+ $29/mo</span>
              </div>
              <details className="pkg-details" open>
                <summary>See what&apos;s included</summary>
                <div>
                  <div className="pkg-inherit">Everything in Online Launch, plus:</div>
                  <ul className="pkg-list">
                    <li><span className="chk">✓</span><span><strong>Security &amp; Backup</strong> <em>(daily backups and security monitoring to keep your site safe)</em></span></li>
                    <li><span className="chk crm-chk">✓</span><span><strong>Customer Management Tool</strong> <em>(2-week free trial, then $19/mo)</em></span></li>
                  </ul>
                </div>
              </details>
              <button data-cal-link="qcypher" data-cal-namespace="qcypher" data-cal-config='{"notes":"Interested in: Starter"}' className="btn btn-ghost btn-full" style={{ marginTop: '16px' }}>Get started</button>
              <p className="pkg-switch">Switch tiers anytime — no penalty.</p>
            </div>

            {/* Growth */}
            <div className="pkg-card pop">
              <div className="pkg-badge">Most popular</div>
              <div className="pkg-for">Ready for more customers</div>
              <div className="pkg-name">Growth</div>
              <p className="pkg-tagline">Bring in more calls and bookings. We handle reviews and your monthly check-in.</p>
              <div className="pkg-price">
                <span className="amt">$700</span><span className="freq"> one-time</span>
                <span className="mo">+ $79/mo</span>
              </div>
              <details className="pkg-details" open>
                <summary>See what&apos;s included</summary>
                <div>
                  <div className="pkg-inherit">Everything in Starter, plus:</div>
                  <ul className="pkg-list">
                    <li><span className="chk">✓</span><span><strong>Fast Customer Online Scheduler</strong> <em>(customers book appointments and fill out any needed forms, automatically)</em></span></li>
                    <li><span className="chk">✓</span><span><strong>Generate More Online Reviews</strong> <em>(ongoing Google ranking work plus automatic requests for happy-customer reviews)</em></span></li>
                    <li><span className="chk crm-chk">✓</span><span><strong>Customer Management Tool</strong> <em>(2-week free trial, then $19/mo)</em></span></li>
                  </ul>
                </div>
              </details>
              <button data-cal-link="qcypher" data-cal-namespace="qcypher" data-cal-config='{"notes":"Interested in: Growth"}' className="btn btn-primary btn-full" style={{ marginTop: '16px' }}>Get started</button>
              <p className="pkg-switch">Switch tiers anytime — no penalty.</p>
            </div>

            {/* All-In */}
            <div className="pkg-card">
              <span className="pkg-badge-spacer" />
              <div className="pkg-for">Fully hands-off growth</div>
              <div className="pkg-name">All-In</div>
              <p className="pkg-tagline">Every service, every channel managed. Monthly reports explained, questions answered.</p>
              <div className="pkg-price">
                <span className="amt">$800</span><span className="freq"> one-time</span>
                <span className="mo">+ $149/mo</span>
              </div>
              <details className="pkg-details" open>
                <summary>See what&apos;s included</summary>
                <div>
                  <div className="pkg-inherit">Everything in Growth, plus:</div>
                  <ul className="pkg-list">
                    <li><span className="chk">✓</span><span><strong>Sell Online</strong> <em>(a simple online store with secure payments built in)</em></span></li>
                    <li><span className="chk">✓</span><span><strong>Customer Engagement</strong> <em>(email newsletters, text blasts, and 24/7 website chat — all your outreach in one place)</em></span></li>
                    <li><span className="chk crm-chk">✓</span><span><strong>Customer Management Tool</strong> <em>(2-week free trial, then $19/mo)</em></span></li>
                  </ul>
                </div>
              </details>
              <button data-cal-link="qcypher" data-cal-namespace="qcypher" data-cal-config='{"notes":"Interested in: All-In"}' className="btn btn-ghost btn-full" style={{ marginTop: '16px' }}>Get started</button>
              <p className="pkg-switch">Switch tiers anytime — no penalty.</p>
            </div>

            {/* Online Launch — full width on desktop, horizontal layout */}
            <div className="pkg-card pkg-card-launch" style={{ borderColor: 'rgba(16,185,129,0.30)', background: 'linear-gradient(135deg,#f0fdf8 0%,#fff 70%)' }}>
              <div className="launch-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#059669' }}>One-time only · No monthly fee</span>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(5,150,105,0.4)', display: 'inline-block' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#5b6072' }}>Not ready for a monthly plan</span>
                </div>
                <div className="pkg-name">Online Launch</div>
                <p className="pkg-tagline">Get your business online — no ongoing costs, no contracts, no surprises.</p>
                <div className="pkg-price" style={{ borderBottom: 'none', marginBottom: '8px', paddingBottom: '0' }}>
                  <span className="amt">$750</span><span className="freq"> one-time</span>
                  <span className="no-mo">Pay once. Done. No monthly fee — ever.</span>
                </div>
                <details className="pkg-details" open>
                  <summary>See what&apos;s included</summary>
                  <div>
                    <ul className="pkg-list">
                      <li><span className="chk">✓</span><span><strong>Website</strong> <em>(a fast, mobile-friendly site built to bring in new customers)</em></span></li>
                      <li><span className="chk">✓</span><span><strong>Get Set Up Online</strong> <em>(Google Business Profile, social pages, and business email — all in one pass)</em></span></li>
                    </ul>
                  </div>
                </details>
              </div>
              <div className="launch-cta">
                <button data-cal-link="qcypher" data-cal-namespace="qcypher" data-cal-config='{"notes":"Interested in: Online Launch"}' className="btn" style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: '12px', padding: '0 32px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', minHeight: '48px', width: '100%' }}>Get started</button>
                <p className="pkg-switch" style={{ marginTop: '4px' }}>No commitment — upgrade to a monthly plan anytime.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* MONTHLY CHECK-IN */}
      <section style={{ background: '#fff', padding: '72px 0', borderTop: '1px solid rgba(31,60,136,.08)' }}>
        <div className="wrap">
          <div className="section-head center">
            <h2>Monthly Check-In — We Explain the Numbers</h2>
            <p>Every month, you get a report showing what's happening with your bookings, reviews, and customer engagement. And we'll walk you through it — no jargon, just what it means for your business.</p>
            <button data-cal-link="qcypher" data-cal-namespace="qcypher" data-cal-config='{"notes":"Interested in: Sample Report"}' className="btn btn-ghost" style={{ marginTop: '20px' }}>Ask for a sample report</button>
          </div>
        </div>
      </section>

      {/* CRM */}
      <section id="crm" className="crm-section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Built In-House — No One Else Has This</span>
            <h2>Customer Management Tool</h2>
          </div>
          <div className="crm-card">
            <div>
              <p className="crm-lead">Skip the $200/month CRM. We built it for your business — and we'll walk you through it. $19/month, questions answered by a real person.</p>
              <div className="crm-price-line">$500 one-time <span>+ $19/mo</span></div>
              <ul className="crm-features">
                <li><span className="chk">✓</span>Your full customer contact list — always organized</li>
                <li><span className="chk">✓</span>Notes and call history on every customer</li>
                <li><span className="chk">✓</span>Built-in scheduling calendar</li>
                <li><span className="chk">✓</span>Sales pipeline — see where every deal stands</li>
                <li><span className="chk">✓</span>Quick-reply text & email templates</li>
                <li><span className="chk">✓</span>Works on your phone, tablet, or computer</li>
              </ul>
            </div>
            <div className="crm-cta-col">
              <button data-cal-link="qcypher" data-cal-namespace="qcypher" data-cal-config='{"notes":"Interested in: CRM"}' className="btn btn-primary">Learn more</button>
              <p style={{ fontSize: 13, color: 'var(--soft)', textAlign: 'center', maxWidth: 140, lineHeight: 1.4 }}>2-week free trial with every monthly plan, then $19/mo</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS — 10.4: structure ready; existing testimonials shown below */}
      <section style={{ background: '#fff', borderTop: '1px solid rgba(31,60,136,.08)', padding: '72px 0' }}>
        <div className="wrap">
          <div className="section-head center">
            <span className="eyebrow">What Our Clients Say</span>
            <h2>Real results from real businesses</h2>
            <p>We work with local business owners who want straightforward tech — not a sales pitch.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '40px' }}>

            <div className="tcard">
              <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                {[0,1,2,3,4].map(i => (
                  <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="#f59e0b" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 1l1.8 3.6 4 .6-2.9 2.8.7 4L8 10l-3.6 2 .7-4L2.2 5.2l4-.6z"/>
                  </svg>
                ))}
              </div>
              <p style={{ fontSize: '15px', color: '#171a2b', lineHeight: 1.7, marginBottom: '20px' }}>
                &ldquo;Before QCypher, I was keeping track of everything in my head and a bunch of sticky notes.
                Now I actually know which customers I need to follow up with. It&apos;s honestly one of the best things I&apos;ve done for my business.&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0, background: 'rgba(42,82,160,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 700, color: '#2a52a0' }}>MR</div>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: '#171a2b' }}>Marcus R.</p>
                  <p style={{ fontSize: '14px', color: '#64748b', marginTop: '1px' }}>HVAC & Plumbing, Richmond VA</p>
                </div>
              </div>
            </div>

            <div className="tcard">
              <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                {[0,1,2,3,4].map(i => (
                  <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="#f59e0b" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 1l1.8 3.6 4 .6-2.9 2.8.7 4L8 10l-3.6 2 .7-4L2.2 5.2l4-.6z"/>
                  </svg>
                ))}
              </div>
              <p style={{ fontSize: '15px', color: '#171a2b', lineHeight: 1.7, marginBottom: '20px' }}>
                &ldquo;They set up my website and Google listing in the same week. My phone started ringing
                more within the first month. Thomas walked me through everything — no tech background needed.&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 700, color: '#059669' }}>DW</div>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: '#171a2b' }}>Denise W.</p>
                  <p style={{ fontSize: '14px', color: '#64748b', marginTop: '1px' }}>Mobile Cleaning Service, Annapolis MD</p>
                </div>
              </div>
            </div>

            <div className="tcard">
              <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                {[0,1,2,3,4].map(i => (
                  <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="#f59e0b" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 1l1.8 3.6 4 .6-2.9 2.8.7 4L8 10l-3.6 2 .7-4L2.2 5.2l4-.6z"/>
                  </svg>
                ))}
              </div>
              <p style={{ fontSize: '15px', color: '#171a2b', lineHeight: 1.7, marginBottom: '20px' }}>
                &ldquo;I&apos;ve worked with a few different tech companies and most of them just hand you a login and disappear. QCypher actually shows up. Felix walked me through everything, answered my questions the same day, and the tools they built actually work the way they say they do. Couldn&apos;t ask for more.&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 700, color: '#d97706' }}>JT</div>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: '#171a2b' }}>James T.</p>
                  <p style={{ fontSize: '14px', color: '#64748b', marginTop: '1px' }}>Roofing Contractor, Alexandria VA</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER / CONTACT */}
      <footer id="contact">
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <div className="nav-logo" style={{ marginBottom: 0 }}>
                <img src="/qcypher-logo.png" alt="QCypher" />
                QCypher Technologies
              </div>
              <p>Simple tech solutions for local businesses. No jargon, just results.</p>
            </div>
            <div className="foot-col">
              <h5>Contact Us</h5>
              <a href="mailto:info@qcyphertech.com">info@qcyphertech.com</a>
              <a href="tel:+18042505066" style={{ fontWeight: 600, color: 'var(--indigo)', marginBottom: '4px' }}>(804) 250-5066</a>
              <p style={{ fontSize: '13px', color: 'var(--soft)', margin: '0' }}>Ask for Felix or Thomas.</p>
            </div>
            <div className="foot-col">
              <h5>Quick Links</h5>
              <a href="#packages">Packages</a>
              <a href="#crm">Customer Management</a>
              <Link href="/about">About Us</Link>
              <Link href="/auth/login">Client Login</Link>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 QCypher Technologies. All rights reserved.</span>
            <span>Built for small businesses, by a small business.</span>
          </div>
        </div>
      </footer>

      {/* Cal.com popup embed — powers all "Get started" buttons */}
      <script
        dangerouslySetInnerHTML={{ __html: `
(function(C,A,L){
  let p=function(a,ar){a.q.push(ar)};
  let d=C.document;
  C.Cal=C.Cal||function(){
    let cal=C.Cal,ar=arguments;
    if(!cal.loaded){cal.ns={};cal.q=cal.q||[];d.head.appendChild(d.createElement("script")).src=A;cal.loaded=true}
    if(ar[0]===L){const api=function(){p(api,arguments)};const ns=ar[1];api.q=api.q||[];if(typeof ns==="string"){cal.ns[ns]=cal.ns[ns]||api;p(cal.ns[ns],ar);p(cal,[L,ns,api])}else p(cal,ar);return}
    p(cal,ar)
  };
})(window,"https://app.cal.com/embed/embed.js","init");
Cal("init","qcypher",{origin:"https://cal.com"});
Cal.ns.qcypher("ui",{"hideEventTypeDetails":false,"layout":"month_view"});
        ` }}
      />
    </div>
  )
}
