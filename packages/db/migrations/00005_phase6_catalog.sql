-- ============================================================
-- Migration 00005: Phase 6 — Goods, Services & Rentals
-- Tenant isolation model: every table has tenant_id NOT NULL,
-- RLS policy: tenant_id = auth.tenant_id(). Composite FKs
-- enforce cross-table tenant consistency at the DB layer.
-- ============================================================

-- ────────────────────────────────────────
-- New enums
-- ────────────────────────────────────────
create type item_type       as enum ('good', 'service', 'rental');
create type billing_unit    as enum ('flat', 'hourly', 'daily', 'weekly', 'monthly');
create type payment_status  as enum ('draft', 'pending', 'paid', 'refunded');
create type rental_status   as enum ('reserved', 'active', 'returned', 'overdue');

-- ────────────────────────────────────────
-- catalog_items
-- ────────────────────────────────────────
create table catalog_items (
  id               uuid    primary key default gen_random_uuid(),
  tenant_id        uuid    not null references tenants(id) on delete cascade,
  name             text    not null,
  description      text,
  item_type        item_type not null,
  base_price       numeric(10,2) not null default 0,
  billing_unit     billing_unit  not null default 'flat',
  is_active        boolean not null default true,
  taxable          boolean not null default false,
  requires_deposit boolean not null default false,
  deposit_amount   numeric(10,2),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  -- Composite unique key so order_line_items can reference (id, tenant_id)
  unique (id, tenant_id)
);

create index catalog_items_tenant_idx on catalog_items(tenant_id);
create index catalog_items_active_idx on catalog_items(tenant_id, is_active);

create trigger catalog_items_updated_at before update on catalog_items
  for each row execute function set_updated_at();

-- ────────────────────────────────────────
-- orders
-- ────────────────────────────────────────
create table orders (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references tenants(id) on delete cascade,
  customer_id    uuid references contacts(id) on delete set null,
  payment_status payment_status not null default 'draft',
  total_amount   numeric(10,2) not null default 0,  -- maintained by trigger
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  -- Composite unique key so order_line_items can reference (id, tenant_id)
  unique (id, tenant_id)
);

create index orders_tenant_idx     on orders(tenant_id);
create index orders_customer_idx   on orders(tenant_id, customer_id);
create index orders_status_idx     on orders(tenant_id, payment_status);

create trigger orders_updated_at before update on orders
  for each row execute function set_updated_at();

-- ────────────────────────────────────────
-- order_line_items
-- ────────────────────────────────────────
create table order_line_items (
  id                   uuid primary key default gen_random_uuid(),
  tenant_id            uuid    not null references tenants(id) on delete cascade,

  -- Composite FK: ensures order belongs to same tenant
  order_id             uuid    not null,
  constraint fk_order_tenant
    foreign key (order_id, tenant_id) references orders(id, tenant_id) on delete cascade,

  -- Composite FK: ensures catalog item belongs to same tenant (nullable = custom line)
  catalog_item_id      uuid,
  constraint fk_catalog_item_tenant
    foreign key (catalog_item_id, tenant_id) references catalog_items(id, tenant_id) on delete set null,

  -- Snapshots at time of order — never join live to catalog
  item_name_snapshot   text    not null,
  description_snapshot text,
  quantity             numeric(10,2) not null default 1,
  unit_price           numeric(10,2) not null,
  billing_unit_snapshot billing_unit not null default 'flat',

  -- Rental-specific (null for goods/services)
  rental_status        rental_status,
  rental_start_date    date,
  rental_end_date      date,
  actual_return_date   date,

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index order_line_items_tenant_idx on order_line_items(tenant_id);
create index order_line_items_order_idx  on order_line_items(tenant_id, order_id);
create index order_line_items_item_idx   on order_line_items(tenant_id, catalog_item_id);
create index order_line_items_rental_idx on order_line_items(tenant_id, rental_status)
  where rental_status is not null;

create trigger order_line_items_updated_at before update on order_line_items
  for each row execute function set_updated_at();

-- ────────────────────────────────────────
-- rental_extensions (audit log)
-- ────────────────────────────────────────
create table rental_extensions (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references tenants(id) on delete cascade,
  order_line_item_id  uuid not null references order_line_items(id) on delete cascade,
  previous_end_date   date not null,
  new_end_date        date not null,
  extended_by         uuid references auth.users(id) on delete set null,
  extended_at         timestamptz not null default now()
);

create index rental_extensions_tenant_idx on rental_extensions(tenant_id);
create index rental_extensions_line_idx   on rental_extensions(tenant_id, order_line_item_id);

-- ────────────────────────────────────────
-- Trigger: recalculate orders.total_amount
-- whenever order_line_items change
-- ────────────────────────────────────────
create or replace function recalculate_order_total()
returns trigger as $$
declare
  v_order_id  uuid;
  v_tenant_id uuid;
begin
  -- Determine which order was affected
  if TG_OP = 'DELETE' then
    v_order_id  := OLD.order_id;
    v_tenant_id := OLD.tenant_id;
  else
    v_order_id  := NEW.order_id;
    v_tenant_id := NEW.tenant_id;
  end if;

  update orders
  set total_amount = coalesce((
    select sum(quantity * unit_price)
    from order_line_items
    where order_id = v_order_id
      and tenant_id = v_tenant_id
  ), 0)
  where id = v_order_id
    and tenant_id = v_tenant_id;

  return null;
end;
$$ language plpgsql security definer;

create trigger order_total_recalc
  after insert or update or delete on order_line_items
  for each row execute function recalculate_order_total();

-- ────────────────────────────────────────
-- RLS: catalog_items
-- ────────────────────────────────────────
alter table catalog_items enable row level security;

create policy "catalog_items: tenant isolation select"
  on catalog_items for select using (tenant_id = auth.tenant_id());

create policy "catalog_items: tenant isolation insert"
  on catalog_items for insert with check (tenant_id = auth.tenant_id());

create policy "catalog_items: tenant isolation update"
  on catalog_items for update
  using (tenant_id = auth.tenant_id())
  with check (tenant_id = auth.tenant_id());

create policy "catalog_items: tenant isolation delete"
  on catalog_items for delete using (tenant_id = auth.tenant_id());

-- ────────────────────────────────────────
-- RLS: orders
-- ────────────────────────────────────────
alter table orders enable row level security;

create policy "orders: tenant isolation select"
  on orders for select using (tenant_id = auth.tenant_id());

create policy "orders: tenant isolation insert"
  on orders for insert with check (tenant_id = auth.tenant_id());

create policy "orders: tenant isolation update"
  on orders for update
  using (tenant_id = auth.tenant_id())
  with check (tenant_id = auth.tenant_id());

create policy "orders: tenant isolation delete"
  on orders for delete using (tenant_id = auth.tenant_id());

-- ────────────────────────────────────────
-- RLS: order_line_items
-- ────────────────────────────────────────
alter table order_line_items enable row level security;

create policy "order_line_items: tenant isolation select"
  on order_line_items for select using (tenant_id = auth.tenant_id());

create policy "order_line_items: tenant isolation insert"
  on order_line_items for insert with check (tenant_id = auth.tenant_id());

create policy "order_line_items: tenant isolation update"
  on order_line_items for update
  using (tenant_id = auth.tenant_id())
  with check (tenant_id = auth.tenant_id());

create policy "order_line_items: tenant isolation delete"
  on order_line_items for delete using (tenant_id = auth.tenant_id());

-- ────────────────────────────────────────
-- RLS: rental_extensions
-- ────────────────────────────────────────
alter table rental_extensions enable row level security;

create policy "rental_extensions: tenant isolation select"
  on rental_extensions for select using (tenant_id = auth.tenant_id());

create policy "rental_extensions: tenant isolation insert"
  on rental_extensions for insert with check (tenant_id = auth.tenant_id());

create policy "rental_extensions: tenant isolation update"
  on rental_extensions for update
  using (tenant_id = auth.tenant_id())
  with check (tenant_id = auth.tenant_id());

create policy "rental_extensions: tenant isolation delete"
  on rental_extensions for delete using (tenant_id = auth.tenant_id());
