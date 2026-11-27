import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ChatEntry } from '@/components/chat/chat-entry'

export const metadata: Metadata = {
  title: 'Chat — Omechat',
  description: 'Talk to a random stranger over text or video on Omechat.',
}

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatEntry />
    </Suspense>
  )
}
