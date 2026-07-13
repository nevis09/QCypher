'use client'

import { Search } from 'lucide-react'

export function TopBar({ onOpenCmd }: { onOpenCmd: () => void }) {
  return (
    <header className="h-14 border-b border-[hsl(var(--border))] flex items-center px-4 md:px-6 gap-4 flex-shrink-0">
      <button
        onClick={onOpenCmd}
        className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] bg-[hsl(var(--muted))] rounded-xl px-3 py-2 md:py-1.5 w-full md:w-auto transition-colors touch-target"
      >
        <Search className="w-4 h-4 md:w-3.5 md:h-3.5 flex-shrink-0" />
        <span className="flex-1 text-left">Search&hellip;</span>
        <kbd className="hidden md:inline text-xs bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded px-1.5 py-0.5 flex-shrink-0">⌘K</kbd>
      </button>
    </header>
  )
}
