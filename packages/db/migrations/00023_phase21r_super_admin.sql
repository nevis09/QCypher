-- Phase 21 Revised: Super Admin, Approval Requests & Impersonation
--
-- Scope decision: rather than migrating tenant-level role storage from
-- app_metadata (owner/member/read_only, live since Phase 21) into a new
-- users_roles table, super admin is layered on top as a separate concept
-- keyed off a hardcoded email allowlist. This avoids re-touching every
-- RLS policy and auth check that's already tested in production, while
-- still delivering the console/approval/impersonation/audit-filtering
-- functionality. 'owner' app_metadata role == "Admin" tier in this spec;
-- 'member' == "User"; 'read_only' == "Read-only".

create or replace function public.is_super_admin() returns boolean as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'email', auth.jwt() ->> 'email', '')
    in ('nevis09@gmail.com', 'qcyphertech@gmail.com');
$$ language sql stable security definer;

create table if not exists approval_requests (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references tenants(id),
  requested_by     uuid not null references auth.users(id),
  request_type     text not null, -- 'delete_account' | 'change_plan' | 'enable_integration' | 'disable_integration'
  details          jsonb,
  status           text not null default 'pending', -- 'pending' | 'approved' | 'denied'
  approved_by      uuid references auth.users(id),
  approval_reason  text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists approval_requests_tenant_idx on approval_requests (tenant_id, created_at desc);
create index if not exists approval_requests_status_idx on approval_requests (status, created_at desc);

alter table approval_requests enable row level security;

drop policy if exists "approval_requests: tenant admin select own" on approval_requests;
create policy "approval_requests: tenant admin select own"
  on approval_requests for select
  using (public.is_super_admin() or (tenant_id = public.tenant_id() and public.user_role() = 'owner'));

drop policy if exists "approval_requests: tenant admin insert own" on approval_requests;
create policy "approval_requests: tenant admin insert own"
  on approval_requests for insert
  with check (tenant_id = public.tenant_id() and public.user_role() = 'owner' and requested_by = auth.uid());

drop policy if exists "approval_requests: super admin decide" on approval_requests;
create policy "approval_requests: super admin decide"
  on approval_requests for update
  using (public.is_super_admin())
  with check (public.is_super_admin());

create table if not exists impersonation_logs (
  id              uuid primary key default gen_random_uuid(),
  super_admin_id  uuid not null references auth.users(id),
  tenant_id       uuid not null references tenants(id),
  started_at      timestamptz not null default now(),
  ended_at        timestamptz,
  reason          text
);

create index if not exists impersonation_logs_tenant_idx on impersonation_logs (tenant_id, started_at desc);

alter table impersonation_logs enable row level security;

drop policy if exists "impersonation_logs: super admin only" on impersonation_logs;
create policy "impersonation_logs: super admin only"
  on impersonation_logs for all
  using (public.is_super_admin())
  with check (public.is_super_admin() and super_admin_id = auth.uid());

-- Super admins can read every tenant's audit_logs (Phase 22), in addition
-- to the existing tenant-owner-only policy.
drop policy if exists "audit_logs: super admin read all" on audit_logs;
create policy "audit_logs: super admin read all"
  on audit_logs for select
  using (public.is_super_admin());

-- Super admins can read every tenant row (needed for the Admin Console
-- client list) and every team member's role, in addition to existing
-- tenant-scoped access elsewhere in the app (those paths already use the
-- service-role admin client, so this is additive, not a narrowing).
drop policy if exists "tenants: super admin read all" on tenants;
create policy "tenants: super admin read all"
  on tenants for select
  using (public.is_super_admin());
