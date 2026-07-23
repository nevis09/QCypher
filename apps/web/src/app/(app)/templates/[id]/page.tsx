import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TemplateForm } from '@/components/templates/TemplateForm'
import type { Metadata } from 'next'

type Props = { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: 'Edit template' }

export default async function EditTemplatePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: template } = await supabase.from('templates').select('*').eq('id', id).single()
  if (!template) notFound()

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-black">Edit template</h1>
      <TemplateForm template={template} />
    </div>
  )
}
