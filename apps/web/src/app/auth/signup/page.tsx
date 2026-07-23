import { SignupForm } from '@/components/auth/SignupForm'
import { AuthShell } from '@/components/auth/AuthShell'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Create account — QCypher CRM' }

export default function SignupPage() {
  return (
    <AuthShell subtitle="Create your workspace">
      <SignupForm />
    </AuthShell>
  )
}
