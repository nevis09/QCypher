-- When app_metadata.tenant_id is set via Admin API after an OAuth sign-in,
-- the user's existing JWT doesn't carry it (it was minted before the update).
-- Replace auth.tenant_id() so it falls back to auth.users when the JWT claim
-- is absent — all downstream RLS policies pick this up automatically.

CREATE OR REPLACE FUNCTION auth.tenant_id() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    nullif((auth.jwt() -> 'app_metadata' ->> 'tenant_id'), '')::uuid,
    (SELECT (app_metadata ->> 'tenant_id')::uuid
     FROM auth.users
     WHERE id = auth.uid())
  );
$$;
