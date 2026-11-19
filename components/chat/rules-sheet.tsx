'use client'

import type { ChatTheme } from './themes'

// Pink / red / orange chat themes: the red 18+ line would blend in, so it switches to yellow there.
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

type Props = { theme: ChatTheme; same: boolean; onSameChange: (v: boolean) => void; onAgree: () => void }

// Rules popup at the bottom of the Text Chat page. The chat opens after tapping I Agree.
export function RulesSheet({ theme, same, onSameChange, onAgree }: Props) {
  const surface =
    theme.kind === 'white'
      ? 'border-slate-200 bg-white text-slate-900'
      : theme.kind === 'black'
        ? 'border-white/10 bg-[#0f1116] text-white'
        : 'border-white/15 bg-black/65 text-white backdrop-blur-xl'
  const warn = theme.kind === 'white' ? '#dc2626' : isReddish(theme) ? '#fde047' : '#ff5a5a'

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center" role="dialog" aria-modal="true" aria-labelledby="rules-title">
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      <div
        className={`relative w-full max-w-3xl rounded-t-3xl border border-b-0 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl lg:max-w-4xl ${surface}`}
      >
        <p id="rules-title" className="text-lg font-bold leading-snug" style={{ color: warn }}>
          You must be at least 18 years old
        </p>
        <ul className="mt-1 space-y-0.5 text-base leading-snug opacity-90">
          <li>No nudity, hate speech, or harassment</li>
          <li>Do not ask for gender. This is not a dating site</li>
          <li>Respect others and be kind</li>
          <li>Violators will be banned</li>
        </ul>

        <button
          type="button"
          onClick={onAgree}
          className="mt-4 h-11 rounded-lg bg-gradient-to-b from-[#3b9bff] to-[#1d6fe8] px-6 text-base font-semibold text-white shadow active:opacity-80"
        >
          I Agree
        </button>

        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <input type="checkbox" checked={same} onChange={(e) => onSameChange(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[#2563eb]" />
          <span>
            <span className="block font-semibold">Prefer people from my country</span>
            <span className="block text-sm opacity-70">Uncheck to match worldwide.</span>
          </span>
        </label>
      </div>
    </div>
  )
}
