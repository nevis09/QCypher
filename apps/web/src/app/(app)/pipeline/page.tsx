import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { PipelineBoard } from '@/components/pipeline/PipelineBoard'

export const metadata: Metadata = { title: 'Pipeline' }

export default async function PipelinePage() {
  const supabase = await createClient()

  const { data: contacts } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, email, phone, company, tags, status, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-5 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Pipeline</h1>
          <p className="text-[15px] text-[hsl(var(--muted-foreground))] mt-0.5">Track your contacts through the sales stages</p>
        </div>
      </div>
      <PipelineBoard contacts={contacts ?? []} />
    </div>
  )
}
