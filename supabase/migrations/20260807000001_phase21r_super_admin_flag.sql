-- Move super admin identity from a hardcoded email allowlist to a
-- DB-backed flag (app_metadata.is_super_admin), matching how tenant_id
-- and role already work. See scripts/seed-super-admins.ts, which stamps
-- this flag on the two designated accounts — that script is now the only
-- hardcoded list in the system, and it's a one-time provisioning step,
-- not a runtime authorization check.

create or replace function public.is_super_admin() returns boolean as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean, false);
$$ language sql stable security definer;
