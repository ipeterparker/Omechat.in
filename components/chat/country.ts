'use client'

import { useEffect, useState } from 'react'

const TZ: Record<string, string> = {
  'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN', 'Asia/Karachi': 'PK', 'Asia/Dhaka': 'BD',
  'Asia/Kathmandu': 'NP', 'Asia/Colombo': 'LK', 'Asia/Dubai': 'AE', 'Europe/London': 'GB',
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Los_Angeles': 'US', 'Australia/Sydney': 'AU',
}

export function flagOf(code?: string | null) {
  if (!code || code.length !== 2) return '\u{1F30D}'
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)))
}

export function countryName(code?: string | null) {
  if (!code) return 'somewhere'
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code.toUpperCase()) ?? code
  } catch {
    return code
  }
}

// Real country from the host's IP header (/api/country); falls back to a browser guess.
export function useUserCountry() {
  const [country, setCountry] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    const guess = () => {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      const region = navigator.language.split('-')[1]
      return TZ[tz] ?? (region ? region.toUpperCase() : null)
    }
    fetch('/api/country')
      .then((r) => r.json())
      .then((d) => alive && setCountry(d.country ?? guess()))
      .catch(() => alive && setCountry(guess()))
    return () => {
      alive = false
    }
  }, [])
  return country
}
