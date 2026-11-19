import type { ReactNode } from 'react'
import Link from 'next/link'
import { JsonLd } from '@/components/json-ld'
import { HOME_FAQ, OMEGLE_FAQ, SITE_NAME, SITE_URL } from '@/lib/seo'

const reasons = [
  { title: 'Free and no signup', text: 'Open the site, continue anonymously and start a random chat. No download, no account, no payment.' },
  { title: 'Text chat and video chat', text: 'Type to a stranger or turn on your camera. Switch between both from the home page.' },
  { title: 'Same Country filter', text: 'Want to meet people from India or your own country only? Turn on Same Country and get matched locally.' },
  { title: 'Skip, Report and 18+ rules', text: 'Leave any chat with one tap and report anyone who breaks the rules. Only adults can use the site.' },
  { title: 'Built for phones', text: 'A clean layout that fits every screen, from a small Android phone to an iPad or a laptop.' },
  { title: 'Chat themes', text: 'Pick a Black, White or picture theme for text chat. Your choice is saved on your device.' },
]

const steps = [
  'Open Omechat in your browser. Nothing to install.',
  'Choose Text Chat or Video Chat.',
  'Continue anonymously and tap Start.',
  'Tap Skip to meet someone new, or Report if a chat feels wrong.',
]

// One collapsible row, same look as the FAQ above it. Closed content stays in the page HTML, so search engines still read it.
function Row({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group p-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold [&::-webkit-details-marker]:hidden">
        {title}
        <span
          aria-hidden="true"
          className="flex size-6 shrink-0 items-center justify-center rounded-full border text-lg leading-none text-muted-foreground transition-transform group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="mt-2 text-sm text-muted-foreground">{children}</div>
    </details>
  )
}

// Long-form Omegle alternative section at the very bottom of the home page, shown as tap-to-open rows.
export function OmegleAlternative() {
  const faq = [...OMEGLE_FAQ, ...HOME_FAQ]
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
  const pageLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Omegle alternative: free random chat with strangers',
    url: `${SITE_URL}/#omegle-alternative`,
    about: { '@type': 'WebApplication', name: SITE_NAME, url: SITE_URL },
  }

  return (
    <section id="omegle-alternative" aria-labelledby="omegle-alt-title" className="mx-auto w-full max-w-3xl scroll-mt-24 px-4 pb-16 pt-4">
      <h2 id="omegle-alt-title" className="text-balance text-2xl font-bold">
        Best Omegle alternative: free random chat with strangers
      </h2>
      <p className="mt-3 text-muted-foreground">
        Omegle closed in November 2023, and millions of people started searching for an Omegle alternative that is simple,
        free and safe. {SITE_NAME} is an independent random chat site made for exactly that. You can talk to strangers
        by text or video, skip to someone new in one tap, and start without signup. {SITE_NAME} is not connected to Omegle.
      </p>

      <div className="mt-4 divide-y rounded-3xl border bg-card/60">
        <Row title="Why choose Omechat as your Omegle alternative">
          <ul className="mt-1 space-y-2">
            {reasons.map((r) => (
              <li key={r.title}>
                <span className="font-semibold text-foreground">{r.title}.</span> {r.text}
              </li>
            ))}
          </ul>
        </Row>

        <Row title="How to use this Omegle alternative">
          <ol className="mt-1 list-decimal space-y-1.5 pl-5">
            {steps.map((s) => <li key={s}>{s}</li>)}
          </ol>
        </Row>

        <Row title="Omegle alternative with no signup">
          <p>
            Many sites like Omegle ask you to register before you can chat. On {SITE_NAME} you can continue anonymously and
            start a random text chat or random video chat right away. If you want a name and photo on your profile, you can
            optionally sign in with Google. It is your choice.
          </p>
        </Row>

        <Row title="Omegle alternative for India">
          <p>
            Looking for an Omegle alternative in India? Turn on the Same Country option and {SITE_NAME} matches you only with
            people from India. You can talk in English, Hindi or Hinglish, on any phone, without installing an app.
          </p>
        </Row>

        <Row title="Omegle ka alternative: Hinglish me">
          <p>
            Omegle jaisi website dhoondh rahe ho? {SITE_NAME} ek free random chat site hai jahan aap bina signup ke
            strangers se text ya video chat kar sakte ho. Skip button se naye insaan se turant mil sakte ho, aur Same
            Country on karke sirf apne desh ke logon se baat kar sakte ho. Sirf 18+ ke liye.
          </p>
        </Row>

        <Row title="Stay safe on any random chat site">
          <p>
            Never share your phone number, address, passwords or money details with a stranger. Use Skip or Report if a chat
            feels wrong. Read our{' '}
            <Link href="/guidelines" className="underline">community guidelines</Link>,{' '}
            <Link href="/terms" className="underline">terms</Link> and{' '}
            <Link href="/privacy" className="underline">privacy policy</Link> before you start.
          </p>
        </Row>

        {OMEGLE_FAQ.map((f) => (
          <Row key={f.q} title={f.q}>
            <p>{f.a}</p>
          </Row>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        More:{' '}
        <Link href="/omegle-alternative" className="underline">Omegle alternative</Link>,{' '}
        <Link href="/random-video-chat" className="underline">random video chat</Link>,{' '}
        <Link href="/random-text-chat" className="underline">random text chat</Link>,{' '}
        <Link href="/india-random-chat" className="underline">random chat India</Link>.
      </p>

      <JsonLd data={faqLd} />
      <JsonLd data={pageLd} />
    </section>
  )
}
