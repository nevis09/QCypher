-- ============================================================
-- Migration 00016: Phase 12 — SMS Triggers
-- Adds:
--   • job_status enum + column on orders (en_route, in_progress, completed)
--   • twilio_number column on tenants (the forwarding number we provision)
--   • calls table — logs every inbound missed call with RLS
-- ============================================================

-- ────────────────────────────────────────
-- 1. Job status for orders
-- ────────────────────────────────────────
create type job_status as enum ('en_route', 'in_progress', 'completed');

alter table orders
  add column job_status job_status;

-- ────────────────────────────────────────
-- 2. Twilio forwarding number per tenant
-- ────────────────────────────────────────
alter table tenants
  add column twilio_number text;

-- ────────────────────────────────────────
-- 3. calls — inbound missed-call log
-- ────────────────────────────────────────
create table calls (
  id              uuid        primary key default gen_random_uuid(),
  tenant_id       uuid        not null references tenants(id) on delete cascade,
  caller_phone    text        not null,
  twilio_sid      text,
  contact_id      uuid        references contacts(id) on delete set null,
  sms_sent        boolean     not null default false,
  sms_error       text,
  occurred_at     timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

create index calls_tenant_idx   on calls(tenant_id);
create index calls_contact_idx  on calls(tenant_id, contact_id);
create index calls_occurred_idx on calls(tenant_id, occurred_at desc);

-- RLS: same pattern as every other tenant table
alter table calls enable row level security;

create policy "calls: tenant isolation select"
  on calls for select using (tenant_id = auth.tenant_id());

create policy "calls: tenant isolation insert"
  on calls for insert with check (tenant_id = auth.tenant_id());

create policy "calls: tenant isolation update"
  on calls for update
  using (tenant_id = auth.tenant_id())
  with check (tenant_id = auth.tenant_id());

create policy "calls: tenant isolation delete"
  on calls for delete using (tenant_id = auth.tenant_id());
