-- Soft-delete support for the approved "delete_account" request type.
alter table tenants add column if not exists deleted_at timestamptz;
