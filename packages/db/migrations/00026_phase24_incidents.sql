-- Phase 24: Incident Response — incidents table
create table if not exists incidents (
  id                    uuid primary key default gen_random_uuid(),
  tenant_id             uuid references tenants(id),
  incident_type         text not null, -- 'unauthorized_access' | 'breach_attempt' | 'data_exposure' | 'system_anomaly'
  severity              text not null default 'low', -- 'low' | 'medium' | 'high' | 'critical'
  detected_at           timestamptz not null default now(),
  detected_by           text not null default 'automated_cron', -- 'automated_cron' | 'manual_report'
  description           text,
  status                text not null default 'detected', -- 'detected' | 'investigating' | 'confirmed' | 'resolved'
  timeline              jsonb not null default '{}',
  root_cause            text,
  remediation           text,
  customers_notified    boolean not null default false,
  notification_sent_at  timestamptz,
  root_cause_summary    text,
  summary_sent_at       timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists incidents_detected_idx on incidents (detected_at desc);
create index if not exists incidents_status_detected_idx on incidents (status, detected_at desc);
create index if not exists incidents_tenant_idx on incidents (tenant_id, detected_at desc);

alter table incidents enable row level security;

-- Super admin: full access. Tenant admin: read-only visibility into
-- incidents scoped to their own tenant (never system-wide ones).
drop policy if exists "incidents: super admin full access" on incidents;
create policy "incidents: super admin full access"
  on incidents for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists "incidents: tenant admin read own" on incidents;
create policy "incidents: tenant admin read own"
  on incidents for select
  using (tenant_id = public.tenant_id() and public.user_role() = 'owner');
