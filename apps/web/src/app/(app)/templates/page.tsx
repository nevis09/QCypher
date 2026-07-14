import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { TemplateList } from '@/components/templates/TemplateList'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Templates' }

export default async function TemplatesPage() {
  const supabase = await createClient()
  const { data: templates } = await supabase
    .from('templates')
    .select('*')
    .order('name', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Templates</h1>
          <p className="text-[15px] text-[hsl(var(--muted-foreground))] mt-0.5">Quick-reply snippets for email and SMS</p>
        </div>
        <Link href="/templates/new" className="bg-accent text-white text-[15px] font-medium px-4 py-2 rounded-xl hover:bg-accent-hover transition-colors">
          New template
        </Link>
      </div>
      <TemplateList templates={templates ?? []} />
    </div>
  )
}
