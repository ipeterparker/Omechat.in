'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useState } from 'react'
import { Menu } from 'lucide-react'
import { ActiveCount } from '@/components/active-count'
import { ChatBear } from '@/components/chat-bear'
import { RunningBear } from '@/components/running-bear'
import { SiteMenu } from '@/components/site-menu'
import { ThemeToggle } from '@/components/theme-toggle'

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/chat?mode=text', label: 'Text Chat' },
  { href: '/safety', label: 'Safety' },
  { href: '/guidelines', label: 'Guidelines' },
  { href: '/faq', label: 'FAQ' },
  { href: '/about', label: 'About' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLButtonElement>(null)
  const path = usePathname()
  const isHome = path === '/'

  return (
    <header className="relative z-50 px-3 pt-3 lg:px-8 lg:pt-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 lg:max-w-7xl lg:gap-6 2xl:max-w-[88rem]">
        <button
          ref={menuRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="site-menu"
          className="flex size-12 shrink-0 items-center justify-center rounded-full lg:hidden"
        >
          <Menu className="size-5" aria-hidden="true" />
          <span className="sr-only">Open menu</span>
        </button>

        <div className="flex items-center gap-2 lg:contents">
          <Link
            href="/"
            className="flex h-[38px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full border bg-card/70 pl-[13px] pr-[18px] font-bold tracking-tight backdrop-blur-xl lg:order-1 lg:h-11 lg:text-lg"
          >
            {isHome ? <ChatBear running={false} /> : <RunningBear />}
            Omechat
          </Link>
          <div className="flex h-[38px] items-center gap-2 rounded-full border bg-card/70 px-[18px] text-sm font-semibold text-primary backdrop-blur-xl lg:order-3 lg:h-11 lg:text-base">
            <span className="relative flex size-2.5" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-online opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-online" />
            </span>
            <span>
              <ActiveCount /> <span className="hidden min-[380px]:inline">Active</span>
              <span className="sr-only min-[380px]:hidden">Active</span>
            </span>
          </div>
        </div>

        <nav aria-label="Main" className="hidden flex-1 items-center gap-7 text-base font-semibold text-muted-foreground lg:order-2 lg:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={n.href === path ? 'text-foreground' : 'transition-colors hover:text-foreground'}>
              {n.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle className="hidden lg:order-4 lg:block" />
      </div>

      <SiteMenu open={open} onOpenChange={setOpen} />
    </header>
  )
}
