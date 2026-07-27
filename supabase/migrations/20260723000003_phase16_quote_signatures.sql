-- Phase 16: E-Signature on Quotes
-- Tenant isolation model: every row is scoped to tenant_id.
-- Authenticated (staff) access is gated by RLS: tenant_id = auth.jwt()->'app_metadata'->>'tenant_id'
-- Public tokenized access (customer signing) is via /q/[token] using service-role server action
-- and does NOT bypass RLS — the server action verifies token validity and tenant scoping in code.

-- Add signed_at to orders so status checks don't need a join
ALTER TABLE orders ADD COLUMN IF NOT EXISTS signed_at TIMESTAMPTZ;

-- quote_signatures: one row per signed quote
CREATE TABLE IF NOT EXISTS quote_signatures (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id        UUID        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  signed_by_name  TEXT        NOT NULL,
  signature_type  TEXT        NOT NULL DEFAULT 'typed' CHECK (signature_type IN ('typed', 'drawn')),
  signature_data  TEXT        NOT NULL,
  ip_address      TEXT,
  signed_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  access_token    TEXT        UNIQUE NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE (order_id)
);

CREATE INDEX IF NOT EXISTS quote_signatures_tenant_id_idx ON quote_signatures(tenant_id);
CREATE INDEX IF NOT EXISTS quote_signatures_access_token_idx ON quote_signatures(access_token);
CREATE INDEX IF NOT EXISTS quote_signatures_order_id_idx ON quote_signatures(order_id);

ALTER TABLE quote_signatures ENABLE ROW LEVEL SECURITY;

-- Authenticated staff can read their own tenant's signatures
CREATE POLICY "tenant_select" ON quote_signatures
  FOR SELECT USING (
    tenant_id::text = (auth.jwt()->'app_metadata'->>'tenant_id')
  );

-- No INSERT/UPDATE/DELETE via authenticated RLS —
-- customer signing goes through a service-role server action that validates the token in code.
-- Staff cannot directly insert or modify signature records.

-- quote_tokens: pending (unsent/unexpired) tokens, separate from signatures
-- This table holds tokens for quotes that haven't been signed yet.
-- Once signed, the token is stored in quote_signatures and this row is deleted.
CREATE TABLE IF NOT EXISTS quote_tokens (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id        UUID        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  access_token    TEXT        UNIQUE NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (order_id)
);

CREATE INDEX IF NOT EXISTS quote_tokens_tenant_id_idx ON quote_tokens(tenant_id);
CREATE INDEX IF NOT EXISTS quote_tokens_access_token_idx ON quote_tokens(access_token);

ALTER TABLE quote_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_select" ON quote_tokens
  FOR SELECT USING (
    tenant_id::text = (auth.jwt()->'app_metadata'->>'tenant_id')
  );

CREATE POLICY "tenant_insert" ON quote_tokens
  FOR INSERT WITH CHECK (
    tenant_id::text = (auth.jwt()->'app_metadata'->>'tenant_id')
  );

CREATE POLICY "tenant_delete" ON quote_tokens
  FOR DELETE USING (
    tenant_id::text = (auth.jwt()->'app_metadata'->>'tenant_id')
  );
