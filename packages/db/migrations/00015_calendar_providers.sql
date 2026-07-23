-- Expand tenant_integrations to support google_calendar and outlook providers.
-- Drop and recreate the check constraint (ALTER TABLE ... DROP CONSTRAINT is the portable way).

alter table tenant_integrations
  drop constraint if exists tenant_integrations_provider_check;

alter table tenant_integrations
  add constraint tenant_integrations_provider_check
    check (provider in ('cal_com', 'google_calendar', 'outlook'));

-- google_calendar_events: cache of fetched Google Calendar events per tenant.
create table if not exists google_calendar_events (
  id           uuid        primary key default gen_random_uuid(),
  tenant_id    uuid        not null references tenants(id) on delete cascade,
  gcal_id      text        not null,          -- Google event id
  title        text,
  description  text,
  starts_at    timestamptz,
  ends_at      timestamptz,
  all_day      boolean     not null default false,
  status       text,                          -- confirmed / cancelled / tentative
  fetched_at   timestamptz not null default now(),
  unique (tenant_id, gcal_id)
);
alter table google_calendar_events enable row level security;
create policy "tenant_own_gcal_events" on google_calendar_events
  using  (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
  with check (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

create index if not exists gcal_events_tenant_starts
  on google_calendar_events (tenant_id, starts_at);
