import { NextRequest, NextResponse } from 'next/server'
import { PORTAL_COOKIE } from '@/lib/portal-session'

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const response = NextResponse.redirect(new URL(`/portal/${params.slug}`, req.url))
  response.cookies.delete(PORTAL_COOKIE)
  return response
}
