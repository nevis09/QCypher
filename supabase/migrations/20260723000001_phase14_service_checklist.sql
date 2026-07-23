-- Phase 14B: Ops service checklist — one row per tenant per month per service.
-- Staff manually check off that each service was delivered. Resets each calendar month.

CREATE TABLE IF NOT EXISTS service_checklist (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  month        TEXT        NOT NULL,          -- 'YYYY-MM', e.g. '2026-07'
  service_name TEXT        NOT NULL,          -- 'reviews' | 'scheduler' | 'missed_call' | 'backup'
  completed    BOOLEAN     NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by UUID        REFERENCES auth.users(id),
  UNIQUE (tenant_id, month, service_name)
);

CREATE INDEX IF NOT EXISTS service_checklist_tenant_month_idx
  ON service_checklist(tenant_id, month);

ALTER TABLE service_checklist ENABLE ROW LEVEL SECURITY;

-- Only admin tenants (is_admin=true) can read/write the checklist.
-- We use service role for all writes from the admin panel API route.
-- Regular tenant users have no access.
CREATE POLICY "service_checklist_admin_select" ON service_checklist
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tenants
      WHERE id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
        AND is_admin = true
    )
  );

CREATE POLICY "service_checklist_admin_insert" ON service_checklist
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenants
      WHERE id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
        AND is_admin = true
    )
  );

CREATE POLICY "service_checklist_admin_update" ON service_checklist
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM tenants
      WHERE id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
        AND is_admin = true
    )
  );
