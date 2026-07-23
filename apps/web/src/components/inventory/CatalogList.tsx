'use client'

import { useState } from 'react'
import type { CatalogItem } from '@/lib/actions/catalog'
import { deactivateCatalogItem } from '@/lib/actions/catalog'
import { CatalogItemModal } from './CatalogItemModal'
import { Pencil, ToggleLeft, Package, Wrench, Key } from 'lucide-react'

const TYPE_META = {
  good:    { label: 'Good',    icon: Package, bg: 'var(--badge-indigo-bg)', color: 'var(--badge-indigo-text)' },
  service: { label: 'Service', icon: Wrench,  bg: 'var(--badge-active-bg)', color: 'var(--badge-active-text)' },
  rental:  { label: 'Rental',  icon: Key,     bg: 'var(--badge-amber-bg)', color: 'var(--badge-amber-text)' },
}

const UNIT_LABELS: Record<string, string> = {
  flat: 'flat', hourly: '/hr', daily: '/day', weekly: '/wk', monthly: '/mo',
}

export function CatalogList({ items }: { items: CatalogItem[] }) {
  const [editItem, setEditItem] = useState<CatalogItem | null>(null)
  const [filter, setFilter] = useState<'all' | 'good' | 'service' | 'rental'>('all')

  const filters: Array<{ key: typeof filter; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'good', label: 'Goods' },
    { key: 'service', label: 'Services' },
    { key: 'rental', label: 'Rentals' },
  ]

  const visible = items.filter(i => filter === 'all' || i.item_type === filter)
  const active   = visible.filter(i => i.is_active)
  const inactive = visible.filter(i => !i.is_active)

  return (
    <>
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="px-4 py-1.5 rounded-xl text-[15px] font-semibold transition-all"
            style={{
              background: filter === f.key ? '#2a52a0' : 'hsl(var(--muted))',
              color: filter === f.key ? '#fff' : 'hsl(var(--muted-foreground))',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ background: 'hsl(var(--muted))', borderBottom: '1px solid hsl(var(--border))' }}>
              {['Name', 'Type', 'Price', 'Status', ''].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[15px] font-bold uppercase tracking-wide"
                  style={{ color: 'hsl(var(--muted-foreground))' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {active.map(item => <CatalogRow key={item.id} item={item} onEdit={() => setEditItem(item)} />)}
            {inactive.length > 0 && (
              <>
                <tr>
                  <td colSpan={5} className="px-5 py-2 text-[15px] font-bold uppercase tracking-wide"
                    style={{ color: 'hsl(var(--muted-foreground))', background: 'hsl(var(--muted))' }}>
                    Inactive
                  </td>
                </tr>
                {inactive.map(item => <CatalogRow key={item.id} item={item} onEdit={() => setEditItem(item)} />)}
              </>
            )}
          </tbody>
        </table>
        </div>
        {visible.length === 0 && (
          <p className="text-center py-10 text-[15px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
            No items in this category
          </p>
        )}
      </div>

      {editItem && (
        <CatalogItemModal item={editItem} onClose={() => setEditItem(null)} />
      )}
    </>
  )
}

function CatalogRow({ item, onEdit }: { item: CatalogItem; onEdit: () => void }) {
  const { label, icon: Icon, bg, color } = TYPE_META[item.item_type]
  return (
    <tr
      className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))] transition-colors"
      style={{ opacity: item.is_active ? 1 : 0.5 }}
    >
      <td className="px-5 py-3.5">
        <p className="text-[15px] font-bold" style={{ color: 'hsl(var(--foreground))' }}>{item.name}</p>
        {item.description && (
          <p className="text-[15px] mt-0.5 truncate max-w-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {item.description}
          </p>
        )}
      </td>
      <td className="px-5 py-3.5">
        <span className="inline-flex items-center gap-1.5 text-[15px] font-bold px-2.5 py-1 rounded-full"
          style={{ background: bg, color }}>
          <Icon className="w-3 h-3" />
          {label}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-[15px] font-bold" style={{ color: 'hsl(var(--foreground))' }}>
          ${Number(item.base_price).toFixed(2)}
        </span>
        <span className="text-[15px] ml-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {UNIT_LABELS[item.billing_unit]}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-[15px] font-bold px-2 py-0.5 rounded-full"
          style={{
            background: item.is_active ? 'var(--badge-green-bg)' : 'var(--badge-inactive-bg)',
            color: item.is_active ? 'var(--badge-green-text)' : 'var(--badge-inactive-text)',
          }}>
          {item.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2 justify-end">
          <button onClick={onEdit}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-indigo-50 transition-colors">
            <Pencil className="w-3.5 h-3.5" style={{ color: '#2a52a0' }} />
          </button>
          {item.is_active && (
            <form action={deactivateCatalogItem.bind(null, item.id)}>
              <button type="submit"
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-amber-50 transition-colors"
                title="Deactivate">
                <ToggleLeft className="w-3.5 h-3.5" style={{ color: '#d97706' }} />
              </button>
            </form>
          )}
        </div>
      </td>
    </tr>
  )
}
