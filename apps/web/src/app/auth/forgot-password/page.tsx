import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import { AuthShell } from '@/components/auth/AuthShell'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Reset password — QCypher CRM' }

export default function ForgotPasswordPage() {
  return (
    <AuthShell subtitle="Reset your password">
      <ForgotPasswordForm />
    </AuthShell>
  )
}
