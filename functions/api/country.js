// Cloudflare Pages Function: returns the visitor's country (replaces the old Vercel /api/country).
export function onRequestGet({ request }) {
  const code = String((request.cf && request.cf.country) || request.headers.get('cf-ipcountry') || '').toUpperCase()
  // only a real 2-letter country code ("XX" = unknown and "T1" = Tor are not countries)
  const country = /^[A-Z]{2}$/.test(code) && code !== 'XX' ? code : null
  return new Response(JSON.stringify({ country }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}
