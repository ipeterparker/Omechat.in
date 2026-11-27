'use client'

import { useEffect, useState } from 'react'

// Popup with a live countdown, shown only on the blocked device while the block is running.
export function BlockNotice({ until, onDone }: { until: number | null; onDone: () => void }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!until) return
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [until])

  const left = until ? Math.max(0, until - now) : 0

  useEffect(() => {
    if (until && left <= 0) onDone()
  }, [until, left, onDone])

  if (!until || left <= 0) return null

  const total = Math.ceil(left / 1000)
  const mm = String(Math.floor(total / 60)).padStart(2, '0')
  const ss = String(total % 60).padStart(2, '0')

  return (
    <div role="alertdialog" aria-live="assertive" className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 px-6 text-white">
      <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-[#111827] p-6 text-center shadow-2xl">
        <p className="text-xl font-bold text-[#f87171]">You are blocked</p>
        <p className="mt-2 text-sm opacity-85">Sharing social media names or paid promotions is not allowed here.</p>
        <p className="mt-5 text-5xl font-bold tabular-nums">{mm}:{ss}</p>
        <p className="mt-3 text-xs opacity-70">You can chat again when the timer ends.</p>
      </div>
    </div>
  )
}
