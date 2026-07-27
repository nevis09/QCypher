'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { sendPortalMagicLink } from '@/lib/actions/portal'

export function SendPortalLinkButton({
  contactId,
  tenantId,
  tenantSlug,
  businessName,
  hasEmail,
}: {
  contactId: string
  tenantId: string
  tenantSlug: string
  businessName: string
  hasEmail: boolean
}) {
  const [state, setState] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')

  async function handleSend() {
    if (!hasEmail) return
    setState('loading')
    const result = await sendPortalMagicLink({ contactId, tenantId, tenantSlug, businessName })
    setState(result.ok ? 'sent' : 'error')
    if (result.ok) setTimeout(() => setState('idle'), 3000)
  }

  if (!hasEmail) return null

  return (
    <button
      onClick={handleSend}
      disabled={state === 'loading'}
      title="Send client portal link"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-medium border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-accent hover:border-accent transition-colors disabled:opacity-50"
    >
      <ExternalLink className="w-3.5 h-3.5" />
      {state === 'loading' ? 'Sending…' : state === 'sent' ? 'Link sent!' : state === 'error' ? 'Failed' : 'Send portal link'}
    </button>
  )
}
