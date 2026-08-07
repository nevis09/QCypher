import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { AuthShell } from '@/components/auth/AuthShell'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Sign in — QCypher CRM' }

export default function LoginPage() {
  return (
    <AuthShell subtitle="Sign in to your workspace">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}
