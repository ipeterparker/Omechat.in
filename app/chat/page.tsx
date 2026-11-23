import type { Metadata } from 'next'
import { ChatRoom } from '@/components/chat/chat-room'

export const metadata: Metadata = {
  title: 'Chat — Bearchat',
  description: 'Talk to a random stranger over text or video on Bearchat.',
}

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams
  return <ChatRoom initialMode={mode === 'text' ? 'text' : 'video'} />
}
