'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ChevronLeft, Plus, Trash2, RotateCcw, CalendarClock, Printer } from 'lucide-react'
import {
  addLineItem, removeLineItem, updateOrderStatus, updateJobStatus, returnRental, extendRental,
  type Order, type OrderLineItem,
} from '@/lib/actions/orders'
import { JobStatusSmsPrompt } from './JobStatusSmsPrompt'
import { JobPhotos } from './JobPhotos'
import type { JobPhoto } from '@/lib/actions/photos'
import { useRouter } from 'next/navigation'

type CatalogItem = { id: string; name: string; base_price: number; billing_unit: string; item_type: string }
type Contact     = { id: string; first_name: string; last_name: string | null }

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  draft:    { bg: 'var(--badge-inactive-bg)', color: 'var(--badge-inactive-text)' },
  pending:  { bg: 'var(--badge-lead-bg)',     color: 'var(--badge-lead-text)'     },
  paid:     { bg: 'var(--badge-green-bg)',    color: 'var(--badge-green-text)'    },
  refunded: { bg: 'var(--badge-red-bg)',      color: 'var(--badge-red-text)'      },
}
const RENTAL_COLORS: Record<string, { bg: string; color: string }> = {
  reserved: { bg: 'var(--badge-violet-bg)',   color: 'var(--badge-violet-text)'   },
  active:   { bg: 'var(--badge-active-bg)',   color: 'var(--badge-active-text)'   },
  returned: { bg: 'var(--badge-inactive-bg)', color: 'var(--badge-inactive-text)' },
  overdue:  { bg: 'var(--badge-red-bg)',      color: 'var(--badge-red-text)'      },
}
const UNIT_LABELS: Record<string, string> = {
  flat: '', hourly: '/hr', daily: '/day', weekly: '/wk', monthly: '/mo',
}

function isOverdue(line: OrderLineItem): boolean {
  if (line.rental_status && line.rental_status !== 'returned' && line.rental_end_date) {
    return new Date(line.rental_end_date) < new Date() && !line.actual_return_date
  }
  return false
}

export function OrderDetail({
  order, lines, catalogItems, contacts, businessName, initialPhotos, tenantId,
}: {
  order: Order
  lines: OrderLineItem[]
  catalogItems: CatalogItem[]
  contacts: Contact[]
  businessName: string
  initialPhotos: JobPhoto[]
  tenantId: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [showAddLine, setShowAddLine] = useState(false)
  const [extendLine, setExtendLine] = useState<OrderLineItem | null>(null)
  const [jobStatus, setJobStatus] = useState<Order['job_status']>(order.job_status)
  const [promptKey, setPromptKey] = useState(0) // remount prompt on each status change

  const contact = order.contact as { id: string; first_name: string; last_name: string | null; email: string | null } | null
  const statusStyle = STATUS_COLORS[order.payment_status] ?? STATUS_COLORS.draft

  function handleStatusChange(status: Order['payment_status']) {
    startTransition(() => updateOrderStatus(order.id, status))
  }

  function handleJobStatusChange(status: Order['job_status']) {
    setJobStatus(status)
    setPromptKey(k => k + 1)
    startTransition(() => updateJobStatus(order.id, status))
  }

  function handleRemoveLine(lineId: string) {
    startTransition(() => removeLineItem(lineId, order.id))
  }

  function handleReturn(lineId: string) {
    startTransition(() => returnRental(lineId, order.id))
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Print-only header */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-header { display: block !important; }
          body { background: white !important; }
        }
        .print-header { display: none; }
      `}</style>
      <div className="print-header" style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #000' }}>
        {businessName && (
          <p style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>{businessName}</p>
        )}
        <p style={{ fontSize: '15px', margin: '4px 0 0', color: '#555' }}>
          Invoice — Order #{order.id.slice(-6).toUpperCase()}
        </p>
        <p style={{ fontSize: '15px', margin: '2px 0 0', color: '#555' }}>
          Date: {new Date(order.created_at).toLocaleDateString()}
          {contact && ` · ${contact.first_name} ${contact.last_name ?? ''}`}
        </p>
      </div>

      {/* Back */}
      <Link href="/orders" className="inline-flex items-center gap-1.5 text-[15px] font-semibold hover:text-[#1a3070] transition-colors no-print"
        style={{ color: 'hsl(var(--muted-foreground))' }}>
        <ChevronLeft className="w-4 h-4" /> Orders
      </Link>

      {/* Header */}
      <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6 no-print">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-black" style={{ color: 'hsl(var(--foreground))' }}>
              Order #{order.id.slice(-6).toUpperCase()}
            </h1>
            {contact && (
              <Link href={`/contacts/${contact.id}`}
                className="text-[15px] font-semibold mt-1 hover:text-[#1a3070] transition-colors"
                style={{ color: 'hsl(var(--muted-foreground))' }}>
                {contact.first_name} {contact.last_name}
              </Link>
            )}
            <p className="text-[15px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Created {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Payment status picker */}
            <select
              value={order.payment_status}
              onChange={e => handleStatusChange(e.target.value as Order['payment_status'])}
              disabled={pending}
              className="text-[15px] font-bold px-3 py-1.5 rounded-xl border cursor-pointer"
              style={{ ...statusStyle, borderColor: 'transparent' }}
            >
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>

            {/* Job status picker */}
            <select
              value={jobStatus ?? ''}
              onChange={e => handleJobStatusChange((e.target.value || null) as Order['job_status'])}
              disabled={pending}
              className="text-[15px] font-semibold px-3 py-1.5 rounded-xl border cursor-pointer"
              style={{
                borderColor: 'hsl(var(--border))',
                background: 'hsl(var(--muted))',
                color: 'hsl(var(--foreground))',
              }}
            >
              <option value="">Job status…</option>
              <option value="en_route">🚗 En route</option>
              <option value="in_progress">🔧 In progress</option>
              <option value="completed">✅ Completed</option>
            </select>

            <button onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[hsl(var(--border))] text-[15px] font-semibold hover:bg-[hsl(var(--muted))] transition-colors"
              style={{ color: 'hsl(var(--muted-foreground))' }}>
              <Printer className="w-3.5 h-3.5" /> Print invoice
            </button>
          </div>
        </div>
      </div>

      {/* One-tap job status SMS prompt */}
      {contact?.id && jobStatus && (
        <div className="no-print">
          <JobStatusSmsPrompt
            key={promptKey}
            status={jobStatus}
            contactId={contact.id}
            contactName={`${contact.first_name} ${contact.last_name ?? ''}`.trim()}
            contactPhone={(contact as any).phone ?? null}
            businessName={businessName}
          />
        </div>
      )}

      {/* Line items */}
      <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-[15px] font-black" style={{ color: 'hsl(var(--foreground))' }}>Line items</h2>
          <button onClick={() => setShowAddLine(true)}
            className="no-print flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[15px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#2a52a0,#4a9db5)' }}>
            <Plus className="w-3.5 h-3.5" /> Add item
          </button>
        </div>

        {lines.length === 0 ? (
          <p className="text-center py-10 text-[15px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
            No items yet — add one above
          </p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'hsl(var(--muted))', borderBottom: '1px solid hsl(var(--border))' }}>
                {['Item', 'Qty', 'Unit price', 'Subtotal', 'Status', ''].map(h => (
                  <th key={h} className="px-5 py-2.5 text-left text-[15px] font-bold uppercase tracking-wide"
                    style={{ color: 'hsl(var(--muted-foreground))' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lines.map(line => {
                const overdue = isOverdue(line)
                const effectiveStatus = overdue && line.rental_status !== 'returned' ? 'overdue' : line.rental_status
                const rs = effectiveStatus ? RENTAL_COLORS[effectiveStatus] : null
                return (
                  <tr key={line.id}
                    className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))] transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-[15px] font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                        {line.item_name_snapshot}
                      </p>
                      {line.description_snapshot && (
                        <p className="text-[15px] mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          {line.description_snapshot}
                        </p>
                      )}
                      {line.rental_start_date && (
                        <p className="text-[15px] mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          {line.rental_start_date} → {line.rental_end_date}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[15px]" style={{ color: 'hsl(var(--foreground))' }}>
                      {Number(line.quantity)}
                    </td>
                    <td className="px-5 py-3.5 text-[15px]" style={{ color: 'hsl(var(--foreground))' }}>
                      ${Number(line.unit_price).toFixed(2)}
                      <span className="text-[15px] ml-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        {UNIT_LABELS[line.billing_unit_snapshot]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[15px] font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                      ${(Number(line.quantity) * Number(line.unit_price)).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5">
                      {rs && (
                        <span className="text-[15px] font-bold px-2 py-0.5 rounded-full capitalize" style={rs}>
                          {effectiveStatus}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        {line.rental_status && line.rental_status !== 'returned' && (
                          <>
                            <button onClick={() => setExtendLine(line)} title="Extend rental"
                              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-violet-50 transition-colors">
                              <CalendarClock className="w-3.5 h-3.5" style={{ color: '#4a9db5' }} />
                            </button>
                            <button onClick={() => handleReturn(line.id)} title="Mark returned"
                              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-green-50 transition-colors">
                              <RotateCcw className="w-3.5 h-3.5" style={{ color: '#059669' }} />
                            </button>
                          </>
                        )}
                        <button onClick={() => handleRemoveLine(line.id)} title="Remove"
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" style={{ color: '#dc2626' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-end px-6 py-4 border-t border-[hsl(var(--border))]">
          <div className="text-right">
            <p className="text-[15px] font-semibold uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>Total</p>
            <p className="text-2xl font-black mt-0.5" style={{ color: 'hsl(var(--foreground))' }}>
              ${Number(order.total_amount).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Job Photos — hidden on print */}
      <div className="no-print">
        <JobPhotos
          orderId={order.id}
          initialPhotos={initialPhotos}
          tenantId={tenantId}
        />
      </div>

      {/* Modals — hidden on print */}
      <div className="no-print">
      {showAddLine && (
        <AddLineModal
          orderId={order.id}
          catalogItems={catalogItems}
          onClose={() => setShowAddLine(false)}
        />
      )}
      {extendLine && (
        <ExtendRentalModal
          line={extendLine}
          orderId={order.id}
          onClose={() => setExtendLine(null)}
        />
      )}
      </div>
    </div>
  )
}

function AddLineModal({ orderId, catalogItems, onClose }: {
  orderId: string; catalogItems: CatalogItem[]; onClose: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [selected, setSelected] = useState<CatalogItem | null>(null)
  const [isRental, setIsRental] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleCatalogSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const item = catalogItems.find(i => i.id === e.target.value) ?? null
    setSelected(item)
    setIsRental(item?.item_type === 'rental')
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      try {
        await addLineItem({
          order_id: orderId,
          catalog_item_id: selected?.id,
          item_name_snapshot: fd.get('name') as string,
          description_snapshot: fd.get('description') as string || undefined,
          quantity: parseFloat(fd.get('quantity') as string) || 1,
          unit_price: parseFloat(fd.get('unit_price') as string) || 0,
          billing_unit_snapshot: (fd.get('billing_unit') as OrderLineItem['billing_unit_snapshot']) ?? 'flat',
          rental_status: isRental ? 'reserved' : undefined,
          rental_start_date: isRental ? (fd.get('rental_start') as string) || undefined : undefined,
          rental_end_date:   isRental ? (fd.get('rental_end')   as string) || undefined : undefined,
        })
        onClose()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-[hsl(var(--card))] rounded-2xl shadow-2xl w-full max-w-md border border-[hsl(var(--border))]">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-base font-black" style={{ color: 'hsl(var(--foreground))' }}>Add line item</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[hsl(var(--muted))]">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[15px] font-bold uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>
              From catalog (optional)
            </label>
            <select onChange={handleCatalogSelect}
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-2 text-[15px]"
              style={{ color: 'hsl(var(--foreground))' }}>
              <option value="">— Custom line item —</option>
              {catalogItems.map(i => (
                <option key={i.id} value={i.id}>{i.name} (${Number(i.base_price).toFixed(2)})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[15px] font-bold uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>Name *</label>
            <input name="name" required defaultValue={selected?.name}
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-2 text-[15px]"
              style={{ color: 'hsl(var(--foreground))' }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[15px] font-bold uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>Qty *</label>
              <input name="quantity" type="number" step="1" min="1" required defaultValue={1}
                className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-2 text-[15px]"
                style={{ color: 'hsl(var(--foreground))' }} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[15px] font-bold uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>Unit price ($) *</label>
              <input name="unit_price" type="number" step="0.01" min="0" required defaultValue={selected?.base_price}
                className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-2 text-[15px]"
                style={{ color: 'hsl(var(--foreground))' }} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[15px] font-bold uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>Billing unit</label>
            <select name="billing_unit" defaultValue={selected?.billing_unit ?? 'flat'}
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-2 text-[15px]"
              style={{ color: 'hsl(var(--foreground))' }}>
              <option value="flat">Flat</option>
              <option value="hourly">Per hour</option>
              <option value="daily">Per day</option>
              <option value="weekly">Per week</option>
              <option value="monthly">Per month</option>
            </select>
          </div>

          {isRental && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[15px] font-bold uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>Start date</label>
                <input name="rental_start" type="date"
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-2 text-[15px]"
                  style={{ color: 'hsl(var(--foreground))' }} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[15px] font-bold uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>End date</label>
                <input name="rental_end" type="date"
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-2 text-[15px]"
                  style={{ color: 'hsl(var(--foreground))' }} />
              </div>
            </div>
          )}

          {error && <p className="text-[15px] text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-[15px] font-semibold"
              style={{ color: 'hsl(var(--muted-foreground))' }}>Cancel</button>
            <button type="submit" disabled={pending}
              className="flex-1 py-2.5 rounded-xl text-[15px] font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#2a52a0,#4a9db5)', opacity: pending ? 0.6 : 1 }}>
              {pending ? 'Adding…' : 'Add item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ExtendRentalModal({ line, orderId, onClose }: {
  line: OrderLineItem; orderId: string; onClose: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const newEnd = fd.get('new_end_date') as string
    setError(null)
    startTransition(async () => {
      try {
        await extendRental({
          line_item_id: line.id,
          order_id: orderId,
          previous_end_date: line.rental_end_date!,
          new_end_date: newEnd,
        })
        onClose()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-[hsl(var(--card))] rounded-2xl shadow-2xl w-full max-w-sm border border-[hsl(var(--border))]">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-base font-black" style={{ color: 'hsl(var(--foreground))' }}>Extend rental</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[hsl(var(--muted))]">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <p className="text-[15px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
            {line.item_name_snapshot}
          </p>
          <p className="text-[15px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Current end date: <strong>{line.rental_end_date}</strong>
          </p>
          <div className="space-y-1.5">
            <label className="text-[15px] font-bold uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>
              New end date *
            </label>
            <input name="new_end_date" type="date" required min={line.rental_end_date ?? undefined}
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-2 text-[15px]"
              style={{ color: 'hsl(var(--foreground))' }} />
          </div>
          {error && <p className="text-[15px] text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-[15px] font-semibold"
              style={{ color: 'hsl(var(--muted-foreground))' }}>Cancel</button>
            <button type="submit" disabled={pending}
              className="flex-1 py-2.5 rounded-xl text-[15px] font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#2a52a0,#4a9db5)', opacity: pending ? 0.6 : 1 }}>
              {pending ? 'Extending…' : 'Extend'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
