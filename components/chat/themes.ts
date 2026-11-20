import type { CSSProperties } from 'react'

export type ChatTheme = {
  id: string
  name: string
  kind: 'black' | 'white' | 'photo'
  dim?: number
  sent?: string
  sentInk?: string
  recv?: string
  recvInk?: string
  tab?: string
}

// Pictures live in public/themes/<id>.jpg. Themes are only shown to the user who picks them.
export const THEMES: ChatTheme[] = [
  { id: 'black', name: 'Black', kind: 'black' },
  { id: 'white', name: 'White', kind: 'white' },
  { id: 'birds', name: 'Night birds', kind: 'photo', dim: 0.38, sent: '#d9552b', sentInk: '#ffffff', recv: 'rgba(0,0,0,0.55)', recvInk: '#ffffff', tab: 'rgba(8,22,70,0.55)' },
  { id: 'blossom', name: 'Blossom cat', kind: 'photo', dim: 0.5, sent: '#c2477f', sentInk: '#ffffff', recv: 'rgba(0,0,0,0.55)', recvInk: '#ffffff', tab: 'rgba(70,25,45,0.5)' },
  { id: 'fish', name: 'Blue fish', kind: 'photo', dim: 0.46, sent: '#2563eb', sentInk: '#ffffff', recv: 'rgba(0,0,0,0.55)', recvInk: '#ffffff', tab: 'rgba(10,20,70,0.5)' },
  { id: 'swirl', name: 'Dream swirl', kind: 'photo', dim: 0.42, sent: '#c2185b', sentInk: '#ffffff', recv: 'rgba(0,0,0,0.55)', recvInk: '#ffffff', tab: 'rgba(40,10,40,0.5)' },
  { id: 'roses', name: 'Rose garden', kind: 'photo', dim: 0.33, sent: '#b76485', sentInk: '#ffffff', recv: 'rgba(0,0,0,0.55)', recvInk: '#ffffff', tab: 'rgba(82,69,74,0.5)' },
  { id: 'hamster', name: 'Gym hamster', kind: 'photo', dim: 0.5, sent: '#906d46', sentInk: '#ffffff', recv: 'rgba(0,0,0,0.55)', recvInk: '#ffffff', tab: 'rgba(64,49,31,0.5)' },
  { id: 'metro', name: 'Metro', kind: 'photo', dim: 0.36, sent: '#b75b46', sentInk: '#ffffff', recv: 'rgba(0,0,0,0.55)', recvInk: '#ffffff', tab: 'rgba(84,41,32,0.5)' },
  { id: 'statue', name: 'Statue', kind: 'photo', dim: 0.52, sent: '#72473f', sentInk: '#ffffff', recv: 'rgba(0,0,0,0.55)', recvInk: '#ffffff', tab: 'rgba(48,37,35,0.5)' },
  { id: 'kitten', name: 'Moonlit kitten', kind: 'photo', dim: 0.3, sent: '#b76481', sentInk: '#ffffff', recv: 'rgba(0,0,0,0.55)', recvInk: '#ffffff', tab: 'rgba(100,95,97,0.5)' },
  { id: 'pinkmoon', name: 'Pink moon', kind: 'photo', dim: 0.29, sent: '#894b65', sentInk: '#ffffff', recv: 'rgba(0,0,0,0.55)', recvInk: '#ffffff', tab: 'rgba(61,46,52,0.5)' },
  { id: 'eclipse', name: 'Eclipse', kind: 'photo', dim: 0.54, sent: '#b79164', sentInk: '#ffffff', recv: 'rgba(0,0,0,0.55)', recvInk: '#ffffff', tab: 'rgba(87,77,66,0.5)' },
  { id: 'reader', name: 'Night reader', kind: 'photo', dim: 0.41, sent: '#a16130', sentInk: '#ffffff', recv: 'rgba(0,0,0,0.55)', recvInk: '#ffffff', tab: 'rgba(72,44,21,0.5)' },
  { id: 'hearts', name: 'Hearts', kind: 'photo', dim: 0.6, sent: '#b76475', sentInk: '#ffffff', recv: 'rgba(0,0,0,0.55)', recvInk: '#ffffff', tab: 'rgba(99,60,68,0.5)' },
  { id: 'deepblue', name: 'Deep blue', kind: 'photo', dim: 0.53, sent: '#143592', sentInk: '#ffffff', recv: 'rgba(0,0,0,0.55)', recvInk: '#ffffff', tab: 'rgba(9,24,66,0.5)' },
  { id: 'bunny', name: 'Chill bunny', kind: 'photo', dim: 0.28, sent: '#723f56', sentInk: '#ffffff', recv: 'rgba(0,0,0,0.55)', recvInk: '#ffffff', tab: 'rgba(50,49,49,0.5)' },
  { id: 'teddy', name: 'Teddy beats', kind: 'photo', dim: 0.31, sent: '#846348', sentInk: '#ffffff', recv: 'rgba(0,0,0,0.55)', recvInk: '#ffffff', tab: 'rgba(59,51,44,0.5)' },
  { id: 'butterflies', name: 'Butterflies', kind: 'photo', dim: 0.42, sent: '#764155', sentInk: '#ffffff', recv: 'rgba(0,0,0,0.55)', recvInk: '#ffffff', tab: 'rgba(53,40,45,0.5)' },
]

const mix = (hex: string, a = 0.45) => {
  const n = parseInt(hex.slice(1), 16)
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * a))
  return `rgb(${c.join(',')})`
}

export function themeStyle(t: ChatTheme): CSSProperties {
  // Black / White set their own colours so they look the same whether the site is in Light or Dark mode.
  if (t.kind === 'black') {
    return {
      colorScheme: 'dark',
      '--background': 'oklch(0.13 0.008 260)', '--foreground': 'oklch(0.97 0.005 260)',
      '--card': 'oklch(0.18 0.01 260)', '--card-foreground': 'oklch(0.97 0.005 260)',
      '--muted-foreground': 'oklch(0.7 0.015 260)', '--border': 'oklch(1 0 0 / 9%)', '--input': 'oklch(1 0 0 / 14%)',
    } as CSSProperties
  }
  const s: Record<string, string> = { '--bd': t.kind === 'white' ? '#cbd5e1' : 'rgba(255,255,255,0.2)' }
  if (t.kind === 'white') {
    Object.assign(s, {
      colorScheme: 'light',
      '--background': 'oklch(0.99 0.003 260)', '--foreground': 'oklch(0.2 0.02 260)',
      '--card': 'oklch(1 0 0)', '--card-foreground': 'oklch(0.2 0.02 260)',
      '--muted-foreground': 'oklch(0.45 0.02 260)', '--border': 'oklch(0.2 0.02 260 / 12%)', '--input': 'oklch(0.2 0.02 260 / 16%)',
      '--sent': '#2563eb', '--sent-ink': '#ffffff', '--recv': '#e2e8f0', '--recv-ink': '#0f172a',
      '--tab': 'rgba(255,255,255,0.9)', '--notice': '#b45309', background: '#f8fafc', color: '#0f172a',
    })
  } else {
    const d = t.dim ?? 0.4
    Object.assign(s, {
      '--sent': t.sent!, '--sent-ink': t.sentInk!, '--recv': t.recv!, '--recv-ink': t.recvInk!, '--tab': t.tab!, '--notice': mix(t.sent!),
      background: `linear-gradient(rgba(0,0,0,${d}), rgba(0,0,0,${d})), url(/themes/${t.id}.jpg) center / cover no-repeat`,
      color: '#ffffff',
    })
  }
  return s as CSSProperties
}

// Pink / red / orange themes: a red warning line would blend in, so it switches to yellow there.
function isReddish(t: ChatTheme) {
  if (t.kind !== 'photo' || !t.sent) return false
  const n = parseInt(t.sent.slice(1), 16)
  const r = n >> 16
  const g = (n >> 8) & 255
  const b = n & 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max === min) return false
  const d = max - min
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  h = Math.round(h * 60)
  if (h < 0) h += 360
  return h <= 25 || h >= 300
}

export function warnColor(t: ChatTheme): string {
  if (t.kind === 'white') return '#dc2626'
  return isReddish(t) ? '#fde047' : '#ff5a5a'
}
