import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal-page'

export const metadata: Metadata = { title: 'Community Rules \u2014 Bearchat' }

export default function GuidelinesPage() {
  return (
    <LegalPage title="Community Rules" updated="October 2026">
      <h2>Be respectful</h2>
      <p>Treat every stranger the way you want to be treated. No insults, threats, or bullying.</p>
      <h2>Keep it clean</h2>
      <p>No nudity, sexual content, violence, or hate speech in text or on camera.</p>
      <h2>Protect yourself</h2>
      <p>Do not share personal information, and skip anyone who makes you uncomfortable.</p>
      <h2>Report problems</h2>
      <p>Use Report a problem in the menu. Our moderators review reports around the clock.</p>
    </LegalPage>
  )
}
