'use client'

import { useEffect, useState } from 'react'

const MIN = 2000
const MAX = 10000
const STEP = 7000 // the number changes every 7 seconds, at the same moment on every device

// Small deterministic hash: same input -> same 0..1 value on every phone and laptop.
function hash(n: number) {
  let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b)
  x ^= x >>> 13
  x = Math.imul(x, 0xc2b2ae35)
  x ^= x >>> 16
  return (x >>> 0) / 4294967296
}

// SIMULATED number. It depends only on the clock (India time), so every device shows the same value at the same time.
// Replace this function with the real connected-users count from your server.
function getActiveCount(now: number) {
  const t = Math.floor(now / STEP) * STEP
  const hour = (t / 3600000 + 5.5) % 24
  const base = 5800 + 2700 * Math.cos((2 * Math.PI * (hour - 21)) / 24)
  const wave =
    500 * Math.sin(t / 93000) + 300 * Math.sin(t / 41000 + 1) + 100 * Math.sin(t / 17000 + 2)
  const jitter = (hash(t / STEP) - 0.5) * 16
  return Math.round(Math.min(MAX, Math.max(MIN, base + wave + jitter)))
}

export function ActiveCount() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let id = 0
    const step = () => {
      setCount(getActiveCount(Date.now()))
      id = window.setTimeout(step, STEP - (Date.now() % STEP) + 50)
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
