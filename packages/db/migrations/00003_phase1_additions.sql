-- ============================================================
-- Migration 00003: Phase 1 — send_log for Resend/Twilio audit trail
-- ============================================================

create type send_channel as enum ('email', 'sms');
create type send_status as enum ('queued', 'sent', 'failed');

create table send_log (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references tenants(id) on delete cascade,
  contact_id   uuid references contacts(id) on delete set null,
  template_id  uuid references templates(id) on delete set null,
  channel      send_channel not null,
  recipient    text not null,
  subject      text,
  body         text not null,
  status       send_status not null default 'queued',
  provider_id  text,           -- Resend message ID or Twilio SID
  error        text,
  sent_at      timestamptz,
  created_at   timestamptz not null default now()
);

create index send_log_tenant_idx on send_log(tenant_id);
create index send_log_contact_idx on send_log(tenant_id, contact_id);

alter table send_log enable row level security;

create policy "send_log: tenant isolation select"
  on send_log for select using (tenant_id = auth.tenant_id());

create policy "send_log: tenant isolation insert"
  on send_log for insert with check (tenant_id = auth.tenant_id());

-- No direct client update/delete on send_log — it's an audit trail.
