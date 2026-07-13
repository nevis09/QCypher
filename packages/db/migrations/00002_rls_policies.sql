-- ============================================================
-- Migration 00002: Row Level Security policies
-- EVERY tenant-owned table is locked down here.
-- Rule: tenant_id must match auth.tenant_id() extracted from JWT.
-- A missing/mismatched tenant_id causes auth.tenant_id() to return
-- null, which means the equality check fails and access is denied.
-- ============================================================

-- ────────────────────────────────────────
-- contacts
-- ────────────────────────────────────────
alter table contacts enable row level security;

create policy "contacts: tenant isolation select"
  on contacts for select
  using (tenant_id = auth.tenant_id());

create policy "contacts: tenant isolation insert"
  on contacts for insert
  with check (tenant_id = auth.tenant_id());

create policy "contacts: tenant isolation update"
  on contacts for update
  using (tenant_id = auth.tenant_id())
  with check (tenant_id = auth.tenant_id());

create policy "contacts: tenant isolation delete"
  on contacts for delete
  using (tenant_id = auth.tenant_id());

-- ────────────────────────────────────────
-- interactions
-- ────────────────────────────────────────
alter table interactions enable row level security;

create policy "interactions: tenant isolation select"
  on interactions for select
  using (tenant_id = auth.tenant_id());

create policy "interactions: tenant isolation insert"
  on interactions for insert
  with check (tenant_id = auth.tenant_id());

create policy "interactions: tenant isolation update"
  on interactions for update
  using (tenant_id = auth.tenant_id())
  with check (tenant_id = auth.tenant_id());

create policy "interactions: tenant isolation delete"
  on interactions for delete
  using (tenant_id = auth.tenant_id());

-- ────────────────────────────────────────
-- events
-- ────────────────────────────────────────
alter table events enable row level security;

create policy "events: tenant isolation select"
  on events for select
  using (tenant_id = auth.tenant_id());

create policy "events: tenant isolation insert"
  on events for insert
  with check (tenant_id = auth.tenant_id());

create policy "events: tenant isolation update"
  on events for update
  using (tenant_id = auth.tenant_id())
  with check (tenant_id = auth.tenant_id());

create policy "events: tenant isolation delete"
  on events for delete
  using (tenant_id = auth.tenant_id());

-- ────────────────────────────────────────
-- templates
-- ────────────────────────────────────────
alter table templates enable row level security;

create policy "templates: tenant isolation select"
  on templates for select
  using (tenant_id = auth.tenant_id());

create policy "templates: tenant isolation insert"
  on templates for insert
  with check (tenant_id = auth.tenant_id());

create policy "templates: tenant isolation update"
  on templates for update
  using (tenant_id = auth.tenant_id())
  with check (tenant_id = auth.tenant_id());

create policy "templates: tenant isolation delete"
  on templates for delete
  using (tenant_id = auth.tenant_id());

-- ────────────────────────────────────────
-- tenants: users may only read their own tenant row
-- ────────────────────────────────────────
alter table tenants enable row level security;

create policy "tenants: read own row"
  on tenants for select
  using (id = auth.tenant_id());

-- No direct insert/update/delete on tenants from client — provisioned server-side only.
