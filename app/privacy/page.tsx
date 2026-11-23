import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal-page'

export const metadata: Metadata = { title: 'Privacy Policy \u2014 Bearchat' }

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="October 2026">
      <h2>No sign up</h2>
      <p>Bearchat does not require an account, name, or email to start chatting.</p>
      <h2>What we process</h2>
      <p>
        We process basic technical data such as your approximate country (for the Same Country filter) and connection
        details needed to pair you with a stranger.
      </p>
      <h2>Chats and video</h2>
      <p>
        Conversations are not stored after a chat ends, except for content flagged in a report, which is kept only as
        long as needed for moderation.
      </p>
      <h2>Contact</h2>
      <p>Questions? Email support@bearchat.in.</p>
    </LegalPage>
  )
}
