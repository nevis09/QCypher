'use client'

import { useState, useMemo } from 'react'
import { ArrowRight, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Link from 'next/link'

interface Order   { payment_status: string; total_amount: number; created_at: string }
interface Expense { date: string; category: string; amount: number }

type Range = 'month' | 'quarter' | 'year' | 'all'

const RANGES: { key: Range; label: string }[] = [
  { key: 'month',   label: 'Month'   },
  { key: 'quarter', label: 'Quarter' },
  { key: 'year',    label: 'Year'    },
  { key: 'all',     label: 'All'     },
]

function inRange(dateStr: string, range: Range): boolean {
  const d   = new Date(dateStr)
  const now = new Date()
  if (range === 'all')     return true
  if (range === 'year')    return d.getFullYear() === now.getFullYear()
  if (range === 'month')   return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  if (range === 'quarter') {
    const q = Math.floor(now.getMonth() / 3)
    return d.getFullYear() === now.getFullYear() && Math.floor(d.getMonth() / 3) === q
  }
  return true
}

function usd(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function OverviewClient({ orders, expenses }: { orders: Order[]; expenses: Expense[] }) {
  const [range, setRange] = useState<Range>('month')

  const { income, totalExp, net, byCategory } = useMemo(() => {
    const ords = orders.filter(o => inRange(o.created_at, range))
    const exps = expenses.filter(e => inRange(e.date + 'T00:00:00', range))
    const income   = ords.reduce((s, o) => s + Number(o.total_amount), 0)
    const totalExp = exps.reduce((s, e) => s + Number(e.amount), 0)
    const net      = income - totalExp
    const map: Record<string, number> = {}
    exps.forEach(e => { map[e.category] = (map[e.category] ?? 0) + Number(e.amount) })
    const byCategory = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6)
    return { income, totalExp, net, byCategory }
  }, [orders, expenses, range])

  const maxCat = byCategory[0]?.[1] ?? 1

  return (
    <div style={{ background: 'hsl(var(--background))', minHeight: '100vh' }}>
      {/* Top bar */}
      <div style={{ padding: '24px 20px 0' }}>
        <p style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}>
          Overview
        </p>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'hsl(var(--foreground))', lineHeight: 1.2 }}>
          Income & Expenses
        </h1>
      </div>

      {/* Disclaimer — prominent, above range filter */}
      <div style={{
        margin: '16px 20px 0',
        padding: '12px 16px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(124,58,237,0.1) 100%)',
        border: '1px solid rgba(99,102,241,0.25)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
      }}>
        <span style={{ fontSize: '17px', lineHeight: 1, flexShrink: 0, marginTop: '1px' }}>⚠️</span>
        <p style={{ fontSize: '15px', lineHeight: 1.5, color: 'hsl(var(--foreground))', margin: 0 }}>
          <strong>Reference only</strong> — not accounting, bookkeeping, or tax advice.
          Consult a licensed accountant for financial decisions.
        </p>
      </div>

      {/* Range pills */}
      <div style={{ display: 'flex', gap: '6px', padding: '12px 20px 0', overflowX: 'auto' }}>
        {RANGES.map(r => (
          <button key={r.key} onClick={() => setRange(r.key)}
            style={{
              flexShrink: 0,
              padding: '5px 14px',
              borderRadius: '100px',
              fontSize: '15px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: range === r.key ? '#6366f1' : 'hsl(var(--card))',
              color:      range === r.key ? '#fff'    : 'hsl(var(--muted-foreground))',
              outline:    range === r.key ? 'none'    : '1px solid hsl(var(--border))',
            }}>
            {r.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '20px' }}>

        {/* Hero summary card */}
        <div style={{
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          padding: '24px',
          marginBottom: '12px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative circle */}
          <div style={{
            position: 'absolute', right: '-20px', top: '-30px',
            width: '120px', height: '120px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
          }} />
          <div style={{
            position: 'absolute', right: '30px', bottom: '-40px',
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
          }} />

          <p style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Net
          </p>
          <p style={{ fontSize: '38px', fontWeight: 800, color: '#fff', lineHeight: 1, marginBottom: '20px', fontVariantNumeric: 'tabular-nums' }}>
            {net < 0 ? '−' : '+'}&thinsp;${usd(Math.abs(net))}
          </p>

          {/* Income + Expense row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                <ArrowUpRight style={{ width: '13px', height: '13px', color: '#86efac' }} />
                <span style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Income</span>
              </div>
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
                ${usd(income)}
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                <ArrowDownRight style={{ width: '13px', height: '13px', color: '#fca5a5' }} />
                <span style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Expenses</span>
              </div>
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
                ${usd(totalExp)}
              </p>
            </div>
          </div>
        </div>

        {/* Expense breakdown */}
        {byCategory.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginBottom: '10px' }}>
              Expenses by Category
            </p>
            <div style={{ borderRadius: '18px', background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', overflow: 'hidden' }}>
              {byCategory.map(([cat, amt], i) => (
                <div key={cat} style={{
                  padding: '13px 16px',
                  borderTop: i > 0 ? '1px solid hsl(var(--border))' : undefined,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: 'hsl(var(--foreground))' }}>{cat}</span>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'hsl(var(--foreground))', fontVariantNumeric: 'tabular-nums' }}>
                      ${usd(amt)}
                    </span>
                  </div>
                  <div style={{ height: '3px', borderRadius: '100px', background: 'hsl(var(--border))' }}>
                    <div style={{
                      height: '100%',
                      borderRadius: '100px',
                      width: `${(amt / maxCat) * 100}%`,
                      background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manage expenses link */}
        <Link href="/overview/expenses" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            borderRadius: '18px',
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            cursor: 'pointer',
          }}>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: 'hsl(var(--foreground))', marginBottom: '2px' }}>
                Manage Expenses
              </p>
              <p style={{ fontSize: '15px', color: 'hsl(var(--muted-foreground))' }}>
                Add, edit, or remove records
              </p>
            </div>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px',
              background: 'rgba(99,102,241,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <ArrowRight style={{ width: '15px', height: '15px', color: '#6366f1' }} />
            </div>
          </div>
        </Link>

      </div>
    </div>
  )
}
