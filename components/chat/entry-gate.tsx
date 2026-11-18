'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Avatar } from '@/components/avatar'
import type { Identity } from '@/components/identity'

export type { Identity }

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
const IS_DEV = process.env.NODE_ENV !== 'production'
const GSI = 'https://accounts.google.com/gsi/client'

// Shown only while the Google Client ID is not set (development). Looks like the phone's account chooser.
const DEMO_ACCOUNTS = [
  { name: 'Yash Sharma', email: 'yash.sharma@gmail.com' },
  { name: 'Riya Thapa', email: 'riya.thapa@gmail.com' },
  { name: 'Aman Verma', email: 'aman.verma@gmail.com' },
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

export function EntryGate({ mode, onPick }: { mode: 'text' | 'video'; onPick: (i: Identity) => void }) {
  const [ready, setReady] = useState(false)
  const [chooser, setChooser] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (CLIENT_ID) loadGsi().then(() => setReady(true)).catch(() => setError('Could not load Google sign-in.'))
  }, [])

  // Must run straight from the tap so the browser allows the Google account popup.
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
    <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col items-center justify-center">
      <div className="w-full rounded-3xl border bg-card p-6 text-center">
        <h1 className="text-xl font-bold">{mode === 'video' ? 'Start video chat' : 'Start text chat'}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose how you want to continue</p>
        <div className="mt-5 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => onPick({ type: 'anon' })}
            className="h-12 w-full max-w-[280px] rounded-full bg-[#4f7cff] font-bold text-white"
          >
            Continue anonymously
          </button>
          <button
            type="button"
            onClick={google}
            disabled={disabled}
            className="flex h-12 w-full max-w-[280px] items-center justify-center gap-2 rounded-full bg-white font-bold text-[#1f2937] disabled:opacity-60"
          >
            <span className="text-lg font-black text-[#4285f4]">G</span>
            {disabled ? 'Google login (setup pending)' : 'Continue with Google'}
          </button>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
        <p className="mt-5 text-xs text-muted-foreground">
          By continuing you confirm you are 18+ and agree to our{' '}
          <Link href="/terms" className="underline">Terms</Link> and{' '}
          <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>

      {chooser && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <button type="button" aria-label="Close" onClick={() => setChooser(false)} className="absolute inset-0 bg-black/60" />
          <div className="relative w-full max-w-md rounded-t-3xl bg-white p-5 pb-8 text-left text-[#1f2937]">
            <p className="text-lg font-semibold">Choose an account</p>
            <p className="mb-3 text-xs text-[#6b7280]">Demo accounts. Add the Google Client ID to use your real Gmail accounts.</p>
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
