// Phase 21 Revised — super admin status lives in app_metadata.is_super_admin
// (same storage pattern as tenant_id/role, see lib/actions/team.ts), NOT a
// hardcoded list in code. The only hardcoded list in the whole system is in
// scripts/seed-super-admins.ts, a one-time provisioning script — granting or
// revoking super admin status afterward is a data change (re-run that
// script, or flip the flag directly), not a code deploy.
//
// Mirrors the SQL helper public.is_super_admin(), which reads the same flag
// off the JWT's app_metadata claim.
export function isSuperAdminUser(user: { app_metadata?: Record<string, unknown> | null } | null | undefined): boolean {
  return user?.app_metadata?.is_super_admin === true
}
