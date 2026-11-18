'use client'

import { useEffect, useState } from 'react'

const MIN = 2000
const MAX = 10000

// SIMULATED number. Replace this function with the real connected-users count from your server.
function getActiveCount(now: number) {
  const d = new Date(now)
  const hour = d.getHours() + d.getMinutes() / 60
  const base = 5800 + 2700 * Math.cos((2 * Math.PI * (hour - 21)) / 24)
  const wave =
    500 * Math.sin(now / 93000) + 300 * Math.sin(now / 41000 + 1) + 100 * Math.sin(now / 17000 + 2)
  const jitter = (Math.random() - 0.5) * 16
  return Math.round(Math.min(MAX, Math.max(MIN, base + wave + jitter)))
}

export function ActiveCount() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let id = 0
    const step = () => {
      setCount(getActiveCount(Date.now()))
      id = window.setTimeout(step, 5000 + Math.random() * 6000)
    }
    step()
    return () => clearTimeout(id)
  }, [])

  return (
    <span className={count === null ? 'invisible' : undefined}>
      {(count ?? 8888).toLocaleString('en-US')}
    </span>
  )
}
