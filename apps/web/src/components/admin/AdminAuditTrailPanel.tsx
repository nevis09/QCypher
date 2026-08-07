'use client'

import { useEffect, useState, useTransition } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { getAuditLogs, type AuditLog } from '@/lib/actions/audit'
import type { TenantSummary } from '@/lib/actions/admin-console'

const PAGE_SIZE = 25

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function AdminAuditTrailPanel({ tenants }: { tenants: TenantSummary[] }) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [tenantId, setTenantId] = useState('')
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()

  function load() {
    startTransition(async () => {
      const result = await getAuditLogs({ page, pageSize: PAGE_SIZE, tenantId: tenantId || undefined, search: search || undefined })
      setLogs(result.logs)
      setTotal(result.total)
    })
  }

  useEffect(load, [page, tenantId, search])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const selectStyle = 'text-[15px] px-2.5 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] outline-none'

  return (
    <div className="max-w-4xl">
      <div className="flex gap-2 flex-wrap items-center mb-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
          <input
            value={search}
            onChange={e => { setPage(1); setSearch(e.target.value) }}
            placeholder="Search user or resource…"
            className={`${selectStyle} w-full pl-8`}
          />
        </div>
        <select value={tenantId} onChange={e => { setPage(1); setTenantId(e.target.value) }} className={selectStyle}>
          <option value="">All tenants</option>
          {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[15px] border-collapse">
            <thead>
              <tr className="bg-[hsl(var(--muted))]">
                {['Time', 'User', 'Action', 'Resource'].map(h => (
                  <th key={h} className="text-left px-3.5 py-2.5 font-bold text-[12px] uppercase tracking-wide text-[hsl(var(--muted-foreground))] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} className="border-t border-[hsl(var(--border))]">
                  <td className="px-3.5 py-2.5 whitespace-nowrap text-[hsl(var(--muted-foreground))]">{fmtDate(l.created_at)}</td>
                  <td className="px-3.5 py-2.5 whitespace-nowrap">{l.user_email}</td>
                  <td className="px-3.5 py-2.5 whitespace-nowrap font-medium">{l.action}</td>
                  <td className="px-3.5 py-2.5">{l.resource_name ?? l.resource_id ?? '—'}</td>
                </tr>
              ))}
              {!isPending && logs.length === 0 && (
                <tr><td colSpan={4} className="px-3.5 py-6 text-center text-[hsl(var(--muted-foreground))]">No activity found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 text-[13px] text-[hsl(var(--muted-foreground))]">
        <span>{total} {total === 1 ? 'entry' : 'entries'}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
