-- ============================================================
-- Migration 00020: Phase 21 — Role-Based Access Control
--
-- Adds a third role ('read_only') alongside the existing
-- 'owner' / 'member' roles already stored in
-- auth.users.raw_app_meta_data (JWT app_metadata). No new role
-- column/table is introduced here — role continues to live in
-- the JWT, matching the existing tenant_id pattern, so this
-- migration only adds:
--   1. public.user_role() — mirrors public.tenant_id(), reads
--      app_metadata.role, defaults to 'member' when absent
--      (keeps existing users working unchanged).
--   2. Restrictive write policies on the core tenant tables so
--      'read_only' users can SELECT but never INSERT/UPDATE/DELETE,
--      enforced at the database level (not just hidden in the UI).
--
-- NOTE: role is still JWT-derived, so it inherits the same
-- staleness caveat as public.tenant_id() — a role change via
-- admin.auth.admin.updateUserById() only takes effect in RLS
-- once the user's JWT is refreshed (next sign-in / token refresh).
-- The team.ts server actions already re-fetch fresh app_metadata
-- via the Admin API for their own authorization checks, so this
-- only affects the window before the target user's token refreshes.
-- ============================================================

create or replace function public.user_role() returns text as $$
  select coalesce(
    nullif((auth.jwt() -> 'app_metadata' ->> 'role'), ''),
    'member'
  );
$$ language sql stable security definer;

-- ────────────────────────────────────────
-- contacts — block writes for read_only
-- ────────────────────────────────────────
drop policy if exists "contacts: tenant isolation insert" on contacts;
create policy "contacts: tenant isolation insert"
  on contacts for insert
  with check (tenant_id = public.tenant_id() and public.user_role() <> 'read_only');

drop policy if exists "contacts: tenant isolation update" on contacts;
create policy "contacts: tenant isolation update"
  on contacts for update
  using (tenant_id = public.tenant_id() and public.user_role() <> 'read_only')
  with check (tenant_id = public.tenant_id() and public.user_role() <> 'read_only');

drop policy if exists "contacts: tenant isolation delete" on contacts;
create policy "contacts: tenant isolation delete"
  on contacts for delete
  using (tenant_id = public.tenant_id() and public.user_role() <> 'read_only');

-- ────────────────────────────────────────
-- interactions — block writes for read_only
-- ────────────────────────────────────────
drop policy if exists "interactions: tenant isolation insert" on interactions;
create policy "interactions: tenant isolation insert"
  on interactions for insert
  with check (tenant_id = public.tenant_id() and public.user_role() <> 'read_only');

drop policy if exists "interactions: tenant isolation update" on interactions;
create policy "interactions: tenant isolation update"
  on interactions for update
  using (tenant_id = public.tenant_id() and public.user_role() <> 'read_only')
  with check (tenant_id = public.tenant_id() and public.user_role() <> 'read_only');

drop policy if exists "interactions: tenant isolation delete" on interactions;
create policy "interactions: tenant isolation delete"
  on interactions for delete
  using (tenant_id = public.tenant_id() and public.user_role() <> 'read_only');

-- ────────────────────────────────────────
-- events — block writes for read_only
-- ────────────────────────────────────────
drop policy if exists "events: tenant isolation insert" on events;
create policy "events: tenant isolation insert"
  on events for insert
  with check (tenant_id = public.tenant_id() and public.user_role() <> 'read_only');

drop policy if exists "events: tenant isolation update" on events;
create policy "events: tenant isolation update"
  on events for update
  using (tenant_id = public.tenant_id() and public.user_role() <> 'read_only')
  with check (tenant_id = public.tenant_id() and public.user_role() <> 'read_only');

drop policy if exists "events: tenant isolation delete" on events;
create policy "events: tenant isolation delete"
  on events for delete
  using (tenant_id = public.tenant_id() and public.user_role() <> 'read_only');

-- ────────────────────────────────────────
-- templates — block writes for read_only
-- ────────────────────────────────────────
drop policy if exists "templates: tenant isolation insert" on templates;
create policy "templates: tenant isolation insert"
  on templates for insert
  with check (tenant_id = public.tenant_id() and public.user_role() <> 'read_only');

drop policy if exists "templates: tenant isolation update" on templates;
create policy "templates: tenant isolation update"
  on templates for update
  using (tenant_id = public.tenant_id() and public.user_role() <> 'read_only')
  with check (tenant_id = public.tenant_id() and public.user_role() <> 'read_only');

drop policy if exists "templates: tenant isolation delete" on templates;
create policy "templates: tenant isolation delete"
  on templates for delete
  using (tenant_id = public.tenant_id() and public.user_role() <> 'read_only');

-- ────────────────────────────────────────
-- NOTE: catalog_items, orders, order_line_items, rental_extensions,
-- feedback, imports, expenses, calendar integrations, sms triggers,
-- job photos, quote signatures and other later tenant-owned tables
-- follow the identical "tenant_id: tenant isolation <action>" policy
-- naming/shape (see 00005, 00007, 00011+) and should have their
-- insert/update/delete policies extended with the same
-- "and public.user_role() <> 'read_only'" clause in a follow-up
-- migration before read_only is considered fully enforced across
-- every surface. Scoped here to the four core CRM tables
-- (contacts, interactions, events, templates) as the reference
-- implementation.
-- ============================================================
