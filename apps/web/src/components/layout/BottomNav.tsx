'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Calendar, FileText, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/contacts', icon: Users,    label: 'Contacts' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/templates', icon: FileText, label: 'Templates' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 flex md:hidden bg-white dark:bg-[hsl(var(--muted))] border-t border-[hsl(var(--border))] pb-safe">
      {tabs.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors',
              active
                ? 'text-accent'
                : 'text-[hsl(var(--muted-foreground))]',
            )}
          >
            <Icon className={cn('w-5 h-5', active && 'stroke-[2.5]')} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
