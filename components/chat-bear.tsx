'use client'

import { useEffect, useRef } from 'react'

const FRAMES = 10

// Small bear (22x18). Stands still when `running` is false, runs in place while searching.
// `dark` undefined = follow the site's Light/Dark mode. true/false = fixed (chat page follows its own chat theme).
export function ChatBear({ running, dark }: { running: boolean; dark?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const frame = (i: number) => {
      el.style.backgroundPosition = `${(i * 100) / (FRAMES - 1)}% 0`
    }
    if (!running || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      frame(6)
      return
    }
    let raf = 0
    let fp = 0
    let last = performance.now()
    const tick = (now: number) => {
      fp += ((now - last) / 1000 / 0.5) * 6
      last = now
      frame(Math.floor(fp) % 6)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running])

  return (
    <span
      ref={ref}
      aria-hidden="true"
      style={{ backgroundPosition: '66.6667% 0' }}
      className={`block h-[18px] w-[22px] -translate-y-[3px] bg-[url(/images/bear-anim.png)] bg-no-repeat brightness-0 [background-size:1000%_100%] ${dark === undefined ? 'dark:invert' : dark ? 'invert' : ''}`}
    />
  )
}
