-- auth.tenant_id() cannot be created via SQL editor (postgres role lacks auth schema write access).
-- All RLS policies in this project use the inline JWT check directly:
--   (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
-- so this function is not required. Migration is a no-op to unblock supabase db push.
SELECT 1;
