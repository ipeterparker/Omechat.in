'use client'

import { useEffect, useState } from 'react'

const TZ: Record<string, string> = {
  'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN', 'Asia/Karachi': 'PK', 'Asia/Dhaka': 'BD',
  'Asia/Kathmandu': 'NP', 'Asia/Katmandu': 'NP', 'Asia/Colombo': 'LK', 'Asia/Thimphu': 'BT', 'Indian/Maldives': 'MV',
  'Asia/Kabul': 'AF', 'Asia/Dubai': 'AE', 'Asia/Riyadh': 'SA', 'Asia/Qatar': 'QA', 'Asia/Kuwait': 'KW',
  'Asia/Muscat': 'OM', 'Asia/Bahrain': 'BH', 'Asia/Baghdad': 'IQ', 'Asia/Tehran': 'IR', 'Asia/Amman': 'JO',
  'Asia/Beirut': 'LB', 'Asia/Jerusalem': 'IL', 'Asia/Tel_Aviv': 'IL', 'Europe/Istanbul': 'TR', 'Asia/Istanbul': 'TR',
  'Asia/Singapore': 'SG', 'Asia/Kuala_Lumpur': 'MY', 'Asia/Jakarta': 'ID', 'Asia/Makassar': 'ID', 'Asia/Jayapura': 'ID',
  'Asia/Bangkok': 'TH', 'Asia/Ho_Chi_Minh': 'VN', 'Asia/Saigon': 'VN', 'Asia/Manila': 'PH', 'Asia/Yangon': 'MM',
  'Asia/Rangoon': 'MM', 'Asia/Phnom_Penh': 'KH', 'Asia/Vientiane': 'LA', 'Asia/Hong_Kong': 'HK', 'Asia/Shanghai': 'CN',
  'Asia/Taipei': 'TW', 'Asia/Seoul': 'KR', 'Asia/Tokyo': 'JP', 'Asia/Tashkent': 'UZ', 'Asia/Almaty': 'KZ',
  'Europe/London': 'GB', 'Europe/Dublin': 'IE', 'Europe/Paris': 'FR', 'Europe/Berlin': 'DE', 'Europe/Madrid': 'ES',
  'Europe/Rome': 'IT', 'Europe/Amsterdam': 'NL', 'Europe/Brussels': 'BE', 'Europe/Zurich': 'CH', 'Europe/Vienna': 'AT',
  'Europe/Stockholm': 'SE', 'Europe/Oslo': 'NO', 'Europe/Copenhagen': 'DK', 'Europe/Helsinki': 'FI', 'Europe/Warsaw': 'PL',
  'Europe/Prague': 'CZ', 'Europe/Budapest': 'HU', 'Europe/Bucharest': 'RO', 'Europe/Athens': 'GR', 'Europe/Lisbon': 'PT',
  'Europe/Kiev': 'UA', 'Europe/Kyiv': 'UA', 'Europe/Moscow': 'RU',
  'Africa/Cairo': 'EG', 'Africa/Lagos': 'NG', 'Africa/Nairobi': 'KE', 'Africa/Johannesburg': 'ZA', 'Africa/Accra': 'GH',
  'Africa/Casablanca': 'MA', 'Africa/Algiers': 'DZ', 'Africa/Tunis': 'TN', 'Africa/Addis_Ababa': 'ET',
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US', 'America/Los_Angeles': 'US',
  'America/Phoenix': 'US', 'America/Anchorage': 'US', 'Pacific/Honolulu': 'US', 'America/Toronto': 'CA',
  'America/Vancouver': 'CA', 'America/Mexico_City': 'MX', 'America/Sao_Paulo': 'BR', 'America/Argentina/Buenos_Aires': 'AR',
  'America/Bogota': 'CO', 'America/Lima': 'PE', 'America/Santiago': 'CL', 'America/Caracas': 'VE',
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Brisbane': 'AU', 'Australia/Perth': 'AU',
  'Australia/Adelaide': 'AU', 'Pacific/Auckland': 'NZ',
}

export function flagOf(code?: string | null) {
  if (!code || !/^[A-Za-z]{2}$/.test(code)) return '\u{1F30D}'
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
      // time zone only: the browser language is not a country (an en-US phone in India would become "US")
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      return TZ[tz] ?? null
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
