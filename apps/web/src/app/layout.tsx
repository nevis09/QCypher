import type { Metadata, Viewport } from 'next'
import { ServiceWorkerRegistrar } from '@/components/layout/ServiceWorkerRegistrar'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'QCypher CRM', template: '%s — QCypher CRM' },
  description: 'Lightweight CRM for small business owners',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'QCypher' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#ffffff',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  )
}
