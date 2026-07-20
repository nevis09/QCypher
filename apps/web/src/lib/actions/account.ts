'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateBusinessName(name: string) {
  const supabase = await createClient()
  const { data: tenant } = await supabase.from('tenants').select('id').single()
  if (!tenant) throw new Error('Tenant not found')
  const { error } = await supabase.from('tenants').update({ name }).eq('id', tenant.id)
  if (error) throw new Error(error.message)
  revalidatePath('/settings')
  revalidatePath('/orders')
}

export async function updateProfile(data: {
  legal_name?: string
  nickname?: string
  phone?: string
  address?: string
  street?: string
  city?: string
  state?: string
  zip?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('users')
    .upsert({ id: user.id, ...data }, { onConflict: 'id' })

  if (error) throw error
  revalidatePath('/settings')
}

export async function changePassword(password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw error
}

export async function submitFeedback(subject: string, message: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: tenant } = await supabase.from('tenants').select('id').single()
  if (!tenant) throw new Error('Tenant not found')

  const { error } = await supabase
    .from('feedback')
    .insert({ tenant_id: tenant.id, user_id: user.id, subject, message })

  if (error) throw error
}

export async function requestAccountDeactivation() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: tenant } = await supabase.from('tenants').select('id, name').single()
  if (!tenant) throw new Error('Tenant not found')

  // Log the request in feedback table so the team can track it
  await supabase.from('feedback').insert({
    tenant_id: tenant.id,
    user_id:   user.id,
    subject:   'DEACTIVATION_REQUEST',
    message:   `Account deactivation requested by ${user.email} for workspace "${(tenant as { name?: string }).name ?? tenant.id}".`,
  })

  // Notify the team via Resend
  const RESEND_API_KEY  = process.env.RESEND_API_KEY ?? ''
  const RESEND_FROM     = process.env.RESEND_FROM_EMAIL ?? 'noreply@qcyphertech.com'

  if (RESEND_API_KEY) {
    await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:    RESEND_FROM,
        to:      ['hello@qcyphertech.com'],
        subject: `[QCypher CRM] Account Deactivation Request — ${user.email}`,
        html:    `
          <p>A user has requested account deactivation.</p>
          <ul>
            <li><strong>User:</strong> ${user.email}</li>
            <li><strong>Workspace:</strong> ${(tenant as { name?: string }).name ?? tenant.id}</li>
            <li><strong>User ID:</strong> ${user.id}</li>
            <li><strong>Tenant ID:</strong> ${tenant.id}</li>
          </ul>
          <p>The account is <strong>not</strong> automatically deactivated. Review and action manually.</p>
        `,
      }),
    })

    // Confirmation email to the user
    await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:    RESEND_FROM,
        to:      [user.email!],
        subject: 'Your QCypher account deactivation request was received',
        html:    `
          <p>Hi,</p>
          <p>We received your request to deactivate your QCypher CRM account.</p>
          <p>Your account remains active while our team reviews the request. We'll follow up within 1–2 business days to confirm deactivation and provide options for exporting your data.</p>
          <p>If this was a mistake, you don't need to do anything — just reply to this email and we'll disregard the request.</p>
          <br>
          <p>— The QCypher Team<br>hello@qcyphertech.com</p>
        `,
      }),
    })
  }
}

export async function dismissWelcome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('users').update({ has_seen_welcome: true }).eq('id', user.id)
  revalidatePath('/', 'layout')
}
