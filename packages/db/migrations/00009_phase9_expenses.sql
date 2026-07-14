-- Phase 9: expenses table

create table if not exists expenses (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  date        date not null,
  category    text not null,
  amount      numeric(10,2) not null check (amount > 0),
  note        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create index if not exists expenses_tenant_id_idx on expenses(tenant_id);
create index if not exists expenses_date_idx       on expenses(tenant_id, date);

alter table expenses enable row level security;

create policy "tenant_expenses_select" on expenses
  for select using (
    (tenant_id::text) = (auth.jwt() ->> 'tenant_id')
    and deleted_at is null
  );

create policy "tenant_expenses_insert" on expenses
  for insert with check ((tenant_id::text) = (auth.jwt() ->> 'tenant_id'));

create policy "tenant_expenses_update" on expenses
  for update using ((tenant_id::text) = (auth.jwt() ->> 'tenant_id'));
