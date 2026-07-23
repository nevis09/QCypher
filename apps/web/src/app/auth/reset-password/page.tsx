import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import { AuthShell } from '@/components/auth/AuthShell'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Set new password — QCypher CRM' }

export default function ResetPasswordPage() {
  return (
    <AuthShell subtitle="Set a new password">
      <ResetPasswordForm />
    </AuthShell>
  )
}
