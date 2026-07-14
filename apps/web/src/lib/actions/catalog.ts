'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type CatalogItem = {
  id: string
  tenant_id: string
  name: string
  description: string | null
  item_type: 'good' | 'service' | 'rental'
  base_price: number
  billing_unit: 'flat' | 'hourly' | 'daily' | 'weekly' | 'monthly'
  is_active: boolean
  taxable: boolean
  requires_deposit: boolean
  deposit_amount: number | null
  created_at: string
  updated_at: string
}

export async function getCatalogItems() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('catalog_items')
    .select('*')
    .order('name')
  if (error) throw error
  return data as CatalogItem[]
}

export async function createCatalogItem(input: {
  name: string
  description?: string
  item_type: 'good' | 'service' | 'rental'
  base_price: number
  billing_unit: 'flat' | 'hourly' | 'daily' | 'weekly' | 'monthly'
  taxable?: boolean
  requires_deposit?: boolean
  deposit_amount?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const tenant_id = user.app_metadata?.tenant_id
  if (!tenant_id) throw new Error('No tenant')

  const { error } = await supabase.from('catalog_items').insert({ ...input, tenant_id })
  if (error) throw new Error(error.message ?? 'Failed to create item')
  revalidatePath('/catalog')
}

export async function updateCatalogItem(id: string, input: Partial<{
  name: string
  description: string
  item_type: 'good' | 'service' | 'rental'
  base_price: number
  billing_unit: 'flat' | 'hourly' | 'daily' | 'weekly' | 'monthly'
  is_active: boolean
  taxable: boolean
  requires_deposit: boolean
  deposit_amount: number
}>) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('catalog_items')
    .update(input)
    .eq('id', id)
  if (error) throw new Error(error.message ?? 'Failed to update item')
  revalidatePath('/catalog')
}

export async function deactivateCatalogItem(id: string) {
  return updateCatalogItem(id, { is_active: false })
}
