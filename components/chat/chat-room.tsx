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
import { EntryGate } from './entry-gate'
import { ProfileSetup } from './profile-setup'
import { ThemePicker } from './theme-picker'
import { THEMES, themeStyle } from './themes'
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
  const [themeOpen, setThemeOpen] = useState(false)
  const country = useUserCountry()
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[1]

  useEffect(() => {
    try {
      const saved = localStorage.getItem('omechat-theme')
      if (saved && THEMES.some((t) => t.id === saved)) setThemeId(saved)
    } catch {}
    setThemeReady(true)
    // No login popup: if nobody is signed in, go straight in as anonymous.
    const existing = loadIdentity()
    if (existing) setIdentity(existing)
    else {
      const anon: Identity = { type: 'anon' }
      saveIdentity(anon)
      setIdentity(anon)
    }
    setProfile(loadProfile())
  }, [])

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
    return <VideoRoom identity={identity} me={me} country={country} />
  }

  return (
    <div
      className="group flex h-dvh flex-col gap-3 bg-background p-3 text-foreground"
      style={{ ...themeStyle(theme), visibility: themeReady ? 'visible' : 'hidden' }}
      data-themed={theme.kind !== 'black' ? '' : undefined}
    >
      {!video && (
        <header className="mx-auto flex w-full max-w-3xl shrink-0 items-center lg:max-w-4xl justify-between gap-2">
          <button
            type="button"
            onClick={() => setThemeOpen(true)}
            title="Select theme"
            className={`flex size-[34px] shrink-0 items-center justify-center rounded-full text-base ${TAB}`}
          >
            <span aria-hidden="true">{'\u{1F3A8}'}</span>
            <span className="sr-only">Select theme</span>
          </button>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className={`flex h-[38px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full pl-[13px] pr-[18px] font-bold tracking-tight ${TAB}`}
            >
              <ChatBear running={searching} dark={theme.kind !== 'white'} />
              Omechat
            </Link>
            <div className={`flex h-[38px] items-center gap-2 rounded-full px-[18px] text-sm font-semibold ${TAB}`}>
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
        <EntryGate mode={initialMode} onPick={pick} />
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
          <main className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-3 lg:max-w-4xl">
            <MessagePanel me={me} country={country} onSearchingChange={setSearching} theme={theme} />
          </main>
        )
      )}

      {!video && (
        <ThemePicker
          open={themeOpen}
          current={themeId}
          account={account}
          onSelect={chooseTheme}
          onClose={() => setThemeOpen(false)}
          onSwitchAccount={switchAccount}
        />
      )}
    </div>
  )
}
