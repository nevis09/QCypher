/**
 * QCypher CRM Service Worker
 * Strategy:
 *   - App shell (/_next/static/**, /manifest.json): cache-first
 *   - /api/*: network-only (never cache authenticated API calls)
 *   - Contacts page (/contacts): stale-while-revalidate for offline read
 */

const SHELL_CACHE  = 'qcypher-shell-v1'
const PAGES_CACHE  = 'qcypher-pages-v1'

const SHELL_ASSETS = [
  '/',
  '/contacts',
  '/manifest.json',
]

// ── Install: pre-cache shell ──────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(cache => cache.addAll(SHELL_ASSETS))
  )
  self.skipWaiting()
})

// ── Activate: purge old caches ────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== SHELL_CACHE && k !== PAGES_CACHE)
          .map(k => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// ── Fetch routing ─────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Never cache API or Supabase calls
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(fetch(request))
    return
  }

  // Static assets: cache-first
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/_next/image/') ||
    url.pathname === '/manifest.json' ||
    url.pathname.match(/\.(png|ico|svg|woff2?)$/)
  ) {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async cache => {
        const cached = await cache.match(request)
        if (cached) return cached
        const fresh = await fetch(request)
        cache.put(request, fresh.clone())
        return fresh
      })
    )
    return
  }

  // Navigation requests (HTML pages): stale-while-revalidate
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.open(PAGES_CACHE).then(async cache => {
        const cached = await cache.match(request)
        const networkFetch = fetch(request).then(res => {
          if (res.ok) cache.put(request, res.clone())
          return res
        }).catch(() => cached)
        return cached ?? networkFetch
      })
    )
    return
  }
})
