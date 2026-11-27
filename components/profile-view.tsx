'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Camera, LogOut, Mail } from 'lucide-react'
import { Avatar } from '@/components/avatar'
import {
  ageFromDob, clearAll, fileToDataUrl, loadFriends, loadGoogleIdentity, loadIdentity, loadProfile, saveProfile, signOut, todayISO,
  type Gender, type Identity, type Profile,
} from '@/components/identity'
import { flagOf, countryName, useUserCountry } from '@/components/chat/country'
import { cn } from '@/lib/utils'

export function ProfileView() {
  const router = useRouter()
  const country = useUserCountry()
  const fileRef = useRef<HTMLInputElement>(null)
  const [identity, setIdentity] = useState<Identity | null | undefined>(undefined)
  const [p, setP] = useState<Profile | null>(null)
  const [friends, setFriends] = useState(0)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setIdentity(loadGoogleIdentity() ?? loadIdentity())
    const prof = loadProfile()
    setP(prof)
    setFriends(loadFriends().length)
  }, [])

  if (identity === undefined) return null

  if (identity?.type !== 'google' || !p) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-lg font-bold">Profile is for Google accounts</p>
        <p className="text-sm text-muted-foreground">Sign in with Google on the chat page to create your profile.</p>
        <Link prefetch={false} href="/chat?mode=text" className="rounded-full bg-[#4f7cff] px-6 py-3 font-bold text-white">Go to chat</Link>
      </div>
    )
  }

  const age = ageFromDob(p.dob)
  const tooYoung = age !== undefined && age < 18
  const dobOk = age !== undefined && !tooYoung
  const photo = p.photo || identity.picture

  async function pickPhoto(file?: File) {
    if (!file || !p) return
    try {
      setP({ ...p, photo: await fileToDataUrl(file, 256) })
      setSaved(false)
    } catch {}
  }

  function set<K extends keyof Profile>(k: K, v: Profile[K]) {
    if (!p) return
    setP({ ...p, [k]: v })
    setSaved(false)
  }

  function save() {
    if (!p || !dobOk) return
    const next = { ...p, name: p.name.trim() }
    saveProfile(next)
    setP(next)
    setSaved(true)
  }

  const field = 'h-12 w-full rounded-2xl border bg-transparent px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring'

  return (
    <div className="mx-auto min-h-dvh max-w-md p-4 pb-10">
      <div className="mb-4 flex items-center gap-3">
        <button type="button" onClick={() => router.back()} className="flex size-10 items-center justify-center rounded-full border bg-card/70">
          <ArrowLeft className="size-5" aria-hidden="true" />
          <span className="sr-only">Back</span>
        </button>
        <h1 className="text-xl font-bold">Your profile</h1>
      </div>

      <div className="flex flex-col items-center rounded-3xl border bg-card p-6">
        <button type="button" onClick={() => fileRef.current?.click()} className="relative" aria-label="Change photo">
          <Avatar name={p.name} photo={photo} size={104} />
          <span className="absolute bottom-0 right-0 flex size-9 items-center justify-center rounded-full border-2 border-card bg-[#4f7cff] text-white">
            <Camera className="size-4" aria-hidden="true" />
          </span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pickPhoto(e.target.files?.[0])} />
        <p className="mt-3 text-lg font-bold">{p.name}</p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Mail className="size-3.5" aria-hidden="true" />{identity.email}</p>
        <p className="mt-2 text-sm">
          {age !== undefined ? `${age} \u00B7 ${p.gender}` : p.gender} {country ? `\u00B7 ${flagOf(country)} ${countryName(country)}` : ''}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{friends} friends \u00B7 Joined {new Date(p.joined).toLocaleDateString()}</p>
      </div>

      <div className="mt-4 space-y-3 rounded-3xl border bg-card p-5">
        <label className="block text-xs text-muted-foreground">Name</label>
        <input className={field} value={p.name} maxLength={24} onChange={(e) => set('name', e.target.value)} />

        <label className="block text-xs text-muted-foreground">Date of birth</label>
        <input type="date" className={field} value={p.dob} max={todayISO()} onChange={(e) => set('dob', e.target.value)} />
        {tooYoung && <p className="text-xs text-red-400">You must be 18 or older.</p>}
        {age === undefined && <p className="text-xs text-red-400">Enter your date of birth.</p>}

        <label className="block text-xs text-muted-foreground">Gender</label>
        <div className="grid grid-cols-2 gap-3">
          {(['Male', 'Female'] as Gender[]).map((g) => (
            <button key={g} type="button" onClick={() => set('gender', g)} className={cn('h-12 rounded-2xl border font-semibold', p.gender === g ? 'border-[#4f7cff] bg-[#4f7cff]/20' : 'border-border')}>
              {g}
            </button>
          ))}
        </div>

        <button type="button" onClick={save} disabled={!dobOk || !p.name.trim()} className="h-12 w-full rounded-full bg-[#4f7cff] font-bold text-white disabled:bg-slate-600">
          {saved ? 'Saved \u2713' : 'Save changes'}
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <button type="button" onClick={() => { signOut(); router.push('/') }} className="flex h-12 items-center justify-center gap-2 rounded-full border font-semibold">
          <LogOut className="size-4" aria-hidden="true" /> Sign out
        </button>
        <button type="button" onClick={() => { if (confirm('Delete your profile and friends from this device?')) { clearAll(); router.push('/') } }} className="h-12 rounded-full text-sm font-semibold text-red-400">
          Delete my data from this device
        </button>
      </div>
    </div>
  )
}
