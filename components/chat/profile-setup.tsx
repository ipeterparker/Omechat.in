'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ageFromDob, type Gender, type Identity, type Profile } from '@/components/identity'

type Google = Extract<Identity, { type: 'google' }>

// Shown once, right after a Google sign-in: name, date of birth, gender.
export function ProfileSetup({ identity, onDone }: { identity: Google; onDone: (p: Profile) => void }) {
  const [name, setName] = useState(identity.name)
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState<Gender | ''>('')
  const age = ageFromDob(dob)
  const tooYoung = age !== undefined && age < 18
  const ok = name.trim().length > 0 && age !== undefined && !tooYoung && gender !== ''
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col items-center justify-center">
      <div className="w-full rounded-3xl border bg-card p-6">
        <h1 className="text-xl font-bold">Complete your profile</h1>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">{identity.email}</p>

        <label className="mb-1 block text-xs text-muted-foreground">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 24))}
          className="mb-3 h-12 w-full rounded-2xl border bg-transparent px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />

        <label className="mb-1 block text-xs text-muted-foreground">Date of birth</label>
        <input
          type="date"
          value={dob}
          max={today}
          onChange={(e) => setDob(e.target.value)}
          className="mb-1 h-12 w-full rounded-2xl border bg-transparent px-4 text-base outline-none [color-scheme:dark] focus-visible:ring-2 focus-visible:ring-ring"
        />
        {tooYoung && <p className="mb-2 text-xs text-red-400">You must be 18 or older.</p>}

        <label className="mb-1 mt-2 block text-xs text-muted-foreground">Gender</label>
        <div className="mb-2 grid grid-cols-2 gap-3">
          {(['Male', 'Female'] as Gender[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={cn(
                'h-12 rounded-2xl border font-semibold',
                gender === g ? 'border-[#4f7cff] bg-[#4f7cff]/20' : 'border-white/20',
              )}
            >
              {g}
            </button>
          ))}
        </div>
        <p className="mb-4 text-xs text-muted-foreground">18+ only</p>

        <button
          type="button"
          disabled={!ok}
          onClick={() =>
            onDone({ name: name.trim(), dob, gender: gender as Gender, joined: new Date().toISOString() })
          }
          className="h-12 w-full rounded-full bg-[#4f7cff] font-bold text-white disabled:bg-slate-600"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
