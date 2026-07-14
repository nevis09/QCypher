'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, GitBranch, Calendar } from 'lucide-react'
import { DEFAULT_SETTINGS, type TenantSettings } from '@/lib/types/settings'

const ALL_TABS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home',     color: '#6366f1', bg: '#eef2ff', flag: null                    },
  { href: '/contacts',  icon: Users,            label: 'Contacts', color: '#10b981', bg: '#ecfdf5', flag: null                    },
  { href: '/pipeline',  icon: GitBranch,        label: 'Pipeline', color: '#f97316', bg: '#fff7ed', flag: 'show_pipeline' as const },
  { href: '/calendar',  icon: Calendar,         label: 'Calendar', color: '#0ea5e9', bg: '#f0f9ff', flag: 'show_calendar' as const },
]

export function BottomNav({ settings = DEFAULT_SETTINGS }: { settings?: TenantSettings }) {
  const pathname = usePathname()
  const tabs = ALL_TABS.filter(t => t.flag === null || settings[t.flag])

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 flex md:hidden bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] pb-safe">
      {tabs.map(({ href, icon: Icon, label, color, bg }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors"
          >
            <div className="w-9 h-7 rounded-xl flex items-center justify-center transition-all"
              style={{ background: active ? bg : 'transparent' }}>
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8}
                style={{ color: active ? color : 'hsl(var(--muted-foreground))' }} />
            </div>
            <span className="text-[15px] font-bold"
              style={{ color: active ? color : 'hsl(var(--muted-foreground))' }}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
