import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href}
      className="inline-flex items-center gap-1 text-[15px] font-semibold hover:opacity-70 transition-opacity"
      style={{ color: 'hsl(var(--muted-foreground))' }}>
      <ChevronLeft style={{ width: '15px', height: '15px' }} />
      {label}
    </Link>
  )
}
