-- Phase 17: Client Self-Serve Portal
-- Adds portal_magic_links, portal_sessions, and extends orders for Helcim payment tracking.

-- ─── Magic-link tokens ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portal_magic_links (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id  UUID        NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  token       TEXT        UNIQUE NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: staff (authenticated, same tenant) can INSERT and SELECT their own links.
-- No anon write; magic-link validation uses service-role server action only.
ALTER TABLE portal_magic_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant staff can manage magic links"
  ON portal_magic_links
  FOR ALL
  TO authenticated
  USING  (tenant_id = (auth.jwt()->'app_metadata'->>'tenant_id')::uuid)
  WITH CHECK (tenant_id = (auth.jwt()->'app_metadata'->>'tenant_id')::uuid);

-- ─── Portal sessions ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portal_sessions (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id   UUID        NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  access_token TEXT        UNIQUE NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No RLS row-access for portal sessions: validated server-side via service-role only.
-- Anon cannot read or write. Authenticated staff can read (for auditing).
ALTER TABLE portal_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant staff can read portal sessions"
  ON portal_sessions
  FOR SELECT
  TO authenticated
  USING (tenant_id = (auth.jwt()->'app_metadata'->>'tenant_id')::uuid);

-- No INSERT/UPDATE/DELETE for authenticated role — service-role only.

-- ─── Extend orders for Helcim payment tracking ───────────────────────────────
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS helcim_transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Index for portal queries: contact's open orders within a tenant
CREATE INDEX IF NOT EXISTS idx_orders_tenant_contact
  ON orders (tenant_id, customer_id);

CREATE INDEX IF NOT EXISTS idx_portal_magic_links_token
  ON portal_magic_links (token);

CREATE INDEX IF NOT EXISTS idx_portal_sessions_token
  ON portal_sessions (access_token);
