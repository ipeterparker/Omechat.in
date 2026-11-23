import type { Metadata } from 'next'
import { ChatRoom } from '@/components/chat/chat-room'

export const metadata: Metadata = {
  title: 'Chat — Omechat',
  description: 'Talk to a random stranger over text or video on Omechat.',
}

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams
  return <ChatRoom initialMode={mode === 'text' ? 'text' : 'video'} />
}
