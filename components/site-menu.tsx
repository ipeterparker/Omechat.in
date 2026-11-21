'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Avatar } from '@/components/avatar'
import { loadIdentity, loadProfile, type Identity, type Profile } from '@/components/identity'
import { cn } from '@/lib/utils'

type Props = { open: boolean; onOpenChange: (open: boolean) => void }

export function SiteMenu({ open, onOpenChange }: Props) {
  const [identity, setIdentity] = useState<Identity | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (!open) {
      setShown(false)
      return
    }
    setIdentity(loadIdentity())
    setProfile(loadProfile())
    const id = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(id)
  }, [open])

  if (!open) return null
  const google = identity?.type === 'google' ? identity : null
  const close = () => onOpenChange(false)

  // Contact options appear only when NEXT_PUBLIC_CONTACT_EMAIL is set (add it in Vercel, then redeploy).
  const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL
  const items = [
    { href: '/', label: 'Home', icon: '\u{1F3E0}' },
    { href: '/chat?mode=text', label: 'Text Chat', icon: '\u{1F4AC}' },
    ...(google ? [{ href: '/profile', label: 'Profile', icon: '\u{1F464}' }] : []),
    { href: '/safety', label: 'Safety Tips', icon: '\u26A0\u{FE0F}' },
    { href: '/guidelines', label: 'Guidelines', icon: '\u{1F4D6}' },
    { href: '/faq', label: 'FAQ', icon: '\u2753' },
    { href: '/about', label: 'About Us', icon: '\u2139\u{FE0F}' },
    { href: '/omegle-alternative', label: 'Omegle Alternative', icon: '\u{1F50D}' },
    { href: '/privacy', label: 'Privacy', icon: '\u{1F6E1}\u{FE0F}' },
    { href: '/terms', label: 'Terms', icon: '\u{1F4C4}' },
    ...(contact
      ? [
          { href: `mailto:${contact}?subject=Report%20a%20problem`, label: 'Report a problem', icon: '\u{1F6A9}' },
          { href: `mailto:${contact}`, label: 'Contact Us', icon: '\u2709\u{FE0F}' },
        ]
      : []),
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
          <ThemeToggle />
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

        <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
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
