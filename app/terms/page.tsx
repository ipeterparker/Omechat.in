import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal-page'

export const metadata: Metadata = { title: 'Terms of Service \u2014 Bearchat' }

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="October 2026">
      <h2>Eligibility</h2>
      <p>You must be at least 18 years old to use Bearchat.</p>
      <h2>Acceptable use</h2>
      <p>
        No harassment, hate speech, nudity, spam, or illegal content. Accounts or devices that break these rules may be
        banned without notice.
      </p>
      <h2>Your responsibility</h2>
      <p>
        You are responsible for what you share. Never share personal details such as your address, passwords, or
        financial information with strangers.
      </p>
      <h2>No warranty</h2>
      <p>Bearchat is provided as-is. We may change or pause the service at any time.</p>
    </LegalPage>
  )
}
