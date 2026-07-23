import { createClient } from '@supabase/supabase-js'
import type { Database } from '@qcypher/db'

// Server-only. The service role key is never exposed to the browser.
// Only use this in Server Components, Server Actions, and API routes.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}

// Returns the current user's tenant_id, reading from the DB when the JWT is stale.
// The JWT may not carry app_metadata.tenant_id if it was set via Admin API after
// the user's initial OAuth sign-in.
export async function getTenantId(
  userId: string,
  jwtMetadata?: Record<string, unknown> | null,
): Promise<string> {
  const fromJwt = jwtMetadata?.tenant_id as string | undefined
  if (fromJwt) return fromJwt

  const admin = createAdminClient()
  const { data } = await admin.auth.admin.getUserById(userId)
  const id = data?.user?.app_metadata?.tenant_id as string | undefined
  if (!id) throw new Error('No tenant configured for this account')
  return id
}
