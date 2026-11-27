'use client'

import { useSearchParams } from 'next/navigation'
import { ChatRoom } from './chat-room'

// Reads ?mode=text|video in the browser (the site is a static export, so the server can't read it).
export function ChatEntry() {
  const mode = useSearchParams().get('mode')
  return <ChatRoom initialMode={mode === 'text' ? 'text' : 'video'} />
}
