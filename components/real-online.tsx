'use client'

import { useEffect, useState } from 'react'
import { getSocket } from '@/components/chat/socket'

// Mobile only: the real number of people connected to Omechat right now (from the chat server). Number only.
export function RealOnline() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    const onOnline = (d: { count: number }) => setCount(d.count)
    socket.on('online', onOnline)
    return () => {
      socket.off('online', onOnline)
    }
  }, [])

  if (count === null) return null
  return (
    <div className="px-4 pb-6 text-sm font-semibold text-muted-foreground lg:hidden" aria-label="People online">
      {count.toLocaleString('en-US')}
    </div>
  )
}
