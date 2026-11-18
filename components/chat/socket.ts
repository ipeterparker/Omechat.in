'use client'

import { io, type Socket } from 'socket.io-client'

// Set NEXT_PUBLIC_SOCKET_URL (in .env.local) to your Render server. Without it the site runs in demo mode.
export const SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL

let socket: Socket | null = null

export function getSocket(): Socket | null {
  if (!SERVER_URL) return null
  if (!socket) socket = io(SERVER_URL, { transports: ['websocket', 'polling'] })
  return socket
}
