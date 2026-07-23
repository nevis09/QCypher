-- ────────────────────────────────────────
-- Phase 11: CSV Contact Import
-- ────────────────────────────────────────

-- imports log table
create table imports (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  filename        text not null,
  imported_count  int  not null default 0,
  skipped_count   int  not null default 0,
  created_at      timestamptz not null default now(),
  created_by      uuid references auth.users(id) on delete set null
);

create index imports_tenant_idx on imports(tenant_id);

alter table imports enable row level security;

create policy "tenant_select_imports" on imports
  for select using ((tenant_id::text) = public.get_tenant_id());

create policy "tenant_insert_imports" on imports
  for insert with check ((tenant_id::text) = public.get_tenant_id());

create policy "tenant_delete_imports" on imports
  for delete using ((tenant_id::text) = public.get_tenant_id());

-- add import provenance to contacts
alter table contacts add column if not exists import_id uuid references imports(id) on delete set null;

create index contacts_import_idx on contacts(import_id) where import_id is not null;
