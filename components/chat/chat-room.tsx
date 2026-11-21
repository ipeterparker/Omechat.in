'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ActiveCount } from '@/components/active-count'
import { ChatBear } from '@/components/chat-bear'
import {
  clearIdentity, loadIdentity, loadProfile, saveIdentity, saveProfile, toPublic,
  type Identity, type Profile,
} from '@/components/identity'
import { MessagePanel } from './message-panel'
import { VideoRoom } from './video-room'
import { LoginModal } from './login-modal'
import { ProfileSetup } from './profile-setup'
import { ThemePicker } from './theme-picker'
import { useMediaQuery } from '@/components/use-media-query'
import { THEMES, darkTokensStyle, themeStyle } from './themes'
import { useUserCountry } from './country'

type Mode = 'text' | 'video'

const TAB =
  'border bg-card/70 backdrop-blur-xl group-data-[themed]:border-[var(--bd)] group-data-[themed]:bg-[var(--tab)]'

export function ChatRoom({ initialMode }: { initialMode: Mode }) {
  const [searching, setSearching] = useState(false)
  const [identity, setIdentity] = useState<Identity | null | undefined>(undefined)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [themeId, setThemeId] = useState('white')
  const [themeReady, setThemeReady] = useState(false)
  const [sameCountry, setSameCountry] = useState(true)
  const [themeOpen, setThemeOpen] = useState(false)
  const country = useUserCountry()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const picked = THEMES.find((t) => t.id === themeId) ?? THEMES[1]
  // On desktop only White and Black are available; a picture theme saved on another screen shows as Black.
  const theme = isDesktop && picked.kind === 'photo' ? (THEMES.find((t) => t.kind === 'black') ?? picked) : picked

  useEffect(() => {
    try {
      const saved = localStorage.getItem('omechat-theme')
      if (saved && THEMES.some((t) => t.id === saved)) setThemeId(saved)
    } catch {}
    setThemeReady(true)
    // Video Chat needs a Google sign-in (popup). Text Chat has no login: anonymous by default.
    const existing = loadIdentity()
    if (initialMode === 'video') setIdentity(existing && existing.type === 'google' ? existing : null)
    else if (existing) setIdentity(existing)
    else {
      const anon: Identity = { type: 'anon' }
      saveIdentity(anon)
      setIdentity(anon)
    }
    setProfile(loadProfile())
  }, [initialMode])

  function pick(i: Identity) {
    saveIdentity(i)
    setIdentity(i)
  }

  function switchAccount() {
    clearIdentity()
    setThemeOpen(false)
    setSearching(false)
    setIdentity({ type: 'anon' })
  }

  function chooseTheme(id: string) {
    setThemeId(id)
    try {
      localStorage.setItem('omechat-theme', id)
    } catch {}
  }

  const needsProfile = identity?.type === 'google' && !profile
  const me = identity ? toPublic(identity, profile, country) : null
  const account = identity?.type === 'google' ? `${profile?.name ?? identity.name} (Google)` : identity ? 'Anonymous' : 'Not signed in'
  const video = initialMode === 'video'

  if (video && identity && !needsProfile && me) {
    return (
      <div style={darkTokensStyle}>
        <VideoRoom identity={identity} me={me} country={country} />
      </div>
    )
  }

  return (
    <div
      className="group flex h-dvh flex-col gap-3 bg-background p-3 text-foreground lg:gap-4 lg:p-6"
      style={{ ...themeStyle(theme), visibility: themeReady ? 'visible' : 'hidden' }}
      data-themed={theme.kind !== 'black' ? '' : undefined}
    >
      {!video && (
        <header className="mx-auto flex w-full max-w-3xl shrink-0 items-center justify-between gap-2 lg:grid lg:max-w-none lg:grid-cols-[1fr_auto_1fr]">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setThemeOpen(true)}
              title="Select theme"
              className={`flex size-[34px] shrink-0 items-center justify-center rounded-full text-base ${TAB}`}
            >
              <span aria-hidden="true">{'\u{1F3A8}'}</span>
              <span className="sr-only">Select theme</span>
            </button>
            {/* desktop only: Same Country sits exactly between the theme button and the logo */}
            <div className="hidden flex-1 justify-center lg:flex">
              <div className={`flex h-[34px] items-center gap-1.5 whitespace-nowrap rounded-full pl-2.5 pr-2 text-xs font-semibold ${TAB}`}>
                <span aria-hidden="true" className="text-sm">{'\u{1F30D}'}</span>
                Same Country
                <button
                  type="button"
                  role="switch"
                  aria-checked={sameCountry}
                  aria-label="Same Country"
                  onClick={() => setSameCountry((v) => !v)}
                  className={`relative h-[21px] w-9 shrink-0 rounded-full transition-colors ${sameCountry ? 'bg-[#16a34a]' : 'bg-[#94a3b8]'}`}
                >
                  <span className={`absolute top-0.5 size-[17px] rounded-full bg-white shadow transition-all ${sameCountry ? 'left-[17px]' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:contents">
            <Link
              href="/"
              className={`flex h-[38px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full pl-[13px] pr-[18px] font-bold tracking-tight ${TAB}`}
            >
              <ChatBear running={searching} dark={theme.kind !== 'white'} />
              Omechat
            </Link>
            <div className={`flex h-[38px] items-center gap-2 rounded-full px-[18px] text-sm font-semibold lg:-mr-2 lg:justify-self-end ${TAB}`}>
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
        </header>
      )}

      {identity === undefined ? null : identity === null ? (
        <LoginModal onPick={pick} />
      ) : needsProfile && identity.type === 'google' ? (
        <ProfileSetup
          identity={identity}
          onDone={(p) => {
            saveProfile(p)
            setProfile(p)
          }}
        />
      ) : (
        me && (
          <main className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-3 lg:max-w-none">
            <MessagePanel me={me} country={country} onSearchingChange={setSearching} theme={theme} sameCountry={sameCountry} onSameCountryChange={setSameCountry} />
          </main>
        )
      )}

      {!video && (
        <ThemePicker
          open={themeOpen}
          current={theme.id}
          basicOnly={isDesktop}
          account={account}
          onSelect={chooseTheme}
          onClose={() => setThemeOpen(false)}
          onSwitchAccount={switchAccount}
        />
      )}
    </div>
  )
}
