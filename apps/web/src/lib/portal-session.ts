import { cookies } from 'next/headers'
import { validatePortalSession, type PortalSession } from './actions/portal'

export const PORTAL_COOKIE = 'qcypher_portal'

export async function getPortalSession(tenantSlug: string): Promise<PortalSession | null> {
  const store = await cookies()
  const token = store.get(PORTAL_COOKIE)?.value
  if (!token) return null
  return validatePortalSession(token, tenantSlug)
}
