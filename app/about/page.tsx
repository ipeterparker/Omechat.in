import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal-page'

export const metadata: Metadata = {
  title: 'About Us \u2014 Omechat',
  alternates: { canonical: '/about' },
  description: 'Omechat is a free random chat website for text and video chat with strangers. Learn what Omechat is and how it works.',
}

export default function AboutPage() {
  return (
    <LegalPage title="About Omechat" updated="November 2026">
      <h2>What is Omechat?</h2>
      <p>Omechat is a free website where you can talk to random people online by text chat or video chat. Open the site, tap Start, and you are matched with a stranger. Tap Skip any time to meet someone new.</p>
      <h2>No signup needed</h2>
      <p>You can continue anonymously and start chatting right away. Signing in with Google is optional.</p>
      <h2>Same Country option</h2>
      <p>Prefer people from your own country? Keep Same Country on. Turn it off to match with people worldwide.</p>
      <h2>For adults only</h2>
      <p>You must be at least 18 years old to use Omechat. Nudity, hate speech and harassment are not allowed, and you can report anyone from inside the chat.</p>
      <h2>An independent site</h2>
      <p>Omechat is an independent website and is not connected to Omegle or any other chat service.</p>
    </LegalPage>
  )
}
