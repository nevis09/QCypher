'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient, getTenantId } from '@/lib/supabase/admin'
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

// Verifies the caller is authenticated and resolves their tenant_id from the DB.
// Using the admin client for tenant_id ensures we always get the current value
// even when the user's JWT was issued before app_metadata.tenant_id was set.
async function getAuthedTenant() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const tenant_id = await getTenantId(user.id, user.app_metadata)
  const admin = createAdminClient()
  return { admin, user, tenant_id }
}

export async function getCatalogItems() {
  const { admin, tenant_id } = await getAuthedTenant()
  const { data, error } = await admin
    .from('catalog_items')
    .select('*')
    .eq('tenant_id', tenant_id)
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
  try {
    const { admin, tenant_id } = await getAuthedTenant()
    const { error } = await admin.from('catalog_items').insert({ ...input, tenant_id })
    if (error) throw new Error(error.message ?? 'Failed to create item')
    revalidatePath('/inventory')
  } catch (e) {
    console.error('[createCatalogItem]', e)
    throw e
  }
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
  try {
    const { admin, tenant_id } = await getAuthedTenant()
    const { error } = await admin
      .from('catalog_items')
      .update(input)
      .eq('id', id)
      .eq('tenant_id', tenant_id)
    if (error) throw new Error(error.message ?? 'Failed to update item')
    revalidatePath('/inventory')
  } catch (e) {
    console.error('[updateCatalogItem]', e)
    throw e
  }
}

export async function deactivateCatalogItem(id: string) {
  return updateCatalogItem(id, { is_active: false })
}
