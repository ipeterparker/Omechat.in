'use client'

import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/utils'

type Mode = 'text' | 'video'

const modes = [
  { value: 'text', label: 'Text Chat', icon: '\u{1F4AC}' },
  { value: 'video', label: 'Video Chat', icon: '\u{1F3A5}' },
] as const

export function Hero() {
  const [mode, setMode] = useState<Mode>('text')

  return (
    <section className="mx-auto flex w-full max-w-xl flex-col px-4 pt-6 md:max-w-2xl lg:mx-0 lg:max-w-none lg:px-0 lg:pt-0">
      <h1 className="mt-2 text-balance text-[2rem] font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-5xl xl:text-6xl">
        <span className="text-[#e17133]">Omechat:</span>{' '}
        <span className="bg-gradient-to-r from-primary to-[oklch(0.55_0.17_250)] dark:to-[oklch(0.78_0.12_240)] bg-clip-text text-transparent">
          The Ultimate
        </span>{' '}
        Connection Space
      </h1>
      <p className="mt-3 text-pretty text-muted-foreground">
        {'Talk to strangers in your browser \u2014 text or video.'}
      </p>

      <fieldset className="mt-6">
        <legend className="sr-only">Choose chat mode</legend>
        <div className="grid grid-cols-2 gap-3">
          {modes.map(({ value, label, icon }) => {
            const active = mode === value
            return (
              <label
                key={value}
                className={cn(
                  'flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border-2 bg-card/70 px-3 py-3 backdrop-blur-xl transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                  active
                    ? 'border-flame/80 shadow-[0_0_24px_-10px_var(--flame)]'
                    : 'border-border hover:border-foreground/20',
                )}
              >
                <input
                  type="radio"
                  name="mode"
                  value={value}
                  checked={active}
                  onChange={() => setMode(value)}
                  className="sr-only"
                />
                <span
                  className={cn(
                    'flex size-9 items-center justify-center rounded-full transition-colors',
                    active ? 'bg-flame/15 text-flame' : 'bg-secondary text-foreground',
                  )}
                >
                  <span aria-hidden="true" className="text-lg leading-none">{icon}</span>
                </span>
                <span className="font-semibold">{label}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <Link
        href={`/chat?mode=${mode}`}
        className="group relative mx-auto mt-6 flex h-14 w-full max-w-sm overflow-hidden lg:mx-0 lg:h-16 lg:max-w-md rounded-2xl p-[1.5px] shadow-[0_10px_40px_-16px_color-mix(in_oklab,var(--primary)_49%,transparent)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-0"
      >
        <span
          className="start-border pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[200%] opacity-[0.49] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,oklch(0.85_0.1_240)_320deg,oklch(0.98_0.02_240)_350deg,transparent_360deg)]"
          aria-hidden="true"
        />
        <span className="relative flex size-full items-center justify-center gap-2 rounded-[calc(1rem-1.5px)] bg-gradient-to-r from-[oklch(0.42_0.17_264)] via-[oklch(0.5_0.18_262)] to-[oklch(0.56_0.15_248)] text-lg font-bold text-white">
          Start Matching
          <span aria-hidden="true">{'\u2728'}</span>
        </span>
      </Link>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
        <span aria-hidden="true">{'\u{1F512}'}</span>
        {'Encrypted & Moderated \u2014 Keep the vibe clean.'}
      </p>
    </section>
  )
}
