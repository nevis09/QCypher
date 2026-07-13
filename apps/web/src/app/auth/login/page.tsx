import { LoginForm } from '@/components/auth/LoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Sign in' }

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[hsl(var(--muted))] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">QCypher CRM</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Sign in to your workspace</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
