import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { CatalogList } from '@/components/catalog/CatalogList'
import { NewCatalogItemButton } from '@/components/catalog/NewCatalogItemButton'
import { Package } from 'lucide-react'

export const metadata: Metadata = { title: 'Catalog' }

export default async function CatalogPage() {
  const supabase = await createClient()
  const { data: items } = await supabase
    .from('catalog_items')
    .select('*')
    .order('name')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'hsl(var(--foreground))' }}>Catalog</h1>
          <p className="text-[15px] mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Goods, services & rentals you offer
          </p>
        </div>
        <NewCatalogItemButton />
      </div>

      {(!items || items.length === 0) ? (
        <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-16 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
            <Package className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-base font-bold" style={{ color: 'hsl(var(--foreground))' }}>No catalog items yet</p>
            <p className="text-[15px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Add your first good, service, or rental item</p>
          </div>
          <NewCatalogItemButton />
        </div>
      ) : (
        <CatalogList items={items} />
      )}
    </div>
  )
}
