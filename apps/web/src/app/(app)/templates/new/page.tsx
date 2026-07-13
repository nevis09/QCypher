import { TemplateForm } from '@/components/templates/TemplateForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'New template' }

export default function NewTemplatePage() {
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-semibold">New template</h1>
      <TemplateForm />
    </div>
  )
}
