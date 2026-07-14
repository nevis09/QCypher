/**
 * k6 load test — multi-tenant concurrent traffic simulation
 *
 * Usage:
 *   k6 run --env BASE_URL=https://your-app.vercel.app \
 *          --env TENANT_A_TOKEN=<jwt> \
 *          --env TENANT_B_TOKEN=<jwt> \
 *          load-tests/multi-tenant.js
 *
 * Get tokens: sign in via the app, copy the access_token from
 * localStorage under supabase.auth.token.
 *
 * Install k6: brew install k6
 */

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Counter, Trend } from 'k6/metrics'

const BASE_URL    = __ENV.BASE_URL    ?? 'http://localhost:3011'
const TOKEN_A     = __ENV.TENANT_A_TOKEN ?? ''
const TOKEN_B     = __ENV.TENANT_B_TOKEN ?? ''

// Custom metrics
const rlsViolations = new Counter('rls_violations')
const contactsLatency = new Trend('contacts_list_latency', true)

export const options = {
  scenarios: {
    // 20 concurrent users across both tenants, ramping over 2 min
    ramp_up: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '60s', target: 20 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    // p95 contacts list must be under 800ms
    contacts_list_latency: ['p(95)<800'],
    // Zero RLS violations tolerated
    rls_violations: ['count==0'],
    // Overall error rate under 1%
    http_req_failed: ['rate<0.01'],
  },
}

const HEADERS = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
})

export default function () {
  // Alternate between tenant A and B based on VU ID
  const token  = (__VU % 2 === 0) ? TOKEN_A : TOKEN_B
  const isA    = __VU % 2 === 0

  // 1. List contacts
  const listStart = Date.now()
  const listRes = http.get(`${BASE_URL}/api/contacts-check`, { headers: HEADERS(token) })
  contactsLatency.add(Date.now() - listStart)

  // 2. If Supabase REST is exposed directly, verify tenant isolation on contacts
  //    (This tests via the app API rather than direct DB access)
  //    We check that we never see the other tenant's canary contact.
  const CANARY_B_NAME = 'Sweep B'
  if (isA && listRes.status === 200) {
    try {
      const body = listRes.json()
      const contacts = Array.isArray(body) ? body : (body.data ?? [])
      const leaked = contacts.some(c => c.first_name === 'Sweep' && c.last_name === 'B')
      if (leaked) {
        rlsViolations.add(1)
        console.error(`RLS VIOLATION: Tenant A saw Tenant B contact in VU ${__VU}`)
      }
    } catch (_) {}
  }

  check(listRes, {
    'contacts endpoint reachable': r => r.status !== 500,
    'not unauthorized after login': r => r.status !== 401,
  })

  sleep(1)
}
