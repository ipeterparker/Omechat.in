import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export function GET(req: Request) {
  const code = req.headers.get('x-vercel-ip-country') ?? req.headers.get('cf-ipcountry')
  return NextResponse.json({ country: code && code !== 'XX' ? code : null })
}
