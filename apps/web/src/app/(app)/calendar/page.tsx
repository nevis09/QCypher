import { createClient } from '@/lib/supabase/server'
import { CalendarView } from '@/components/calendar/CalendarView'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Calendar' }

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: events } = await supabase
    .from('events')
    .select('id, title, description, starts_at, ends_at, contact_id')
    .order('starts_at', { ascending: true })

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Calendar</h1>
      <CalendarView events={events ?? []} />
    </div>
  )
}
