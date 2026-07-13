'use client'

import { Search } from 'lucide-react'

export function TopBar({ onOpenCmd }: { onOpenCmd: () => void }) {
  return (
    <header className="h-14 border-b border-[hsl(var(--border))] flex items-center px-6 gap-4 flex-shrink-0">
      <button
        onClick={onOpenCmd}
        className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] bg-[hsl(var(--muted))] rounded-xl px-3 py-1.5 transition-colors"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Search&hellip;</span>
        <kbd className="ml-4 text-xs bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded px-1.5 py-0.5">⌘K</kbd>
      </button>
    </header>
  )
}
