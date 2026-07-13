-- ============================================================
-- Migration 00001: Core schema with tenant isolation
-- Every tenant-owned table has tenant_id + RLS policy.
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ────────────────────────────────────────
-- Enums
-- ────────────────────────────────────────
create type contact_status as enum ('active', 'inactive', 'lead');
create type interaction_type as enum ('call', 'email', 'visit', 'note');
create type template_channel as enum ('sms', 'email');

-- ────────────────────────────────────────
-- tenants (Tenant #0 = QCypher itself)
-- ────────────────────────────────────────
create table tenants (
  id        uuid primary key default gen_random_uuid(),
  name      text not null,
  slug      text not null unique,
  created_at timestamptz not null default now()
);

-- tenant_id is stored in the JWT under app_metadata.tenant_id
-- Helper to extract it safely (returns null if absent, so RLS denies access)
create or replace function auth.tenant_id() returns uuid as $$
  select nullif(
    (auth.jwt() -> 'app_metadata' ->> 'tenant_id'),
    ''
  )::uuid;
$$ language sql stable security definer;

-- ────────────────────────────────────────
-- contacts
-- ────────────────────────────────────────
create table contacts (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  first_name  text not null,
  last_name   text,
  email       text,
  phone       text,
  company     text,
  address     text,
  notes       text,
  tags        text[],
  source      text,
  status      contact_status not null default 'active',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index contacts_tenant_id_idx on contacts(tenant_id);
create index contacts_email_idx on contacts(tenant_id, lower(email));

-- ────────────────────────────────────────
-- interactions (timeline per contact)
-- ────────────────────────────────────────
create table interactions (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  contact_id  uuid not null references contacts(id) on delete cascade,
  type        interaction_type not null,
  body        text not null,
  occurred_at timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create index interactions_tenant_id_idx on interactions(tenant_id);
create index interactions_contact_id_idx on interactions(tenant_id, contact_id);

-- ────────────────────────────────────────
-- events (calendar)
-- ────────────────────────────────────────
create table events (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  contact_id  uuid references contacts(id) on delete set null,
  title       text not null,
  description text,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  created_at  timestamptz not null default now(),
  constraint events_ends_after_starts check (ends_at > starts_at)
);

create index events_tenant_id_idx on events(tenant_id);
create index events_time_idx on events(tenant_id, starts_at);

-- ────────────────────────────────────────
-- templates (quick-reply snippets)
-- ────────────────────────────────────────
create table templates (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  name        text not null,
  channel     template_channel not null,
  subject     text,
  body        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index templates_tenant_id_idx on templates(tenant_id);

-- ────────────────────────────────────────
-- updated_at trigger (shared)
-- ────────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger contacts_updated_at before update on contacts
  for each row execute function set_updated_at();

create trigger templates_updated_at before update on templates
  for each row execute function set_updated_at();
