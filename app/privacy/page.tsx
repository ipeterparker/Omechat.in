import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal-page'

export const metadata: Metadata = {
  title: 'Privacy Policy \u2014 Omechat',
  alternates: { canonical: '/privacy' },
  description: 'How Omechat handles your data: what is processed, what other people see in a chat, what is saved on your device and how ads work.',
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="October 2026">
      <h2>No sign up for text chat</h2>
      <p>Text chat does not require an account, name, or email. Video chat needs a Google sign-in.</p>
      <h2>What we process</h2>
      <p>
        We process basic technical data such as your approximate country (for the Same Country filter) and connection
        details needed to pair you with a stranger.
      </p>
      <h2>Chats and video</h2>
      <p>
        Messages are passed between you and the stranger and are not stored by us. Video is sent directly between the two
        devices, so the other person's device can see your network (IP) address while you are connected.
      </p>
      <h2>What other people see</h2>
      <p>
        While you are in a chat, the person you are matched with can see your name, country and, if you added them to a
        Google profile, your photo, age and gender. Your profile and friends list are saved on your own device.
      </p>
      <h2>Saved on your device</h2>
      <p>
        We save your theme choice and a random device ID in your browser. The device ID is used to apply a short block
        after a rule violation. You can clear this data in your browser settings.
      </p>
      <h2>Advertising</h2>
      <p>
        Omechat shows ads from third-party ad networks. These networks may use cookies or similar technology to show
        and measure ads. Please read their privacy policies for details.
      </p>
      <h2>Contact</h2>
      <p>Questions? Email support@omechat.in.</p>
    </LegalPage>
  )
}
