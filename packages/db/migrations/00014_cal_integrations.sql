-- Phase 1 Calendar: Cal.com integration tables
-- tenant_integrations stores encrypted OAuth tokens per provider.
-- cal_bookings caches webhook-delivered booking data for fast reads.

create table if not exists tenant_integrations (
  id               uuid        primary key default gen_random_uuid(),
  tenant_id        uuid        not null references tenants(id) on delete cascade,
  provider         text        not null check (provider in ('cal_com')),
  access_token_enc text,          -- AES-256-GCM encrypted: iv.ciphertext.tag (hex)
  refresh_token_enc text,
  token_expires_at timestamptz,
  cal_user_id      text,          -- Cal.com userId for API calls
  cal_username     text,          -- Cal.com username/slug
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (tenant_id, provider)
);

alter table tenant_integrations enable row level security;

create policy "tenant_own_integrations" on tenant_integrations
  using  (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
  with check (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- cal_bookings: webhook-received cache, one row per Cal.com booking
create table if not exists cal_bookings (
  id                  uuid        primary key default gen_random_uuid(),
  tenant_id           uuid        not null references tenants(id) on delete cascade,
  cal_booking_uid     text        not null,
  contact_id          uuid        references contacts(id),
  title               text,
  description         text,
  starts_at           timestamptz,
  ends_at             timestamptz,
  status              text        not null default 'accepted',
  attendee_name       text,
  attendee_email      text,
  attendee_phone      text,
  cal_event_type_id   int,
  needs_contact_link  boolean     not null default false, -- true = no matching contact found
  raw                 jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (tenant_id, cal_booking_uid)
);

alter table cal_bookings enable row level security;

create policy "tenant_own_cal_bookings" on cal_bookings
  using  (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
  with check (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

create index if not exists cal_bookings_tenant_starts
  on cal_bookings (tenant_id, starts_at);
