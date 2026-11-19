import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal-page'

export const metadata: Metadata = {
  title: 'Safety Tips \u2014 Omechat',
  description: 'Simple safety tips for chatting with strangers online: protect your privacy, use Skip and Report, and avoid scams.',
}

export default function SafetyPage() {
  return (
    <LegalPage title="Safety Tips" updated="November 2026">
      <h2>Keep your personal details private</h2>
      <p>Do not share your phone number, home address, school or workplace, passwords or social media accounts with a stranger.</p>
      <h2>Never send money</h2>
      <p>Anyone who asks you for money, gift cards or bank details is likely a scammer. Skip them and report the chat.</p>
      <h2>Be careful with links and files</h2>
      <p>Do not open unknown links or download files sent by a stranger. They can be harmful.</p>
      <h2>Use Skip and Report</h2>
      <p>You can leave any chat in one tap with Skip. If someone breaks the rules, use Report so they can be reviewed.</p>
      <h2>Think before you turn on your camera</h2>
      <p>In video chat, check what is visible behind you, and only share what you are comfortable with.</p>
      <h2>Do not meet strangers alone</h2>
      <p>If you ever decide to meet someone from the internet, tell a trusted person and meet in a public place.</p>
      <h2>18+ only</h2>
      <p>Omechat is for adults. If you are under 18, please do not use this site.</p>
    </LegalPage>
  )
}
