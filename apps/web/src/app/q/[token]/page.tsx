export const dynamic = 'force-dynamic'

import { getQuoteByToken } from '@/lib/actions/quotes'
import { QuoteSignaturePage } from '@/components/orders/QuoteSignaturePage'
import type { Metadata } from 'next'
import { headers } from 'next/headers'

export const metadata: Metadata = { title: 'Review Your Quote' }

export default async function PublicQuotePage({ params }: { params: { token: string } }) {
  const result = await getQuoteByToken(params.token)

  if (!result || !result.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f8f9fa' }}>
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            {result?.alreadySigned ? 'Quote already signed' : result?.expired ? 'Link expired' : 'Link not found'}
          </h1>
          <p className="text-[15px] text-gray-600">
            {result?.alreadySigned
              ? 'This quote has already been approved. Contact the business for a copy.'
              : result?.expired
              ? 'This quote link has expired. Please contact the business to request a new link.'
              : 'This link is not valid. Please check the link you received or contact the business.'}
          </p>
        </div>
      </div>
    )
  }

  // Pass IP from headers to the client component via prop
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? headersList.get('x-real-ip')
    ?? 'unknown'

  return (
    <QuoteSignaturePage
      token={params.token}
      order={result.order!}
      lines={result.lines!}
      ip={ip}
    />
  )
}
