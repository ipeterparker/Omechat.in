'use client'

import { io, type Socket } from 'socket.io-client'

// Set NEXT_PUBLIC_SOCKET_URL (in .env.local) to your Render server. Without it the site runs in demo mode.
export const SERVER_URL = (process.env.NEXT_PUBLIC_SOCKET_URL || 'https://omechat-live-server.onrender.com')

let socket: Socket | null = null

// A random id kept in this browser, so a block (for banned words) still applies after a refresh.
function clientId(): string {
  try {
    let id = localStorage.getItem('omechat-cid')
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2)
      localStorage.setItem('omechat-cid', id)
    }
    return id
  } catch {
    return ''
  }
}

// "3 minutes" / "40 seconds" text for the block notice
export function blockText(ms: number): string {
  const s = Math.max(1, Math.ceil(ms / 1000))
  if (s >= 60) {
    const m = Math.ceil(s / 60)
    return `${m} minute${m === 1 ? '' : 's'}`
  }
  return `${s} second${s === 1 ? '' : 's'}`
}

export function getSocket(): Socket | null {
  if (!SERVER_URL) return null
  if (!socket) socket = io(SERVER_URL, { transports: ['websocket', 'polling'], auth: { cid: clientId() } })
  return socket
}
