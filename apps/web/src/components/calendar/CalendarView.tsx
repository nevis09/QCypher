'use client'

import { useState, useCallback } from 'react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays,
  addMonths, subMonths, isSameMonth, isSameDay, isToday, format, parseISO,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EventModal } from './EventModal'
import type { Tables } from '@/types/database'

type CalEvent = Pick<Tables<'events'>, 'id' | 'title' | 'description' | 'starts_at' | 'ends_at' | 'contact_id'>

function buildWeeks(month: Date): Date[][] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 })
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 })
  const weeks: Date[][] = []
  let day = start
  while (day <= end) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) { week.push(day); day = addDays(day, 1) }
    weeks.push(week)
  }
  return weeks
}

export function CalendarView({ events }: { events: CalEvent[] }) {
  const [month, setMonth] = useState(() => new Date())
  const [modal, setModal] = useState<{ date?: Date; event?: CalEvent } | null>(null)

  const eventsOnDay = useCallback((day: Date) =>
    events.filter(e => isSameDay(parseISO(e.starts_at), day)),
    [events],
  )

  const weeks = buildWeeks(month)

  return (
    <>
      <div className="bg-white dark:bg-[hsl(var(--muted))] rounded-2xl border border-[hsl(var(--border))] shadow-soft overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[hsl(var(--border))]">
          <button onClick={() => setMonth(m => subMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold">{format(month, 'MMMM yyyy')}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setMonth(new Date())} className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] px-2 py-1 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">Today</button>
            <button onClick={() => setMonth(m => addMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[hsl(var(--border))]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-medium text-[hsl(var(--muted-foreground))] py-2">{d}</div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-[hsl(var(--border))] last:border-0">
            {week.map((day, di) => {
              const dayEvents = eventsOnDay(day)
              const inMonth = isSameMonth(day, month)
              const today = isToday(day)
              return (
                <div
                  key={di}
                  onClick={() => setModal({ date: day })}
                  className={cn(
                    'min-h-[90px] p-2 border-r border-[hsl(var(--border))] last:border-0 cursor-pointer hover:bg-[hsl(var(--muted))]/50 transition-colors',
                    !inMonth && 'opacity-40',
                  )}
                >
                  <span className={cn(
                    'text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full',
                    today ? 'bg-accent text-white' : 'text-[hsl(var(--foreground))]',
                  )}>
                    {format(day, 'd')}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 3).map(ev => (
                      <button
                        key={ev.id}
                        onClick={e => { e.stopPropagation(); setModal({ event: ev }) }}
                        className="w-full text-left text-xs bg-accent/10 text-accent rounded-md px-1.5 py-0.5 truncate hover:bg-accent/20 transition-colors"
                      >
                        {ev.title}
                      </button>
                    ))}
                    {dayEvents.length > 3 && (
                      <p className="text-xs text-[hsl(var(--muted-foreground))] pl-1">+{dayEvents.length - 3} more</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Add event FAB */}
      <button
        onClick={() => setModal({ date: new Date() })}
        className="fixed bottom-6 right-6 bg-accent text-white rounded-2xl shadow-card px-4 py-2.5 flex items-center gap-2 text-sm font-medium hover:bg-accent-hover transition-colors"
      >
        <Plus className="w-4 h-4" />
        New event
      </button>

      {modal && (
        <EventModal
          date={modal.date}
          event={modal.event}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}
