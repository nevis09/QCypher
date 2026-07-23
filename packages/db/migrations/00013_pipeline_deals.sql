-- Phase 13: Real deal-based pipeline
-- Replaces the contact-status kanban with a proper pipeline_stages + pipeline_deals model.

create table pipeline_stages (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references tenants(id) on delete cascade,
  name       text not null,
  position   int not null default 0,
  color      text not null default '#6366f1',
  created_at timestamptz not null default now()
);
alter table pipeline_stages enable row level security;
create policy "tenant_iso_pipeline_stages" on pipeline_stages
  for all using (tenant_id = auth.tenant_id())
  with check (tenant_id = auth.tenant_id());

create table pipeline_deals (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references tenants(id) on delete cascade,
  stage_id   uuid not null references pipeline_stages(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  title      text not null,
  value      numeric(12,2),
  notes      text,
  position   int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table pipeline_deals enable row level security;
create policy "tenant_iso_pipeline_deals" on pipeline_deals
  for all using (tenant_id = auth.tenant_id())
  with check (tenant_id = auth.tenant_id());

-- Seed default stages function (called for new tenants)
create or replace function seed_pipeline_stages(p_tenant_id uuid)
returns void language plpgsql security definer as $$
begin
  insert into pipeline_stages (tenant_id, name, position, color) values
    (p_tenant_id, 'Lead',         0, '#f59e0b'),
    (p_tenant_id, 'Qualified',    1, '#6366f1'),
    (p_tenant_id, 'Proposal',     2, '#0ea5e9'),
    (p_tenant_id, 'Negotiation',  3, '#f97316'),
    (p_tenant_id, 'Won',          4, '#10b981'),
    (p_tenant_id, 'Lost',         5, '#ef4444');
end;
$$;

-- Seed stages for all existing tenants
do $$
declare t record;
begin
  for t in select id from tenants loop
    perform seed_pipeline_stages(t.id);
  end loop;
end;
$$;
