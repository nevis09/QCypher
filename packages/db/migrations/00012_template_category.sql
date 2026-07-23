-- Phase 12: Add category to templates for organized display
-- Run in Supabase SQL Editor.

alter table templates
  add column if not exists category text not null default 'General';

-- Backfill starter templates by name
update templates set category = 'Lead & Inquiry'         where name in ('New inquiry response','Missed call follow-up','Quote sent');
update templates set category = 'Booking & Scheduling'   where name in ('Booking confirmation','Appointment reminder','Reschedule request','Cancellation confirmation');
update templates set category = 'Service & Fulfillment'  where name in ('On our way','Job complete','Order ready for pickup','Rental due back reminder','Rental overdue notice');
update templates set category = 'Payment'                where name in ('Invoice sent','Payment reminder','Payment received');
update templates set category = 'Follow-Up & Retention'  where name in ('Post-service thank you','Review request','Re-engagement','Referral ask');
-- "Service issue response" and "Seasonal closure notice" stay as 'General'

-- Update seed function to include category
create or replace function seed_starter_templates(p_tenant_id uuid)
returns void language plpgsql security definer as $$
begin
  insert into templates (tenant_id, name, channel, subject, body, is_marketing, category) values

  -- Lead & Inquiry
  (p_tenant_id, 'New inquiry response',  'sms',   null,
   'Hi {{first_name}}, thanks for reaching out to {{business_name}}! We''ll get back to you shortly.',
   false, 'Lead & Inquiry'),
  (p_tenant_id, 'Missed call follow-up', 'sms',   null,
   'Hi {{first_name}}, sorry we missed your call! How can {{business_name}} help?',
   false, 'Lead & Inquiry'),
  (p_tenant_id, 'Quote sent',            'email', 'Your quote from {{business_name}}',
   'Hi {{first_name}}, thanks for your interest. Attached is your quote for the requested service. Let us know if you have any questions!',
   false, 'Lead & Inquiry'),

  -- Booking & Scheduling
  (p_tenant_id, 'Booking confirmation',      'sms', null,
   'You''re booked with {{business_name}} on {{appointment_date}}. See you then!',
   false, 'Booking & Scheduling'),
  (p_tenant_id, 'Appointment reminder',      'sms', null,
   'Reminder: your appointment with {{business_name}} is coming up on {{appointment_date}}.',
   false, 'Booking & Scheduling'),
  (p_tenant_id, 'Reschedule request',        'sms', null,
   'Hi {{first_name}}, something''s come up — could we find a new time for your {{appointment_date}} appointment?',
   false, 'Booking & Scheduling'),
  (p_tenant_id, 'Cancellation confirmation', 'sms', null,
   'Your appointment on {{appointment_date}} has been canceled. Let us know if you''d like to rebook.',
   false, 'Booking & Scheduling'),

  -- Service & Fulfillment
  (p_tenant_id, 'On our way',               'sms', null,
   'Hi {{first_name}}, your {{business_name}} technician is on the way!',
   false, 'Service & Fulfillment'),
  (p_tenant_id, 'Job complete',             'sms', null,
   'All done, {{first_name}}! Thanks for choosing {{business_name}}. Let us know if you have any questions.',
   false, 'Service & Fulfillment'),
  (p_tenant_id, 'Order ready for pickup',   'sms', null,
   'Hi {{first_name}}, your order is ready for pickup at {{business_name}}!',
   false, 'Service & Fulfillment'),
  (p_tenant_id, 'Rental due back reminder', 'sms', null,
   'Hi {{first_name}}, just a reminder your rental is due back on {{appointment_date}}.',
   false, 'Service & Fulfillment'),
  (p_tenant_id, 'Rental overdue notice',    'sms', null,
   'Hi {{first_name}}, checking in — your rental was due back on {{appointment_date}}. Let us know if you need more time.',
   false, 'Service & Fulfillment'),

  -- Payment
  (p_tenant_id, 'Invoice sent',     'email', 'Invoice from {{business_name}}',
   'Hi {{first_name}}, your invoice from {{business_name}} is attached. Total due: {{amount_due}}.',
   false, 'Payment'),
  (p_tenant_id, 'Payment reminder', 'sms',   null,
   'Hi {{first_name}}, friendly reminder that {{amount_due}} is due for your recent service with {{business_name}}.',
   false, 'Payment'),
  (p_tenant_id, 'Payment received', 'sms',   null,
   'Thanks {{first_name}}! We''ve received your payment of {{amount_due}}.',
   false, 'Payment'),

  -- Follow-Up & Retention
  (p_tenant_id, 'Post-service thank you', 'sms', null,
   'Thanks for choosing {{business_name}}, {{first_name}}! We appreciate your business.',
   false, 'Follow-Up & Retention'),
  (p_tenant_id, 'Review request',    'sms', null,
   'Hi {{first_name}}, we''d love your feedback! Would you mind leaving us a quick review? [link]',
   true,  'Follow-Up & Retention'),
  (p_tenant_id, 'Re-engagement',     'email', 'We miss you, {{first_name}}!',
   'Hi {{first_name}}, it''s been a while! Just checking in — let us know if {{business_name}} can help with anything.',
   true,  'Follow-Up & Retention'),
  (p_tenant_id, 'Referral ask',      'sms', null,
   'Hi {{first_name}}, know anyone who could use {{business_name}}''s help? We''d appreciate the referral!',
   true,  'Follow-Up & Retention'),

  -- General
  (p_tenant_id, 'Service issue response', 'email', 'We want to make this right',
   'Hi {{first_name}}, thank you for letting us know. We take this seriously and want to make it right — [personalize before sending].',
   false, 'General'),
  (p_tenant_id, 'Seasonal closure notice', 'sms', null,
   'Hi {{first_name}}, {{business_name}} will be closed on [date]. We''ll be back to help on [date].',
   false, 'General');
end;
$$;
