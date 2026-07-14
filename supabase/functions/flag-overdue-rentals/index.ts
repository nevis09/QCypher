/**
 * Edge Function: flag-overdue-rentals
 * Schedule: daily cron (set in supabase/config.toml or Supabase dashboard)
 *
 * Scans for rental line items where rental_end_date < today and
 * actual_return_date IS NULL, then marks them overdue.
 * Does NOT compute amount-owed — that is always derived at read time.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  )

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('order_line_items')
    .update({ rental_status: 'overdue' })
    .lt('rental_end_date', today)
    .is('actual_return_date', null)
    .not('rental_status', 'eq', 'returned')
    .not('rental_status', 'eq', 'overdue')
    .select('id')

  if (error) {
    console.error('flag-overdue-rentals error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  const count = data?.length ?? 0
  console.log(`Flagged ${count} overdue rental(s)`)
  return new Response(JSON.stringify({ flagged: count }), { status: 200 })
})
