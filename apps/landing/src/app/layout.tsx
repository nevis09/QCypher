import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'QCypher Technologies — Web Presence & Marketing Solutions',
  description: 'Affordable websites, CRM, and digital marketing for small businesses. One-time build fees, low monthly costs, no surprises.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
