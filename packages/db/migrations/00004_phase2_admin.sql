-- ============================================================
-- Migration 00004: Phase 2 — admin metadata + invite tokens
-- ============================================================

-- Track whether a tenant is the internal QCypher admin (tenant #0)
alter table tenants add column if not exists is_admin boolean not null default false;
alter table tenants add column if not exists plan text not null default 'free';
alter table tenants add column if not exists status text not null default 'active'
  check (status in ('active', 'suspended', 'trial'));

-- One-time invite tokens (server-generated, single-use)
create table invite_tokens (
  id           uuid primary key default gen_random_uuid(),
  token        text not null unique default encode(gen_random_bytes(32), 'hex'),
  tenant_id    uuid not null references tenants(id) on delete cascade,
  email        text not null,
  used_at      timestamptz,
  expires_at   timestamptz not null default (now() + interval '7 days'),
  created_at   timestamptz not null default now()
);

create index invite_tokens_token_idx on invite_tokens(token);

-- invite_tokens has NO RLS — they are created server-side only (service_role)
-- and read server-side only (provisioning + invite acceptance).
-- Client code never touches this table.

-- rate_limit_log: simple abuse tracking for public endpoints
-- Keyed by ip + endpoint. Queried server-side only (no RLS needed; no tenant data).
create table rate_limit_log (
  id         bigserial primary key,
  ip         text not null,
  endpoint   text not null,
  hit_at     timestamptz not null default now()
);

create index rate_limit_log_lookup_idx on rate_limit_log(ip, endpoint, hit_at);

-- Auto-purge entries older than 1 hour (runs on query, not a cron)
-- Actual enforcement is in application middleware.
