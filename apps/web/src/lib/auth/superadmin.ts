// Phase 21 Revised — super admin is a hardcoded email allowlist layered on
// top of the existing tenant-level role system (see lib/actions/team.ts),
// not a database row. Mirrors the SQL helper public.is_super_admin() in
// supabase/migrations/20260807000000_phase21r_super_admin.sql — keep both
// lists in sync if this ever changes.
export const SUPER_ADMIN_EMAILS = ['nevis09@gmail.com', 'qcyphertech@gmail.com'] as const

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return (SUPER_ADMIN_EMAILS as readonly string[]).includes(email.toLowerCase())
}
