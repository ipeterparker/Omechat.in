import type { Metadata } from 'next'
import { JsonLd } from '@/components/json-ld'
import { LegalPage } from '@/components/legal-page'
import { HOME_FAQ, OMEGLE_FAQ } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'FAQ \u2014 Bearchat',
  description: 'Answers to common questions about Bearchat: signup, Same Country, text and video chat, safety and the Omegle alternative.',
}

export default function FaqPage() {
  const faq = [...HOME_FAQ, ...OMEGLE_FAQ]
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
  return (
    <LegalPage title="Frequently asked questions" updated="November 2026">
      {faq.map((f) => (
        <div key={f.q} className="flex flex-col gap-1">
          <h2>{f.q}</h2>
          <p>{f.a}</p>
        </div>
      ))}
      <JsonLd data={ld} />
    </LegalPage>
  )
}
