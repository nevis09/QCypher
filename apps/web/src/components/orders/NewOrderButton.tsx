'use client'

import { useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import { createOrder } from '@/lib/actions/orders'
import { useRouter } from 'next/navigation'

export function NewOrderButton({ contactId }: { contactId?: string }) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function handleClick() {
    startTransition(async () => {
      const id = await createOrder({ customer_id: contactId })
      router.push(`/orders/${id}`)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[15px] font-bold text-white"
      style={{ background: 'linear-gradient(135deg,#10b981,#059669)', opacity: pending ? 0.6 : 1 }}
    >
      <Plus className="w-4 h-4" />
      {pending ? 'Creating…' : 'New order'}
    </button>
  )
}
