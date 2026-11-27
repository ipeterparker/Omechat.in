import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export function GET(req: Request) {
  const code = (req.headers.get('x-vercel-ip-country') ?? req.headers.get('cf-ipcountry') ?? '').toUpperCase()
  // only a real 2-letter country code ("XX" = unknown and "T1" = Tor are not countries)
  return NextResponse.json({ country: /^[A-Z]{2}$/.test(code) && code !== 'XX' ? code : null })
}
