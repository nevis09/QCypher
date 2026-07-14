import { FeedbackForm } from '@/components/help/FeedbackForm'
import { BackLink } from '@/components/ui/BackLink'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Share Feedback' }

export default function FeedbackPage() {
  return (
    <div className="max-w-lg space-y-6">
      <BackLink href="/support" label="Help & Support" />
      <div>
        <h1 className="text-2xl font-black" style={{ color: 'hsl(var(--foreground))' }}>Share Feedback</h1>
        <p className="text-[15px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Bugs, ideas, praise — we read every submission.
        </p>
      </div>
      <FeedbackForm />
    </div>
  )
}
