'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { undoImport } from '@/lib/actions/imports'

type Import = {
  id: string
  filename: string
  imported_count: number
  skipped_count: number
  created_at: string
}

export function ImportHistory({ imports }: { imports: Import[] }) {
  const [pending, startTransition] = useTransition()
  const [confirmId, setConfirmId] = useState<string | null>(null)

  function handleUndo(id: string) {
    startTransition(async () => {
      await undoImport(id)
      setConfirmId(null)
    })
  }

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ borderColor: 'hsl(var(--border))' }}>
      {imports.map((imp, i) => (
        <div
          key={imp.id}
          className="flex items-center justify-between px-4 py-3"
          style={{
            borderTop: i > 0 ? '1px solid hsl(var(--border))' : undefined,
            background: 'hsl(var(--card))',
          }}
        >
          <div>
            <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
              {imp.filename}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {imp.imported_count} imported · {imp.skipped_count} skipped ·{' '}
              {new Date(imp.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {confirmId === imp.id ? (
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Undo this import?
              </span>
              <button
                onClick={() => handleUndo(imp.id)}
                disabled={pending}
                className="text-xs px-2 py-1 rounded-lg font-semibold"
                style={{ background: 'hsl(var(--destructive))', color: '#fff' }}
              >
                Yes, undo
              </button>
              <button
                onClick={() => setConfirmId(null)}
                className="text-xs px-2 py-1 rounded-lg border"
                style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmId(imp.id)}
              className="p-1.5 rounded-lg opacity-50 hover:opacity-100 transition-opacity"
              title="Undo this import"
            >
              <Trash2 size={14} style={{ color: 'hsl(var(--destructive))' }} />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
