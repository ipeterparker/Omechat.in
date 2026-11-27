import Link from 'next/link'
import { JsonLd } from '@/components/json-ld'
import { PAGES, SITE_NAME, SITE_URL, type SeoPage } from '@/lib/seo'

export function SeoLanding({ page }: { page: SeoPage }) {
  const others = PAGES.filter((p) => p.slug !== page.slug)
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
  const crumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: page.h1, item: `${SITE_URL}/${page.slug}` },
    ],
  }

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
        <Link prefetch={false} href="/" className="underline">{SITE_NAME}</Link> / {page.slug.replace(/-/g, ' ')}
      </nav>
      <h1 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">{page.h1}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{page.intro}</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link prefetch={false} href="/chat?mode=text" className="flex h-12 items-center justify-center rounded-2xl border bg-card font-bold">Text Chat</Link>
        <Link prefetch={false} href="/chat?mode=video" className="flex h-12 items-center justify-center rounded-2xl bg-[#2563eb] font-bold text-white">Video Chat</Link>
      </div>

      <h2 className="mt-10 text-xl font-bold">How it works</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-muted-foreground">
        {page.steps.map((s) => <li key={s}>{s}</li>)}
      </ol>

      <h2 className="mt-10 text-xl font-bold">Why people use {SITE_NAME}</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {page.points.map((p) => (
          <div key={p.title} className="rounded-3xl border bg-card/60 p-4">
            <h3 className="font-semibold">{p.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{p.text}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-bold">Questions and answers</h2>
      <div className="mt-3 divide-y rounded-3xl border bg-card/60">
        {page.faq.map((f) => (
          <details key={f.q} className="p-4">
            <summary className="cursor-pointer list-none font-semibold">{f.q}</summary>
            <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        You must be 18 or older. Read our <Link prefetch={false} href="/guidelines" className="underline">guidelines</Link>,{' '}
        <Link prefetch={false} href="/privacy" className="underline">privacy policy</Link> and <Link prefetch={false} href="/terms" className="underline">terms</Link>.
      </p>

      <h2 className="mt-10 text-lg font-bold">More ways to chat</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {others.map((p) => (
          <li key={p.slug}>
            <Link prefetch={false} href={`/${p.slug}`} className="inline-block rounded-full border bg-card/70 px-4 py-2 text-sm font-semibold">
              {p.h1.split(':')[0].split(',')[0]}
            </Link>
          </li>
        ))}
      </ul>

      <JsonLd data={faqLd} />
      <JsonLd data={crumbLd} />
    </article>
  )
}
