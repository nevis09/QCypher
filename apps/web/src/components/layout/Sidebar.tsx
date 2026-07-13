'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Calendar, FileText, Settings, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/contacts', icon: Users, label: 'Contacts' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/templates', icon: FileText, label: 'Templates' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname()

  return (
    <aside className="w-56 flex-shrink-0 border-r border-[hsl(var(--border))] flex flex-col py-4 px-3 gap-1">
      <div className="px-3 py-2 mb-4">
        <span className="text-sm font-semibold tracking-tight">QCypher CRM</span>
      </div>
      {nav.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
            pathname.startsWith(href)
              ? 'bg-accent/10 text-accent'
              : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]',
          )}
        >
          <Icon className="w-4 h-4 flex-shrink-0" />
          {label}
        </Link>
      ))}
      {isAdmin && (
        <Link
          href="/admin"
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors mt-auto',
            pathname.startsWith('/admin')
              ? 'bg-accent/10 text-accent'
              : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]',
          )}
        >
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          Admin
        </Link>
      )}
    </aside>
  )
}
