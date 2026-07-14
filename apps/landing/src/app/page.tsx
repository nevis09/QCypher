'use client'

import { useState } from 'react'

function Check() {
  return (
    <span className="check" style={{ flexShrink: 0 }}>✓</span>
  )
}

export default function LandingPage() {
  const [plan, setPlan] = useState<'care' | 'ads'>('care')

  return (
    <>
      {/* ── App Banner ── */}
      <div style={{
        background: 'linear-gradient(90deg, var(--indigo-deep) 0%, var(--indigo) 60%, var(--blue) 100%)',
        color: '#fff',
        textAlign: 'center',
        padding: '13px 24px',
        fontSize: 15,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <span style={{ opacity: .85 }}>✨ The Mekobi CRM is live — try it free today</span>
        <a
          href="http://localhost:3011"
          style={{
            background: 'var(--coral)',
            color: '#fff',
            padding: '6px 18px',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 14,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(255,106,77,.4)',
            transition: 'background .15s ease',
          }}
        >
          Open the App →
        </a>
      </div>

      {/* ── Header ── */}
      <header>
        <nav className="wrap">
          <a href="#" className="logo">
            <div className="logo-mark">Q</div>
            QCypher Technologies
          </a>
          <div className="navlinks">
            <a href="#packages">Packages</a>
            <a href="#crm">CRM</a>
            <a href="#plans">Plans</a>
            <a href="mailto:hello@qcyphertech.com">Contact</a>
          </div>
          <div className="nav-cta">
            <a href="tel:+13865003693" className="btn btn-ghost" style={{ padding: '10px 20px', fontSize: 14 }}>
              (386) 500-3693
            </a>
            <a href="mailto:hello@qcyphertech.com" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>
              Get Started
            </a>
          </div>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <p className="eyebrow">Web · CRM · Marketing</p>
              <h1>Your Business Deserves a <span>Digital Edge</span></h1>
              <p className="lead">
                Affordable websites, smart CRM, and local marketing for plumbers, shops, and service businesses — built fast, priced fair, no monthly surprises on build costs.
              </p>
              <div className="hero-actions">
                <a href="mailto:hello@qcyphertech.com" className="btn btn-primary">Start Your Project →</a>
                <a href="#packages" className="btn btn-ghost">See Packages</a>
              </div>
              <div className="trust-row">
                <span><span className="dot" /> One-time build fees</span>
                <span><span className="dot" /> Low monthly hosting</span>
                <span><span className="dot" /> U.S.-based support</span>
              </div>
            </div>

            <div className="hero-card">
              <h3>🚀 What You Get at a Glance</h3>
              <div className="mini-row">
                <span><b>Starter Website</b></span>
                <span className="mini-tag">$600 one-time</span>
              </div>
              <div className="mini-row">
                <span><b>Growth Website</b></span>
                <span className="mini-tag">$950 one-time</span>
              </div>
              <div className="mini-row">
                <span><b>Monthly Hosting</b></span>
                <span className="mini-tag">from $59/mo</span>
              </div>
              <div className="mini-row">
                <span><b>CRM Add-on</b></span>
                <span className="mini-tag">$19/mo flat</span>
              </div>
              <div className="mini-row">
                <span><b>E-Commerce Add-on</b></span>
                <span className="mini-tag">+$400 one-time</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Strip ── */}
      <div className="strip">
        <div className="wrap">
          <div className="strip-item">
            <div className="strip-icon">⚡</div>
            <div>
              <h4>Launch in Days</h4>
              <p>We move fast so your site is live before your next job.</p>
            </div>
          </div>
          <div className="strip-item">
            <div className="strip-icon">🔒</div>
            <div>
              <h4>No Lock-in</h4>
              <p>You own your domain, content, and data — always.</p>
            </div>
          </div>
          <div className="strip-item">
            <div className="strip-icon">📞</div>
            <div>
              <h4>Real Support</h4>
              <p>Reach a human by phone or email — not a chatbot.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Packages ── */}
      <section id="packages">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">Website Packages</p>
            <h2>One-Time Build · Your Site, Your Way</h2>
            <p>Pay once to get built. Then choose a low-cost monthly plan. No hidden recurring build charges.</p>
          </div>

          <div className="cards">
            {/* Starter */}
            <div className="card">
              <p className="step">Step 1 · Start Here</p>
              <h3>Starter Package</h3>
              <div className="price">$600</div>
              <p className="price-note">One-time build fee</p>
              <ul>
                {[
                  'Up to 5 pages (Home, About, Services, Gallery, Contact)',
                  'Mobile-responsive design',
                  'Contact form + Google Maps embed',
                  'Basic SEO setup (titles, meta, sitemap)',
                  'Social media links',
                  'SSL certificate included',
                  '2 rounds of revision',
                ].map(f => (
                  <li key={f}><Check />{f}</li>
                ))}
              </ul>
              <a href="mailto:hello@qcyphertech.com" className="btn btn-ghost">Get Starter →</a>
            </div>

            {/* Growth */}
            <div className="card featured">
              <span className="badge">Most Popular</span>
              <p className="step">Step 2 · Grow Faster</p>
              <h3>Growth Package</h3>
              <div className="price">$950</div>
              <p className="price-note">One-time build fee</p>
              <ul>
                {[
                  'Everything in Starter',
                  'Up to 10 pages',
                  'Blog / news section',
                  'Testimonials & reviews showcase',
                  'Google Business Profile setup',
                  'Advanced on-page SEO',
                  'Speed optimisation (Core Web Vitals)',
                  '3 rounds of revision',
                  'Priority 48-hour support',
                ].map(f => (
                  <li key={f}><Check />{f}</li>
                ))}
              </ul>
              <a href="mailto:hello@qcyphertech.com" className="btn btn-primary">Get Growth →</a>
            </div>

            {/* E-Commerce */}
            <div className="card">
              <p className="step">Add-on · Sell Online</p>
              <h3>E-Commerce Add-on</h3>
              <div className="price">+$400</div>
              <p className="price-note">One-time, added to any package</p>
              <ul>
                {[
                  'Product catalogue (up to 50 items)',
                  'Secure checkout (Stripe / PayPal)',
                  'Order management dashboard',
                  'Inventory tracking',
                  'Discount / coupon codes',
                  'Automated order confirmation emails',
                ].map(f => (
                  <li key={f}><Check />{f}</li>
                ))}
              </ul>
              <a href="mailto:hello@qcyphertech.com" className="btn btn-ghost">Add E-Commerce →</a>
            </div>
          </div>

          <div className="addons">
            <a href="mailto:hello@qcyphertech.com?subject=QR Stand Add-on" className="addon" style={{ textDecoration: 'none', cursor: 'pointer' }}>
              <div>
                <h4>QR Stand</h4>
                <p>Physical table-top QR stand that links to your site or menu. Perfect for counters and waiting areas.</p>
              </div>
              <div className="amt">+$100 →</div>
            </a>
            <a href="mailto:hello@qcyphertech.com?subject=Logo Design" className="addon" style={{ textDecoration: 'none', cursor: 'pointer' }}>
              <div>
                <h4>Logo Design</h4>
                <p>Professional logo created to match your brand. Delivered in full vector + web formats.</p>
              </div>
              <div className="amt">Ask us →</div>
            </a>
          </div>
        </div>
      </section>

      {/* ── CRM ── */}
      <section id="crm" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="crm">
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p className="eyebrow">Mekobi CRM</p>
              <h2>Keep Every Customer — Without the Complexity</h2>
              <p className="lead">
                A lightweight CRM built for small businesses. Track contacts, send follow-ups, log every interaction — all in one place with no per-user fees ever.
              </p>
              <div className="crm-price">
                <div>
                  <b>$500</b>
                  <span>One-time setup</span>
                </div>
                <div>
                  <b>$19/mo</b>
                  <span>Flat monthly — unlimited users</span>
                </div>
              </div>
              <a href="mailto:hello@qcyphertech.com" className="btn btn-primary">Add CRM to My Plan →</a>
            </div>

            <div className="crm-panel" style={{ position: 'relative', zIndex: 1 }}>
              <h4>What&rsquo;s included</h4>
              {[
                'Contact & lead management',
                'Interaction timeline & notes',
                'Email & SMS templates',
                'Calendar & follow-up reminders',
                'Send logs & delivery tracking',
                'Unlimited team members',
                'Multi-location support',
              ].map(f => (
                <div className="crm-feat" key={f}><Check />{f}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Plans ── */}
      <section id="plans">
        <div className="wrap">
          <div className="section-head" style={{ margin: '0 auto 20px', textAlign: 'center', maxWidth: 560 }}>
            <p className="eyebrow">Monthly Plans</p>
            <h2>Hosting + Marketing, All-In</h2>
            <p>Choose what you need. Cancel any time.</p>
          </div>

          <div className="toggle-bar">
            <button
              className={plan === 'care' ? 'active' : ''}
              onClick={() => setPlan('care')}
            >
              Care Plans
            </button>
            <button
              className={plan === 'ads' ? 'active' : ''}
              onClick={() => setPlan('ads')}
            >
              Ads Add-on
            </button>
          </div>

          {plan === 'care' ? (
            <div className="plans">
              {/* Presence */}
              <div className="plan">
                <h3>Presence</h3>
                <div className="price">$59 <span>/ mo</span></div>
                <p className="desc">Everything you need to stay online and look professional.</p>
                <ul>
                  {[
                    'Managed hosting & SSL',
                    'Monthly content update (up to 1 hr)',
                    'Uptime monitoring',
                    'Security patches & backups',
                    'Email support',
                  ].map(f => <li key={f}><Check />{f}</li>)}
                </ul>
                <a href="mailto:hello@qcyphertech.com" className="btn btn-ghost">Choose Presence</a>
              </div>

              {/* Growth */}
              <div className="plan pop">
                <span className="badge2">Best Value</span>
                <h3>Growth</h3>
                <div className="price">$99 <span>/ mo</span></div>
                <p className="desc">Active promotion + a CRM to turn visitors into repeat customers.</p>
                <ul>
                  {[
                    'Everything in Presence',
                    'Monthly content updates (up to 3 hrs)',
                    'Google Business Profile management',
                    'Monthly performance report',
                    'Priority phone & email support',
                    'CRM included ($19/mo value)',
                  ].map(f => <li key={f}><Check />{f}</li>)}
                </ul>
                <a href="mailto:hello@qcyphertech.com" className="btn btn-primary">Choose Growth</a>
              </div>

              {/* Custom */}
              <div className="plan">
                <h3>Custom</h3>
                <div className="price" style={{ fontSize: 22, paddingTop: 6 }}>Let&rsquo;s talk</div>
                <p className="desc">Multi-location, franchise, or high-volume needs — we scope it together.</p>
                <ul>
                  {[
                    'Everything in Growth',
                    'Dedicated account manager',
                    'Custom integrations',
                    'Multi-location dashboard',
                    'SLA + 4-hr response window',
                  ].map(f => <li key={f}><Check />{f}</li>)}
                </ul>
                <a href="mailto:hello@qcyphertech.com" className="btn btn-ghost">Contact Sales</a>
              </div>
            </div>
          ) : (
            <div className="plans">
              <div className="plan" style={{ gridColumn: '1 / -1', maxWidth: 620, margin: '0 auto' }}>
                <h3>Ads Add-on</h3>
                <div className="price">$79 <span>/ mo</span></div>
                <p className="desc">Paid search & social ad management layered on top of any Care Plan. Ad spend is separate and controlled by you.</p>
                <ul>
                  {[
                    'Google Ads campaign setup & management',
                    'Facebook / Instagram ad management',
                    'Monthly creative refresh (copy + images)',
                    'Conversion tracking & pixel setup',
                    'Monthly ad performance report',
                    'Budget optimisation recommendations',
                    'Requires Presence or Growth plan',
                  ].map(f => <li key={f}><Check />{f}</li>)}
                </ul>
                <a href="mailto:hello@qcyphertech.com" className="btn btn-primary" style={{ maxWidth: 260 }}>Add Ads to My Plan →</a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA band ── */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="cta-band">
            <h2>Ready to Get Found Online?</h2>
            <p>No contracts. No surprises. Just a great website and the tools to grow.</p>
            <div className="hero-actions">
              <a href="mailto:hello@qcyphertech.com" className="btn btn-primary">Email Us Now →</a>
              <a href="tel:+13865003693" className="btn btn-ghost">Call Sales: (386) 500-3693</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <a href="#" className="logo">
                <div className="logo-mark">Q</div>
                QCypher Technologies
              </a>
              <p>Web design, CRM, and digital marketing for small businesses across the U.S.</p>
            </div>
            <div className="foot-col">
              <h5>Services</h5>
              <a href="#packages">Website Packages</a>
              <a href="#crm">CRM (Mekobi)</a>
              <a href="#plans" onClick={() => setPlan('care')}>Care Plans</a>
              <a href="#plans" onClick={() => setPlan('ads')}>Ads Add-on</a>
            </div>
            <div className="foot-col">
              <h5>Contact</h5>
              <a href="mailto:hello@qcyphertech.com">hello@qcyphertech.com</a>
              <a href="tel:+13865003693">Sales: (386) 500-3693</a>
              <a href="tel:+18048789107">Support: (804) 878-9107</a>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© {new Date().getFullYear()} QCypher Technologies. All rights reserved.</span>
            <span>Built with care for small businesses.</span>
          </div>
        </div>
      </footer>
    </>
  )
}
