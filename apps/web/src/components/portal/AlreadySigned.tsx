'use client'

import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export function AlreadySigned({
  signedBy,
  signedAt,
  businessName,
  backHref,
}: {
  signedBy: string
  signedAt: string
  businessName: string
  backHref: string
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-sm w-full text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Already approved</h1>
        <p className="text-[15px] text-gray-600">
          This quote was approved by <strong>{signedBy}</strong> on{' '}
          {new Date(signedAt).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric',
          })}.
        </p>
        <p className="text-[13px] text-gray-400">
          Contact {businessName} if you have questions.
        </p>
        <Link
          href={backHref}
          className="block w-full py-3 rounded-xl text-[15px] font-bold text-white text-center"
          style={{ background: 'linear-gradient(135deg, #1a3070, #2a52a0)' }}
        >
          Back to portal
        </Link>
      </div>
    </div>
  )
}
