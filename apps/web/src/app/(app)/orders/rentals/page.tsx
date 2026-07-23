import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarClock } from 'lucide-react'

export const metadata: Metadata = { title: 'Active Rentals' }

const RENTAL_STYLE: Record<string, { bg: string; color: string }> = {
  reserved: { bg: 'var(--badge-violet-bg)',   color: 'var(--badge-violet-text)'   },
  active:   { bg: 'var(--badge-active-bg)',   color: 'var(--badge-active-text)'   },
  returned: { bg: 'var(--badge-inactive-bg)', color: 'var(--badge-inactive-text)' },
  overdue:  { bg: 'var(--badge-red-bg)',      color: 'var(--badge-red-text)'      },
}

export default async function RentalsPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: lines } = await supabase
    .from('order_line_items')
    .select('*, order:orders(id, customer_id, contact:contacts(first_name, last_name))')
    .not('rental_status', 'is', null)
    .neq('rental_status', 'returned')
    .order('rental_end_date')

  const enriched = (lines ?? []).map(line => ({
    ...line,
    effectiveStatus: (line.rental_status !== 'returned' && line.rental_end_date && line.rental_end_date < today)
      ? 'overdue'
      : line.rental_status,
  }))

  const overdue = enriched.filter(l => l.effectiveStatus === 'overdue')
  const active  = enriched.filter(l => l.effectiveStatus === 'active')
  const reserved = enriched.filter(l => l.effectiveStatus === 'reserved')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black" style={{ color: 'var(--heading)' }}>Active Rentals</h1>
        <p className="text-[15px] mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Track all rentals in progress
        </p>
      </div>

      {enriched.length === 0 ? (
        <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-16 flex flex-col items-center gap-3 text-center">
          <CalendarClock className="w-10 h-10" style={{ color: 'hsl(var(--muted-foreground))' }} />
          <p className="text-base font-bold" style={{ color: 'hsl(var(--foreground))' }}>No active rentals</p>
        </div>
      ) : (
        <>
          {overdue.length > 0 && <RentalSection title="Overdue" items={overdue} />}
          {active.length > 0  && <RentalSection title="Active"  items={active}  />}
          {reserved.length > 0 && <RentalSection title="Reserved" items={reserved} />}
        </>
      )}
    </div>
  )
}

type RentalLine = {
  id: string
  item_name_snapshot: string
  rental_start_date: string | null
  rental_end_date: string | null
  effectiveStatus: string
  order: { id: string; contact: { first_name: string; last_name: string | null } | null } | null
}

function RentalSection({ title, items }: { title: string; items: RentalLine[] }) {
  const s = RENTAL_STYLE[title.toLowerCase()] ?? RENTAL_STYLE.active
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[15px] font-bold px-2.5 py-1 rounded-full" style={s}>{title}</span>
        <span className="text-[15px] font-semibold" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {items.length} rental{items.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ background: 'hsl(var(--muted))', borderBottom: '1px solid hsl(var(--border))' }}>
              {['Item', 'Customer', 'Start', 'End / Due', 'Order'].map(h => (
                <th key={h} className="px-5 py-2.5 text-left text-[15px] font-bold uppercase tracking-wide"
                  style={{ color: 'hsl(var(--muted-foreground))' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(line => {
              const contact = line.order?.contact
              return (
                <tr key={line.id}
                  className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))] transition-colors">
                  <td className="px-5 py-3.5 text-[15px] font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                    {line.item_name_snapshot}
                  </td>
                  <td className="px-5 py-3.5 text-[15px]" style={{ color: 'hsl(var(--foreground))' }}>
                    {contact ? `${contact.first_name} ${contact.last_name ?? ''}`.trim() : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-[15px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {line.rental_start_date ?? '—'}
                  </td>
                  <td className="px-5 py-3.5 text-[15px] font-semibold"
                    style={{ color: title === 'Overdue' ? '#dc2626' : 'hsl(var(--foreground))' }}>
                    {line.rental_end_date ?? '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    {line.order && (
                      <Link href={`/orders/${line.order.id}`}
                        className="text-[15px] font-bold text-[#1a3070] hover:underline">
                        View →
                      </Link>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
