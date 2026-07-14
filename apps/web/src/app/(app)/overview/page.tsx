import { createClient } from '@/lib/supabase/server'
import { OverviewClient } from './OverviewClient'

export const metadata = { title: 'Income & Expense Overview' }

export default async function OverviewPage() {
  const supabase = await createClient()

  const [{ data: orders }, { data: expenses }] = await Promise.all([
    supabase
      .from('orders')
      .select('payment_status, total_amount, created_at')
      .eq('payment_status', 'paid'),
    supabase
      .from('expenses')
      .select('date, category, amount')
      .order('date', { ascending: false })
      .limit(500),
  ])

  return (
    <OverviewClient
      orders={(orders as any[]) ?? []}
      expenses={(expenses as any[]) ?? []}
    />
  )
}
