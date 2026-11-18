'use client'

import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { THEMES } from './themes'

type Props = {
  open: boolean
  current: string
  account: string
  onSelect: (id: string) => void
  onClose: () => void
  onSwitchAccount: () => void
}

// Slides in from the left. Top: Black / White. Below: picture themes.
export function ThemePicker({ open, current, account, onSelect, onClose, onSwitchAccount }: Props) {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (!open) {
      setShown(false)
      return
    }
    const id = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(id)
  }, [open])

  if (!open) return null
  const bases = THEMES.filter((t) => t.kind !== 'photo')
  const photos = THEMES.filter((t) => t.kind === 'photo')

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Chat theme">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/60" />
      <div
        className={cn(
          'relative flex h-full w-[86%] max-w-sm flex-col overflow-y-auto rounded-r-3xl border-r border-white/10 bg-[#0f1424] p-4 pt-5 text-white transition-transform duration-300 ease-out',
          shown ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Chat theme</h2>
          <button type="button" onClick={onClose} className="flex size-10 items-center justify-center rounded-full border border-white/20">
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/15 p-1">
          {bases.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t.id)}
              className={cn('h-11 rounded-xl text-sm font-bold', current === t.id ? 'ring-2 ring-[#4f7cff]' : '')}
              style={{ background: t.kind === 'white' ? '#f8fafc' : '#05070d', color: t.kind === 'white' ? '#0f172a' : '#ffffff' }}
            >
              {t.name}
            </button>
          ))}
        </div>

        <h3 className="mb-2 mt-5 text-sm font-semibold text-white/60">Themes</h3>
        <div className="grid grid-cols-2 gap-3 pb-4">
          {photos.map((t) => (
            <button key={t.id} type="button" onClick={() => onSelect(t.id)} className="text-center">
              <span
                className={cn(
                  'relative flex aspect-[3/4] flex-col justify-end gap-1.5 rounded-2xl border-2 p-2.5',
                  current === t.id ? 'border-white' : 'border-transparent',
                )}
                style={{ backgroundImage: `url(/themes/${t.id}.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                <span className="h-3 w-3/5 rounded-full" style={{ background: t.recv }} />
                <span className="ml-auto h-3 w-3/5 rounded-full" style={{ background: t.sent }} />
                {current === t.id && <Check className="absolute right-2 top-2 size-5 text-white drop-shadow" aria-hidden="true" />}
              </span>
              <span className="mt-1 block text-sm font-semibold">{t.name}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-3 text-xs text-white/60">
          <span>{account}</span>
          <button type="button" onClick={onSwitchAccount} className="font-semibold text-[#4f7cff]">
            Change
          </button>
        </div>
      </div>
    </div>
  )
}
