import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/safety'
import { SeoLanding } from '@/components/seo-landing'
import { PAGES, SITE_NAME, SITE_URL } from '@/lib/seo'

export const dynamicParams = false

export function generateStaticParams() {
  return PAGES.map((p) => ({ slug: p.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const p = PAGES.find((x) => x.slug === slug)
  if (!p) return {}
  return {
    metadataBase: new URL(SITE_URL),
    title: { absolute: p.title },
    description: p.description,
    alternates: { canonical: `/${p.slug}` },
    openGraph: { type: 'website', url: `/${p.slug}`, siteName: SITE_NAME, title: p.title, description: p.description },
    twitter: { card: 'summary_large_image', title: p.title, description: p.description },
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const p = PAGES.find((x) => x.slug === slug)
  if (!p) notFound()
  return (
    <>
      <SiteHeader />
      <main>
        <SeoLanding page={p} />
      </main>
      <SiteFooter />
    </>
  )
}
