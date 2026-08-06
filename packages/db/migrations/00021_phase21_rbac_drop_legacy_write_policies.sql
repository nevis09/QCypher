-- ============================================================
-- Migration: Phase 21 RBAC follow-up — remove legacy duplicate
-- write policies that were silently bypassing read-only RLS.
--
-- Discovered via live QA: contacts/interactions/events/templates
-- each carry TWO permissive policies per write action — our new
-- "<table>: tenant isolation <action>" ones (checking role) and
-- an older, undocumented "tenant_<table>_<action>" set (via a
-- different get_tenant_id() function, no role check at all).
-- Postgres OR's permissive policies together, so satisfying
-- EITHER was enough — meaning the old set let read_only users
-- write anyway, regardless of the new policy.
--
-- These old policies exist in the live database only — they
-- were never captured in any tracked migration file (same
-- undocumented-schema-drift pattern as the missing `users` table
-- migration and the auth.tenant_id() vs public.tenant_id()
-- mismatch found earlier in this phase). This migration is the
-- first record of them anywhere in version control.
--
-- Only WRITE policies (insert/update/delete) are dropped here.
-- The old "tenant_<table>_select" policies are left in place —
-- read-only users are supposed to read, so there's no security
-- reason to touch select, and leaving them avoids any risk of
-- a behavioral difference between get_tenant_id() and
-- public.tenant_id() affecting read access.
-- ============================================================

drop policy if exists "tenant_contacts_insert" on contacts;
drop policy if exists "tenant_contacts_update" on contacts;
drop policy if exists "tenant_contacts_delete" on contacts;

drop policy if exists "tenant_interactions_insert" on interactions;
drop policy if exists "tenant_interactions_update" on interactions;
drop policy if exists "tenant_interactions_delete" on interactions;

drop policy if exists "tenant_events_insert" on events;
drop policy if exists "tenant_events_update" on events;
drop policy if exists "tenant_events_delete" on events;

drop policy if exists "tenant_templates_insert" on templates;
drop policy if exists "tenant_templates_update" on templates;
drop policy if exists "tenant_templates_delete" on templates;
