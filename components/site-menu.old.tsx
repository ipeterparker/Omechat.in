'use client'

import Link from 'next/link'
import { useState, type ComponentType } from 'react'
import {
  BookOpen,
  FileText,
  Flag,
  Globe2,
  Mail,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Video,
  Lock,
} from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { RunningBear } from '@/components/running-bear'

type MenuLink = { href: string; label: string; icon: ComponentType<{ className?: string }> }

const exploreLinks: MenuLink[] = [
  { href: '/#features', label: 'Features', icon: Sparkles },
  { href: '/#safety', label: 'Safety tips', icon: ShieldCheck },
  { href: '/guidelines', label: 'Community rules', icon: BookOpen },
]

const supportLinks: MenuLink[] = [
  { href: 'mailto:support@omechat.app?subject=Report%20a%20user', label: 'Report a problem', icon: Flag },
  { href: 'mailto:support@omechat.app', label: 'Contact us', icon: Mail },
]

const legalLinks: MenuLink[] = [
  { href: '/terms', label: 'Terms of Service', icon: FileText },
  { href: '/privacy', label: 'Privacy Policy', icon: Lock },
]

export function SiteMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [sameCountry, setSameCountry] = useState(false)
  const countryParam = sameCountry ? '&country=same' : ''
  const close = () => onOpenChange(false)

  const chatLinks: MenuLink[] = [
    { href: `/chat?mode=text${countryParam}`, label: 'Text Chat', icon: MessageCircle },
    { href: `/chat?mode=video${countryParam}`, label: 'Video Chat', icon: Video },
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        id="site-menu"
        side="left"
        className="gap-0 overflow-y-auto border-border bg-card/95 backdrop-blur-xl data-[side=left]:w-[35vw] data-[side=left]:min-w-[264px] data-[side=left]:sm:max-w-xs"
      >
        <SheetHeader className="border-b border-border px-5 pb-4 pt-5">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <RunningBear />
            Omechat
          </SheetTitle>
          <SheetDescription className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-online" aria-hidden="true" />
            4,910 people online now
          </SheetDescription>
        </SheetHeader>

        <nav aria-label="Main" className="flex flex-col gap-5 px-3 py-4">
          <MenuGroup title="Start chatting" links={chatLinks} onNavigate={close} />

          <div>
            <p className="px-2 pb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Preferences
            </p>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-medium transition-colors hover:bg-secondary">
              <Globe2 className="size-4 text-primary" aria-hidden="true" />
              <span className="flex-1">Same country</span>
              <Switch checked={sameCountry} onCheckedChange={setSameCountry} />
            </label>
          </div>

          <MenuGroup title="Explore" links={exploreLinks} onNavigate={close} />
          <MenuGroup title="Support" links={supportLinks} onNavigate={close} />
          <MenuGroup title="Legal" links={legalLinks} onNavigate={close} />
        </nav>

        <p className="mt-auto border-t border-border px-5 py-4 text-xs leading-relaxed text-muted-foreground">
          {'18+ only. Be kind, stay safe \u2014 skip anyone who makes you uncomfortable.'}
        </p>
      </SheetContent>
    </Sheet>
  )
}

function MenuGroup({ title, links, onNavigate }: { title: string; links: MenuLink[]; onNavigate: () => void }) {
  return (
    <div>
      <p className="px-2 pb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <ul className="flex flex-col">
        {links.map(({ href, label, icon: Icon }) => (
          <li key={label}>
            <Link
              href={href}
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
            >
              <Icon className="size-4 text-primary" aria-hidden="true" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
