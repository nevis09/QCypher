import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchAvailableNumbers, buyAndConfigureNumber } from '@/lib/telnyx'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { areaCode } = await req.json() as { areaCode?: string }
  if (!areaCode || areaCode.length !== 3) {
    return NextResponse.json({ error: 'Invalid area code' }, { status: 400 })
  }

  try {
    const numbers = await searchAvailableNumbers(areaCode)
    if (!numbers.length) {
      return NextResponse.json({ error: `No numbers available in area code ${areaCode}` }, { status: 404 })
    }

    const number = await buyAndConfigureNumber(numbers[0])

    // Save to tenant
    await supabase.from('tenants').update({ telnyx_number: number }).eq('id', user.id)

    return NextResponse.json({ number })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to provision number' }, { status: 500 })
  }
}
