import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { Users, TrendingUp, Calendar, FileText, UserPlus, Activity } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Dashboard' }

type StatCardProps = {
  label: string; value: string | number; sub?: string
  icon: React.ElementType; gradient: string; iconColor: string
}

function StatCard({ label, value, sub, icon: Icon, gradient, iconColor }: StatCardProps) {
  return (
    <div className="rounded-2xl shadow-card overflow-hidden border border-[hsl(var(--border))]" style={{ background: gradient }}>
      <div className="p-5 flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5" style={{ color: iconColor }} strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.75)' }}>{label}</p>
          <p className="text-3xl font-black mt-1 leading-none text-white">{value}</p>
          {sub && <p className="text-[15px] mt-1.5 font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{sub}</p>}
        </div>
      </div>
    </div>
  )
}

function ContactsBarChart({ data }: { data: { month: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div className="bg-[hsl(var(--card))] rounded-2xl shadow-card border border-[hsl(var(--border))] p-6">
      <h3 className="text-base font-bold mb-1" style={{ color: 'hsl(var(--foreground))' }}>Contacts Added</h3>
      <p className="text-[15px] font-medium mb-5" style={{ color: 'hsl(var(--muted-foreground))' }}>Last 6 months</p>
      <div className="flex items-end gap-2.5 h-36">
        {data.map(({ month, count }, i) => {
          const colors = ['#6366f1','#8b5cf6','#ec4899','#f97316','#10b981','#0ea5e9']
          const col = colors[i % colors.length]
          return (
            <div key={month} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[15px] font-bold" style={{ color: 'hsl(var(--foreground))' }}>{count || ''}</span>
              <div
                className="w-full rounded-t-lg transition-all"
                style={{
                  height: `${Math.max((count / max) * 100, count > 0 ? 8 : 4)}%`,
                  background: col,
                  opacity: count === 0 ? 0.18 : 1,
                  minHeight: '4px',
                }}
              />
              <span className="text-[15px] font-semibold" style={{ color: 'hsl(var(--muted-foreground))' }}>{month}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PipelineDonut({ lead, active, inactive }: { lead: number; active: number; inactive: number }) {
  const total = lead + active + inactive || 1
  const segments = [
    { label: 'Leads',    value: lead,     color: '#f59e0b', bg: '#fffbeb', text: '#92400e' },
    { label: 'Active',   value: active,   color: '#10b981', bg: '#ecfdf5', text: '#065f46' },
    { label: 'Inactive', value: inactive, color: '#6366f1', bg: '#eef2ff', text: '#3730a3' },
  ]
  let offset = 0
  const r = 40, circ = 2 * Math.PI * r

  return (
    <div className="bg-[hsl(var(--card))] rounded-2xl shadow-card border border-[hsl(var(--border))] p-6">
      <h3 className="text-base font-bold mb-1" style={{ color: 'hsl(var(--foreground))' }}>Contact Status</h3>
      <p className="text-[15px] font-medium mb-5" style={{ color: 'hsl(var(--muted-foreground))' }}>Breakdown by stage</p>
      <div className="flex items-center gap-5">
        <svg viewBox="0 0 100 100" className="w-24 h-24 flex-shrink-0 -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="14" />
          {segments.map(seg => {
            const pct = seg.value / total
            const dash = pct * circ
            const gap = circ - dash
            const el = (
              <circle key={seg.label} cx="50" cy="50" r={r} fill="none"
                stroke={seg.color} strokeWidth="14"
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offset * circ}
                strokeLinecap="round"
              />
            )
            offset += pct
            return el
          })}
        </svg>
        <div className="flex-1 space-y-2">
          {segments.map(s => (
            <div key={s.label} className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: s.bg }}>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                <span className="text-[15px] font-semibold" style={{ color: s.text }}>{s.label}</span>
              </div>
              <span className="text-[15px] font-black" style={{ color: s.text }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RecentContactRow({ c }: { c: { id: string; first_name: string; last_name: string | null; email: string | null; status: string; created_at: string } }) {
  const initials = `${c.first_name[0]}${c.last_name?.[0] ?? ''}`.toUpperCase()
  const badge: Record<string, { bg: string; color: string; label: string }> = {
    lead:     { bg: 'var(--badge-lead-bg)',     color: 'var(--badge-lead-text)',     label: 'Lead'     },
    active:   { bg: 'var(--badge-active-bg)',   color: 'var(--badge-active-text)',   label: 'Active'   },
    inactive: { bg: 'var(--badge-indigo-bg)',   color: 'var(--badge-indigo-text)',   label: 'Inactive' },
  }
  const b = badge[c.status] ?? { bg: 'var(--badge-inactive-bg)', color: 'var(--badge-inactive-text)', label: c.status }
  return (
    <Link href={`/contacts/${c.id}`} className="flex items-center gap-3 py-3 hover:bg-[hsl(var(--muted))] -mx-2 px-2 rounded-xl transition-colors">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[15px] font-black text-white flex-shrink-0"
        style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold truncate" style={{ color: 'hsl(var(--foreground))' }}>{c.first_name} {c.last_name}</p>
        {c.email && <p className="text-[15px] font-medium truncate" style={{ color: 'hsl(var(--muted-foreground))' }}>{c.email}</p>}
      </div>
      <span className="text-[15px] font-bold px-2.5 py-1 rounded-full" style={{ background: b.bg, color: b.color }}>{b.label}</span>
    </Link>
  )
}

function QuickAction({ href, icon: Icon, label, bg, iconColor, textColor }: {
  href: string; icon: React.ElementType; label: string; bg: string; iconColor: string; textColor: string
}) {
  return (
    <Link href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-[1.02] hover:shadow-card"
      style={{ background: bg }}>
      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: iconColor }} strokeWidth={2.5} />
      <span className="text-[15px] font-bold" style={{ color: textColor }}>{label}</span>
    </Link>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { count: totalContacts },
    { count: newThisMonth },
    { data: byStatus },
    { data: recentContacts },
    { count: totalTemplates },
    { count: upcomingEvents },
    { data: monthlyRaw },
  ] = await Promise.all([
    supabase.from('contacts').select('*', { count: 'exact', head: true }),
    supabase.from('contacts').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
    supabase.from('contacts').select('status'),
    supabase.from('contacts').select('id, first_name, last_name, email, status, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('templates').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }).gte('starts_at', now.toISOString()),
    supabase.from('contacts').select('created_at').order('created_at', { ascending: true }),
  ])

  const statusCounts = { lead: 0, active: 0, inactive: 0 }
  for (const row of byStatus ?? []) {
    if (row.status in statusCounts) statusCounts[row.status as keyof typeof statusCounts]++
  }

  const months: { month: string; count: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = d.toLocaleString('default', { month: 'short' })
    const y = d.getFullYear(), m = d.getMonth()
    const count = (monthlyRaw ?? []).filter(r => {
      const rd = new Date(r.created_at)
      return rd.getFullYear() === y && rd.getMonth() === m
    }).length
    months.push({ month: label, count })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black" style={{ color: 'hsl(var(--foreground))' }}>
          Good {hour()}
        </h1>
        <p className="text-[15px] font-medium mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Here's what's happening with your business today
        </p>
      </div>

      {/* Stat grid — each card has its own gradient */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Contacts" value={totalContacts ?? 0}
          sub={`+${newThisMonth ?? 0} this month`}
          icon={Users} iconColor="#fff"
          gradient="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
        />
        <StatCard
          label="Active Clients" value={statusCounts.active}
          sub="in pipeline"
          icon={TrendingUp} iconColor="#fff"
          gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
        />
        <StatCard
          label="Upcoming Events" value={upcomingEvents ?? 0}
          sub="on calendar"
          icon={Calendar} iconColor="#fff"
          gradient="linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
        />
        <StatCard
          label="Templates" value={totalTemplates ?? 0}
          sub="quick-replies ready"
          icon={FileText} iconColor="#fff"
          gradient="linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ContactsBarChart data={months} />
        </div>
        <PipelineDonut lead={statusCounts.lead} active={statusCounts.active} inactive={statusCounts.inactive} />
      </div>

      {/* Recent contacts + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[hsl(var(--card))] rounded-2xl shadow-card border border-[hsl(var(--border))] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold" style={{ color: 'hsl(var(--foreground))' }}>Recent Contacts</h3>
            <Link href="/contacts" className="text-[15px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline">View all →</Link>
          </div>
          {(recentContacts ?? []).length === 0 ? (
            <p className="text-[15px] text-center py-6" style={{ color: 'hsl(var(--muted-foreground))' }}>No contacts yet.</p>
          ) : (
            <div className="divide-y divide-[hsl(var(--border))]">
              {(recentContacts ?? []).map(c => <RecentContactRow key={c.id} c={c} />)}
            </div>
          )}
        </div>

        <div className="bg-[hsl(var(--card))] rounded-2xl shadow-card border border-[hsl(var(--border))] p-6">
          <h3 className="text-base font-bold mb-4" style={{ color: 'hsl(var(--foreground))' }}>Quick Actions</h3>
          <div className="space-y-2.5">
            <QuickAction href="/contacts/new"  icon={UserPlus}  label="Add Contact"    bg="#eef2ff" iconColor="#6366f1" textColor="#3730a3" />
            <QuickAction href="/pipeline"       icon={Activity}  label="View Pipeline"  bg="#ecfdf5" iconColor="#10b981" textColor="#065f46" />
            <QuickAction href="/templates/new"  icon={FileText}  label="New Template"   bg="#f5f3ff" iconColor="#a855f7" textColor="#5b21b6" />
            <QuickAction href="/calendar"        icon={Calendar}  label="Schedule Event" bg="#fff7ed" iconColor="#f97316" textColor="#9a3412" />
          </div>
        </div>
      </div>
    </div>
  )
}

function hour() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
