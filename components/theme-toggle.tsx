'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

// Small Light/Dark switch. Shared by the header (desktop) and the three-dot menu (phone). Saved per device, Light by default.
export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const read = () => setDark(document.documentElement.classList.contains('dark'))
    read()
    window.addEventListener('omechat-theme', read)
    return () => window.removeEventListener('omechat-theme', read)
  }, [])

  function set(next: boolean) {
    const r = document.documentElement
    r.classList.toggle('dark', next)
    r.classList.toggle('light', !next)
    r.style.colorScheme = next ? 'dark' : 'light'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next ? '#0f1116' : '#ffffff')
    try {
      localStorage.setItem('omechat-site-theme', next ? 'dark' : 'light')
    } catch {}
    setDark(next)
    window.dispatchEvent(new Event('omechat-theme'))
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      onClick={() => set(!dark)}
      className={cn('relative h-[30px] w-[54px] shrink-0 rounded-full border border-border transition-colors', dark ? 'bg-[#2c3350]' : 'bg-[#bcd6ff]', className)}
    >
      <span aria-hidden="true" className="absolute left-[7px] top-1/2 -translate-y-1/2 text-[11px] opacity-55">{'\u{1F319}'}</span>
      <span aria-hidden="true" className="absolute right-[7px] top-1/2 -translate-y-1/2 text-[11px] opacity-55">{'\u2600\u{FE0F}'}</span>
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-[2px] flex size-6 items-center justify-center rounded-full text-[13px] shadow transition-all duration-300',
          dark ? 'left-[2px] bg-[#0f1220]' : 'left-[26px] bg-white',
        )}
      >
        {dark ? '\u{1F319}' : '\u2600\u{FE0F}'}
      </span>
    </button>
  )
}
