-- Phase 10: Starter template library
-- Adds soft-delete + is_marketing to templates, seeds starter set via trigger.

-- ── Schema additions ────────────────────────────────────────────────────────

alter table templates
  add column if not exists deleted_at   timestamptz,
  add column if not exists is_marketing boolean not null default false;

-- ── RLS: update select to exclude soft-deleted rows ─────────────────────────

drop policy if exists "tenant_templates_select" on templates;
create policy "tenant_templates_select" on templates
  for select using (
    (tenant_id::text) = (auth.jwt() ->> 'tenant_id')
    and deleted_at is null
  );

drop policy if exists "tenant_templates_insert" on templates;
create policy "tenant_templates_insert" on templates
  for insert with check ((tenant_id::text) = (auth.jwt() ->> 'tenant_id'));

drop policy if exists "tenant_templates_update" on templates;
create policy "tenant_templates_update" on templates
  for update using ((tenant_id::text) = (auth.jwt() ->> 'tenant_id'));

-- ── Seed function ────────────────────────────────────────────────────────────
-- Called by the trigger below on new tenant creation, and can be called
-- manually for existing tenants via: select seed_starter_templates('<uuid>');

create or replace function seed_starter_templates(p_tenant_id uuid)
returns void language plpgsql security definer as $$
begin
  insert into templates (tenant_id, name, channel, subject, body, is_marketing) values

  -- ── Lead & Inquiry ──────────────────────────────────────────────────────
  (p_tenant_id, 'New inquiry response',  'sms',   null,
   'Hi {{first_name}}, thanks for reaching out to {{business_name}}! We''ll get back to you shortly.',
   false),

  (p_tenant_id, 'Missed call follow-up', 'sms',   null,
   'Hi {{first_name}}, sorry we missed your call! How can {{business_name}} help?',
   false),

  (p_tenant_id, 'Quote sent',            'email', 'Your quote from {{business_name}}',
   'Hi {{first_name}}, thanks for your interest. Attached is your quote for the requested service. Let us know if you have any questions!',
   false),

  -- ── Booking & Scheduling ─────────────────────────────────────────────────
  (p_tenant_id, 'Booking confirmation',  'sms',   null,
   'You''re booked with {{business_name}} on {{appointment_date}}. See you then!',
   false),

  (p_tenant_id, 'Appointment reminder',  'sms',   null,
   'Reminder: your appointment with {{business_name}} is coming up on {{appointment_date}}.',
   false),

  (p_tenant_id, 'Reschedule request',    'sms',   null,
   'Hi {{first_name}}, something''s come up — could we find a new time for your {{appointment_date}} appointment?',
   false),

  (p_tenant_id, 'Cancellation confirmation', 'sms', null,
   'Your appointment on {{appointment_date}} has been canceled. Let us know if you''d like to rebook.',
   false),

  -- ── Service / Fulfillment ────────────────────────────────────────────────
  (p_tenant_id, 'On our way',               'sms', null,
   'Hi {{first_name}}, your {{business_name}} technician is on the way!',
   false),

  (p_tenant_id, 'Job complete',             'sms', null,
   'All done, {{first_name}}! Thanks for choosing {{business_name}}. Let us know if you have any questions.',
   false),

  (p_tenant_id, 'Order ready for pickup',   'sms', null,
   'Hi {{first_name}}, your order is ready for pickup at {{business_name}}!',
   false),

  (p_tenant_id, 'Rental due back reminder', 'sms', null,
   'Hi {{first_name}}, just a reminder your rental is due back on {{appointment_date}}.',
   false),

  (p_tenant_id, 'Rental overdue notice',    'sms', null,
   'Hi {{first_name}}, checking in — your rental was due back on {{appointment_date}}. Let us know if you need more time.',
   false),

  -- ── Payment ──────────────────────────────────────────────────────────────
  (p_tenant_id, 'Invoice sent',      'email', 'Invoice from {{business_name}}',
   'Hi {{first_name}}, your invoice from {{business_name}} is attached. Total due: {{amount_due}}.',
   false),

  (p_tenant_id, 'Payment reminder',  'sms',   null,
   'Hi {{first_name}}, friendly reminder that {{amount_due}} is due for your recent service with {{business_name}}.',
   false),

  (p_tenant_id, 'Payment received',  'sms',   null,
   'Thanks {{first_name}}! We''ve received your payment of {{amount_due}}.',
   false),

  -- ── Follow-Up & Retention (marketing — require STOP line on SMS sends) ──
  (p_tenant_id, 'Post-service thank you', 'sms', null,
   'Thanks for choosing {{business_name}}, {{first_name}}! We appreciate your business.',
   false),

  (p_tenant_id, 'Review request',    'sms',   null,
   'Hi {{first_name}}, we''d love your feedback! Would you mind leaving us a quick review? [link]',
   true),   -- marketing

  (p_tenant_id, 'Re-engagement',     'email', 'We miss you, {{first_name}}!',
   'Hi {{first_name}}, it''s been a while! Just checking in — let us know if {{business_name}} can help with anything.',
   true),   -- marketing

  (p_tenant_id, 'Referral ask',      'sms',   null,
   'Hi {{first_name}}, know anyone who could use {{business_name}}''s help? We''d appreciate the referral!',
   true),   -- marketing

  -- ── General ──────────────────────────────────────────────────────────────
  (p_tenant_id, 'Service issue response', 'email', 'We want to make this right',
   'Hi {{first_name}}, thank you for letting us know. We take this seriously and want to make it right — [personalize before sending].',
   false),

  (p_tenant_id, 'Seasonal closure notice', 'sms', null,
   'Hi {{first_name}}, {{business_name}} will be closed on [date]. We''ll be back to help on [date].',
   false);
end;
$$;

-- ── Trigger: seed templates on new tenant creation ───────────────────────────

create or replace function _seed_templates_on_tenant_create()
returns trigger language plpgsql security definer as $$
begin
  perform seed_starter_templates(new.id);
  return new;
end;
$$;

drop trigger if exists trg_seed_templates on tenants;
create trigger trg_seed_templates
  after insert on tenants
  for each row execute function _seed_templates_on_tenant_create();
