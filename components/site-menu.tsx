'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { BookOpen, Home, MessageCircle, Shield, User, Video, X, FileText } from 'lucide-react'
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

  const items = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/chat?mode=text', label: 'Text Chat', icon: MessageCircle },
    { href: '/chat?mode=video', label: 'Video Chat', icon: Video },
    ...(google ? [{ href: '/profile', label: 'Profile', icon: User }] : []),
    { href: '/guidelines', label: 'Guidelines', icon: BookOpen },
    { href: '/privacy', label: 'Privacy', icon: Shield },
    { href: '/terms', label: 'Terms', icon: FileText },
  ]

  return (
    <div id="site-menu" className="fixed inset-0 z-[60] flex" role="dialog" aria-modal="true" aria-label="Menu">
      <button type="button" aria-label="Close menu" onClick={close} className="absolute inset-0 bg-black/60" />
      <nav
        className={cn(
          'relative flex h-full w-[82%] max-w-xs flex-col rounded-r-3xl border-r border-white/10 bg-[#0f1424] p-4 pt-5 text-white transition-transform duration-300 ease-out',
          shown ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg font-bold">
            <span aria-hidden="true" className="text-2xl leading-none">{'\u{1F43B}'}</span>
            Menu
          </span>
          <button type="button" onClick={close} className="flex size-10 items-center justify-center rounded-full border border-white/20">
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        {google && (
          <Link href="/profile" onClick={close} className="mb-3 flex items-center gap-3 rounded-2xl border border-white/10 p-3">
            <Avatar name={profile?.name ?? google.name} photo={profile?.photo || google.picture} size={44} />
            <span className="min-w-0">
              <span className="block truncate font-bold">{profile?.name ?? google.name}</span>
              <span className="block truncate text-xs text-white/60">{google.email}</span>
            </span>
          </Link>
        )}

        <ul className="flex flex-col gap-1">
          {items.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link href={href} onClick={close} className="flex h-12 items-center gap-3 rounded-2xl px-3 text-base font-semibold active:bg-white/10">
                <Icon className="size-5 opacity-80" aria-hidden="true" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
