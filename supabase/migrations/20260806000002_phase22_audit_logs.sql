-- Phase 22: Access Logging & Audit Trail
--
-- audit_logs is written by the app (server actions/API routes) after a
-- mutating action succeeds — not by DB triggers. Inserts are allowed for any
-- authenticated member of the tenant (so the logging call itself can't be
-- blocked by a read_only user's own RLS restrictions); reads are admin-only.

create table if not exists audit_logs (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null,
  user_id       uuid not null,
  user_email    text not null,
  action        text not null,
  resource_type text not null,
  resource_id   text,
  resource_name text,
  details       jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists audit_logs_tenant_created_idx
  on audit_logs (tenant_id, created_at desc);
create index if not exists audit_logs_tenant_user_created_idx
  on audit_logs (tenant_id, user_id, created_at desc);
create index if not exists audit_logs_tenant_action_created_idx
  on audit_logs (tenant_id, action, created_at desc);
create index if not exists audit_logs_tenant_resource_created_idx
  on audit_logs (tenant_id, resource_type, created_at desc);

alter table audit_logs enable row level security;

drop policy if exists "audit_logs: tenant members can insert" on audit_logs;
create policy "audit_logs: tenant members can insert"
  on audit_logs for insert
  with check (tenant_id = public.tenant_id() and user_id = auth.uid());

drop policy if exists "audit_logs: admin read" on audit_logs;
create policy "audit_logs: admin read"
  on audit_logs for select
  using (tenant_id = public.tenant_id() and public.user_role() = 'owner');

-- 90-day retention. No pg_cron dependency here (Supabase hosted projects
-- often restrict scheduling extensions) — call this via a periodic API
-- route hit by an external scheduler (see /api/cron/purge-audit-logs).
create or replace function public.purge_old_audit_logs() returns void as $$
  delete from audit_logs where created_at < now() - interval '90 days';
$$ language sql security definer;
