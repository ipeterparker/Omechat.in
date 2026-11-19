'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Avatar } from '@/components/avatar'
import { loadIdentity, loadProfile, type Identity, type Profile } from '@/components/identity'
import { cn } from '@/lib/utils'

type Props = { open: boolean; onOpenChange: (open: boolean) => void }

export function SiteMenu({ open, onOpenChange }: Props) {
  const [identity, setIdentity] = useState<Identity | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [shown, setShown] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    if (!open) {
      setShown(false)
      return
    }
    setIdentity(loadIdentity())
    setProfile(loadProfile())
    setDark(document.documentElement.classList.contains('dark'))
    const id = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(id)
  }, [open])

  if (!open) return null
  const google = identity?.type === 'google' ? identity : null
  const close = () => onOpenChange(false)

  function setTheme(next: boolean) {
    if (next === dark) return
    setDark(next)
    const r = document.documentElement
    r.classList.toggle('dark', next)
    r.classList.toggle('light', !next)
    r.style.colorScheme = next ? 'dark' : 'light'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next ? '#0f1116' : '#ffffff')
    try {
      localStorage.setItem('omechat-site-theme', next ? 'dark' : 'light')
    } catch {}
  }

  const items = [
    { href: '/', label: 'Home', icon: '\u{1F3E0}' },
    { href: '/chat?mode=text', label: 'Text Chat', icon: '\u{1F4AC}' },
    ...(google ? [{ href: '/profile', label: 'Profile', icon: '\u{1F464}' }] : []),
    { href: '/guidelines', label: 'Guidelines', icon: '\u{1F4D6}' },
    { href: '/privacy', label: 'Privacy', icon: '\u{1F6E1}\u{FE0F}' },
    { href: '/terms', label: 'Terms', icon: '\u{1F4C4}' },
  ]

  return (
    <div id="site-menu" className="fixed inset-0 z-[60] flex" role="dialog" aria-modal="true" aria-label="Menu">
      <button type="button" aria-label="Close menu" onClick={close} className="absolute inset-0 bg-black/60" />
      <nav
        className={cn(
          'relative flex h-full w-[82%] max-w-xs flex-col rounded-r-3xl border-r border-border bg-card p-4 pt-5 text-card-foreground transition-transform duration-300 ease-out',
          shown ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="mb-4 flex items-center gap-2">
          <span className="flex flex-1 items-center gap-2 text-lg font-bold">
            <span aria-hidden="true" className="text-2xl leading-none">{'\u{1F43B}'}</span>
            Menu
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={dark}
            aria-label="Dark mode"
            onClick={() => setTheme(!dark)}
            className={cn('relative h-[30px] w-[54px] shrink-0 rounded-full border border-border transition-colors', dark ? 'bg-[#2c3350]' : 'bg-[#bcd6ff]')}
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
          <button type="button" onClick={close} className="flex size-10 items-center justify-center rounded-full border border-border">
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        {google && (
          <Link href="/profile" onClick={close} className="mb-3 flex items-center gap-3 rounded-2xl border border-border p-3">
            <Avatar name={profile?.name ?? google.name} photo={profile?.photo || google.picture} size={44} />
            <span className="min-w-0">
              <span className="block truncate font-bold">{profile?.name ?? google.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{google.email}</span>
            </span>
          </Link>
        )}

        <ul className="flex flex-col gap-1">
          {items.map(({ href, label, icon }) => (
            <li key={href}>
              <Link href={href} onClick={close} className="flex h-12 items-center gap-3 rounded-2xl px-3 text-base font-semibold active:bg-foreground/10">
                <span aria-hidden="true" className="w-6 text-center text-xl leading-none">{icon}</span>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
