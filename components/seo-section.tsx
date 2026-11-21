import Link from 'next/link'
import { JsonLd } from '@/components/json-ld'
import { HOME_DESCRIPTION, HOME_FAQ, PAGES, SITE_NAME, SITE_URL } from '@/lib/seo'

// Extra text for search engines and visitors, placed at the bottom of the home page.
export function SeoSection() {
  const appLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: SITE_URL,
    description: HOME_DESCRIPTION,
    applicationCategory: 'SocialNetworkingApplication',
    operatingSystem: 'Any (web browser)',
    inLanguage: ['en', 'hi'],
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }
  const siteLd = { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: SITE_URL }

  return (
    <section aria-labelledby="seo-title" className="mx-auto w-full max-w-3xl px-4 py-12 lg:max-w-4xl">
      <h2 id="seo-title" className="text-balance text-2xl font-bold">Free random chat with strangers online</h2>
      <p className="mt-3 text-muted-foreground">
        {SITE_NAME} is a free random chat site. Join a random text chat or a random video chat, talk to strangers from
        around the world, and skip to someone new whenever you like. No signup is needed, and you can turn on Same Country
        to meet people from your own country. It is a simple Omegle alternative made for phones.
      </p>

      <h3 className="mt-8 text-lg font-semibold">Popular pages</h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {PAGES.map((p) => (
          <li key={p.slug}>
            <Link href={`/${p.slug}`} className="inline-block rounded-full border bg-card/70 px-4 py-2 text-sm font-semibold">
              {p.h1.split(':')[0].split(',')[0]}
            </Link>
          </li>
        ))}
      </ul>

      <h3 className="mt-8 text-lg font-semibold">Frequently asked questions</h3>
      <div className="mt-3 divide-y rounded-3xl border bg-card/60">
        {HOME_FAQ.map((f) => (
          <details key={f.q} className="p-4">
            <summary className="cursor-pointer list-none font-semibold">{f.q}</summary>
            <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>

      <JsonLd data={appLd} />
      <JsonLd data={siteLd} />
    </section>
  )
}
