'use client'

import { useEffect, useState } from 'react'
import { getSocket } from '@/components/chat/socket'

// Mobile only: the real number of people connected to Omechat right now (from the chat server). Number only.
export function RealOnline() {
  const [count, setCount] = useState<number | null>(null)

  // The number is only shown on phones (below the lg breakpoint, 1024px), so a desktop visitor never opens a connection here.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023.98px)')
    let off: (() => void) | null = null
    const connect = () => {
      if (off) return
      const socket = getSocket()
      if (!socket) return
      const onOnline = (d: { count: number }) => setCount(d.count)
      socket.on('online', onOnline)
      off = () => socket.off('online', onOnline)
    }
    const check = () => {
      if (mq.matches) connect()
      else if (off) {
        off()
        off = null
      }
    }
    check()
    mq.addEventListener('change', check)
    return () => {
      mq.removeEventListener('change', check)
      if (off) off()
    }
  }, [])

  if (count === null) return null
  return (
    <div className="px-4 pb-6 text-sm font-semibold text-muted-foreground lg:hidden" aria-label="People online">
      {count.toLocaleString('en-US')}
    </div>
  )
}
