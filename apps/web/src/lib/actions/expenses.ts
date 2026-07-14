'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ExpenseInput = {
  date:     string   // ISO date
  category: string
  amount:   number
  note?:    string
}

export async function createExpense(input: ExpenseInput) {
  const supabase = await createClient()
  const { data: tenant } = await supabase.from('tenants').select('id').single()
  if (!tenant) throw new Error('Tenant not found')

  const { error } = await supabase.from('expenses').insert({
    tenant_id: tenant.id,
    date:      input.date,
    category:  input.category,
    amount:    input.amount,
    note:      input.note ?? null,
  })
  if (error) throw error
  revalidatePath('/overview')
  revalidatePath('/overview/expenses')
}

export async function updateExpense(id: string, input: Partial<ExpenseInput>) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('expenses')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
  revalidatePath('/overview')
  revalidatePath('/overview/expenses')
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('expenses')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
  revalidatePath('/overview')
  revalidatePath('/overview/expenses')
}
