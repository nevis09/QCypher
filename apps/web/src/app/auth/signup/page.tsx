import { SignupForm } from '@/components/auth/SignupForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Create account — QCypher CRM' }

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[hsl(var(--muted))] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">QCypher CRM</h1>
          <p className="text-[15px] text-[hsl(var(--muted-foreground))] mt-1">Create your account</p>
        </div>
        <SignupForm />
      </div>
    </main>
  )
}
