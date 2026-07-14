-- Phase 7: Per-Tenant Feature Toggles
-- Adds a settings JSONB column to tenants for UI module visibility.
-- This is a visibility layer only — RLS and API access are unchanged.

alter table tenants
  add column if not exists settings jsonb not null default '{
    "show_pipeline":  true,
    "show_calendar":  true,
    "show_templates": true,
    "show_catalog":   true,
    "show_orders":    true
  }'::jsonb;

comment on column tenants.settings is
  'UI module visibility flags. Toggles hide nav items only — data and RLS are unaffected.';
