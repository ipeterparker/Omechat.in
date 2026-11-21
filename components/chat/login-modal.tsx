'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Avatar } from '@/components/avatar'
import type { Identity } from '@/components/identity'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
const IS_DEV = process.env.NODE_ENV !== 'production'
const GSI = 'https://accounts.google.com/gsi/client'

// Development only (when no Google Client ID is set yet): fake accounts so the flow can be tried.
const DEMO_ACCOUNTS = [
  { name: 'Demo User One', email: 'demo.one@example.com' },
  { name: 'Demo User Two', email: 'demo.two@example.com' },
]

function loadGsi(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve()
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI}"]`)
    const s = existing ?? Object.assign(document.createElement('script'), { src: GSI, async: true })
    if (!existing) document.head.appendChild(s)
    s.addEventListener('load', () => resolve())
    s.addEventListener('error', () => reject(new Error('Google script failed')))
  })
}

// Sign-in popup shown on Video Chat only. Colours follow the chat theme (White / Black / picture).
export function LoginModal({ onPick }: { onPick: (i: Identity) => void }) {
  const [ready, setReady] = useState(false)
  const [chooser, setChooser] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (CLIENT_ID) loadGsi().then(() => setReady(true)).catch(() => setError('Could not load Google sign-in.'))
  }, [])

  // Runs straight from the tap so the browser allows the Google account popup.
  function google() {
    setError('')
    if (!CLIENT_ID) {
      if (IS_DEV) setChooser(true)
      return
    }
    if (!ready || !window.google) return
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: 'openid email profile',
      callback: async (r: { access_token?: string }) => {
        if (!r.access_token) return
        try {
          const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${r.access_token}` },
          })
          const u = await res.json()
          onPick({ type: 'google', name: u.name, email: u.email, picture: u.picture })
        } catch {
          setError('Google sign-in failed. Try again.')
        }
      },
      error_callback: () => setError('Sign-in was cancelled.'),
    })
    client.requestAccessToken({ prompt: 'select_account' })
  }

  const disabled = !CLIENT_ID && !IS_DEV

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="login-title">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" aria-hidden="true" />
      <div className="relative w-full max-w-[440px] rounded-3xl border border-border bg-card px-6 pb-6 pt-8 text-center text-card-foreground shadow-2xl sm:px-7">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-secondary text-3xl" aria-hidden="true">
          {'\u{1F43B}'}
        </div>
        <h1 id="login-title" className="text-2xl font-bold leading-tight sm:text-[26px]" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
          Sign in to start Video Chat
        </h1>
        <p className="mb-5 mt-2.5 text-[15px] leading-snug text-muted-foreground">
          Video chat needs a Google account, so everyone you meet is a real person. Text chat stays free without sign in.
        </p>

        <button
          type="button"
          onClick={google}
          disabled={disabled}
          className="flex h-[50px] w-full items-center justify-center gap-3 rounded-2xl border border-[#d6d9e2] bg-white text-base font-semibold text-[#1f2430] transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
            <path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" />
            <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.8 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
          </svg>
          {disabled ? 'Google login (setup pending)' : 'Continue with Google'}
        </button>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

        <Link
          href="/chat?mode=text"
          className="mt-3.5 flex h-[46px] w-full items-center justify-center rounded-2xl border border-border text-[15px] font-semibold opacity-85 transition-opacity hover:opacity-100"
        >
          Use Text Chat instead
        </Link>

        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          By continuing, you confirm you are 18+ and agree to our{' '}
          <Link href="/terms" className="underline underline-offset-2">Terms</Link> and{' '}
          <Link href="/privacy" className="underline underline-offset-2">Privacy Policy</Link>.
        </p>
      </div>

      {chooser && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <button type="button" aria-label="Close" onClick={() => setChooser(false)} className="absolute inset-0 bg-black/60" />
          <div className="relative w-full max-w-md rounded-t-3xl bg-white p-5 pb-8 text-left text-[#1f2937]">
            <p className="text-lg font-semibold">Choose an account</p>
            <p className="mb-3 text-xs text-[#6b7280]">Demo accounts. Add the Google Client ID to use real Gmail accounts.</p>
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.email}
                type="button"
                onClick={() => {
                  setChooser(false)
                  onPick({ type: 'google', name: a.name, email: a.email })
                }}
                className="flex w-full items-center gap-3 border-t border-[#e5e7eb] py-3 text-left"
              >
                <Avatar name={a.name} size={40} />
                <span>
                  <span className="block font-medium">{a.name}</span>
                  <span className="block text-sm text-[#6b7280]">{a.email}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
